// sheets/actor-sheet-v2.js - COMPLETE FIXED VERSION

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "../module/helpers/armor.js";

export class BLBActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "actor"],
    position: { width: 1000, height: 900 },
    window: { 
      title: "Best Left Buried Character", 
      resizable: true, 
      minimizable: true 
    },
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
  /*  Tab Management                              */
  /* -------------------------------------------- */

  /** Track the active tab and scroll position per instance */
  constructor(...args) {
    super(...args);
    this.activeTab = "stats";
    this.scrollPosition = 0;
  }

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
      items: this._prepareItems(doc.items),
      
      // Tab state
      activeTab: this.activeTab
    };
    
    // Add armor calculations
    this._prepareArmor(context);
    
    return context;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    
    // Ensure correct tab is active after render
    this._activateTab(this.activeTab);
    
    // Restore scroll position after render with multiple attempts
    if (this.scrollPosition > 0) {
      console.log("Attempting to restore scroll position:", this.scrollPosition);
      
      // Try multiple times with different delays to ensure it works
      const restoreScroll = () => {
        const container = this.element.querySelector('.sheet-container');
        if (container && container.scrollTop !== this.scrollPosition) {
          container.scrollTop = this.scrollPosition;
          console.log("Restored scroll to:", this.scrollPosition);
        }
      };
      
      // Try immediately
      restoreScroll();
      
      // Try after a short delay
      setTimeout(restoreScroll, 25);
      
      // Try after a longer delay
      setTimeout(restoreScroll, 100);
      
      // Try one more time to be sure
      setTimeout(restoreScroll, 200);
    }
  }

  /** @override */
  _onClose(options) {
    // Save scroll position before closing
    this._saveScrollPosition();
    return super._onClose(options);
  }

  /**
   * Save the current scroll position
   */
  _saveScrollPosition() {
    if (this.element) {
      const container = this.element.querySelector('.sheet-container');
      if (container) {
        this.scrollPosition = container.scrollTop;
      }
    }
  }

  /**
   * Activate a specific tab
   */
  _activateTab(tabName) {
    if (!this.element) return;
    
    // Update tab navigation
    const tabs = this.element.querySelectorAll('.tabs .item');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update tab content
    const tabContents = this.element.querySelectorAll('.tab[data-tab]');
    tabContents.forEach(content => {
      if (content.dataset.tab === tabName) {
        content.classList.add('active');
        content.style.display = 'block';
      } else {
        content.classList.remove('active');
        content.style.display = 'none';
      }
    });
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
      const aIndex = typeOrder.indexOf(a.system.weaponType || "hand");
      const bIndex = typeOrder.indexOf(b.system.weaponType || "hand");
      
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
   * Handle item deletion with confirmation and scroll preservation
   */
  static async #onDeleteItem(event, target) {
    // Save all scroll positions before deletion
    this._saveAllScrollPositions();
    
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (item) {
      const confirmed = await Dialog.confirm({
        title: "Delete Item",
        content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
        defaultYes: false
      });
      
      if (confirmed) {
        await item.delete();
      }
    }
  }

  /**
   * Handle tab switching via action system
   */
  static async #onSwitchTab(event, target) {
    const tabName = target.dataset.tab;
    this.activeTab = tabName;
    this._activateTab(tabName);
  }

  /**
   * Handle equipment toggle with scroll preservation
   */
  static async #onToggleEquip(event, target) {
    // Save scroll position before any updates
    this._saveScrollPosition();
    
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