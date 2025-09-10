// sheets/actor-sheet-v2.js - FIXED ApplicationV2 Actor Sheet

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "../module/helpers/armor.js";

export class BLBActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "actor"],
    position: { width: 1000, height: 900 },
    window: { title: "Best Left Buried Character" },
    form: {
      handler: BLBActorSheetV2.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      updateXP: BLBActorSheetV2.#onUpdateXP,
      rollWeapon: BLBActorSheetV2.#onRollWeapon,
      openItem: BLBActorSheetV2.#onOpenItem,
      deleteItem: BLBActorSheetV2.#onDeleteItem,
      toggleEquip: BLBActorSheetV2.#onToggleEquip,
      switchTab: BLBActorSheetV2.#onSwitchTab
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/best-left-buried/templates/actor-v2.hbs"
    }
  };

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const doc = this.document;
    const src = doc.toObject();
    const rollData = doc.getRollData();
    
    // Basic context
    const context = {
      actor: doc,
      source: src,
      system: doc.system,
      rollData: rollData,
      
      // Helper constants
      WEAPON_TYPES,
      ARMOR_TYPES,
      SHIELD_TYPES,
      
      // Items
      items: this._prepareItems(doc.items)
    };
    
    // Add armor calculations
    this._prepareArmor(context);
    
    return context;
  }

  /**
   * Organize items for display
   */
  _prepareItems(items) {
    const organized = {
      weapon: [],
      armor: [],
      shield: []
    };
    
    for (const item of items) {
      if (item.type in organized) {
        organized[item.type].push(item);
      }
    }
    
    // Sort weapons by type, then name
    organized.weapon.sort((a, b) => {
      const typeOrder = ["hand", "heavy", "light", "long", "ranged", "throwing"];
      const aIndex = typeOrder.indexOf(a.system.type || "hand");
      const bIndex = typeOrder.indexOf(b.system.type || "hand");
      
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.name.localeCompare(b.name);
    });
    
    // Sort armor and shields by name
    organized.armor.sort((a, b) => a.name.localeCompare(b.name));
    organized.shield.sort((a, b) => a.name.localeCompare(b.name));
    
    return organized;
  }

  /**
   * Calculate armor totals
   */
  _prepareArmor(context) {
    const system = context.system;
    let armorBonus = 0;
    let armorTotal = system.armor?.base || 7;
    
    // Add equipped armor bonuses
    for (const armor of context.items.armor) {
      if (armor.system.equipped) {
        if (armor.system.armorType === "basic") armorBonus += 1;
        else if (armor.system.armorType === "plate") armorBonus += 2;
      }
    }
    
    // Add equipped shield bonuses
    for (const shield of context.items.shield) {
      if (shield.system.equipped) armorBonus += 1;
    }
    
    armorTotal += armorBonus;
    
    // Add to context
    context.system.armorBonus = armorBonus;
    context.system.armorTotal = armorTotal;
  }

  /* -------------------------------------------- */
  /*  Event Handlers                             */
  /* -------------------------------------------- */

  /**
   * Handle form submission
   */
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  /**
   * Handle XP update
   */
  static async #onUpdateXP(event, target) {
    const change = target.dataset.change === "increase" ? 1 : -1;
    const currentXP = this.document.system.xp || 0;
    const newXP = Math.max(0, currentXP + change);
    
    await this.document.update({ "system.xp": newXP });
  }

  /**
   * Handle weapon rolling
   */
  static async #onRollWeapon(event, target) {
    const weaponId = target.dataset.weaponId;
    const weapon = this.document.items.get(weaponId);
    
    if (!weapon) return;
    
    const weaponType = weapon.system.weaponType || "hand";
    const weaponData = WEAPON_TYPES[weaponType];
    
    if (!weaponData) return;
    
    const attackStat = weaponData.attackStat;
    const attackValue = this.document.system[attackStat + "Total"] || this.document.system[attackStat]?.base || 0;
    
    // Simple attack roll for now
    const roll = await new Roll(`1d20 + ${attackValue}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} Attack Roll`
    });
    
    // Damage roll
    let damage = weaponData.damageMod || 0;
    if (weapon.system.isTwoHanded && weaponData.twoHandedBonus) damage += 1;
    
    const damageRoll = await new Roll(`1d6 + ${damage}`).evaluate();
    damageRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} Damage`
    });
  }

  /**
   * Handle item opening
   */
  static async #onOpenItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  /**
   * Handle item deletion
   */
  static async #onDeleteItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (item) await item.delete();
  }

  /**
   * Handle tab switching
   */
  static async #onSwitchTab(event, target) {
    const tabName = target.dataset.tab;
    this._switchToTab(tabName);
  }

  /**
   * Handle equipment toggle
   */
  static async #onToggleEquip(event, target) {
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    
    const isEquipped = target.checked;
    
    // Handle mutual exclusion
    if ((item.type === "armor" || item.type === "shield") && isEquipped) {
      const others = this.document.items.filter(i => 
        i.type === item.type && i.id !== itemId && i.system.equipped
      );
      
      for (const other of others) {
        await other.update({ "system.equipped": false });
      }
    }
    
    await item.update({ "system.equipped": isEquipped });
  }
  
}