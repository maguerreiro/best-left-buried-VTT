// sheets/npc-sheet.js
// NPC sheet for Best Left Buried

import { WEAPON_TYPES } from "../module/helpers/weapon-properties.js";
import { ARMOR_TYPES } from "../module/helpers/armor-properties.js";
import { DisplayManager } from "../module/systems/display-manager.js";
import { RollBehavior } from "./behaviors/roll-behavior.js";
import { ItemBehavior } from "./behaviors/item-behavior.js";

export class NPCSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "npc"],
    position: { width: 820, height: 600 },
    window: { 
      title: "NPC", 
      resizable: true,
      minimizable: true 
    },
    form: {
      handler: NPCSheet.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      rollWeapon: NPCSheet.#onRollWeapon,
      rollWeaponKh2: NPCSheet.#onRollWeaponKh2,
      rollWeaponKl2: NPCSheet.#onRollWeaponKl2,
      rollStat: NPCSheet.#onRollStat,
      rollStatKh2: NPCSheet.#onRollStatKh2,
      rollStatKl2: NPCSheet.#onRollStatKl2,
      rollAdvancement: NPCSheet.#onRollAdvancement,
      openItem: NPCSheet.#onOpenItem,
      deleteItem: NPCSheet.#onDeleteItem,
      toggleEquip: NPCSheet.#onToggleEquip
    }
  };

  static PARTS = {
    form: {
      template: "systems/best-left-buried_V3/templates/npc.hbs"
    }
  };

  constructor(...args) {
    super(...args);
    this._scrollPosition = undefined;
  }

  async _prepareContext(options) {
    this._scrollPosition = DisplayManager.captureScrollPosition(this.element);
    
    const doc = this.document;
    const src = doc.toObject();
    const rollData = doc.getRollData();
    const items = await this._prepareItems(doc.items);

    return {
      actor: doc,
      source: src,
      system: doc.system,
      rollData: rollData,
      WEAPON_TYPES,
      ARMOR_TYPES,
      items: items,
      hasAnyAdaptationUses: items.advancement.some(i => i.system.hasUses === true)
    };
  }

  async _prepareItems(items) {
    const organized = {
      weapon: [],
      armor: [],
      advancement: [],
      loot: []
    };
    
    for (const item of items) {
      if (item.type in organized) {
        item.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
          item.system.description || "", 
          {
            async: true,
            secrets: item.isOwner,
            relativeTo: item
          }
        );
        organized[item.type].push(item);
      }
    }
    
    for (const type in organized) {
      organized[type].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return organized;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    
    DisplayManager.restoreScrollPosition(this.element, this._scrollPosition);
    this._scrollPosition = undefined;
    
    DisplayManager.setupPortraitSelector(this.element, this.document, this.position);
  }

  // Event handlers
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onRollStat(event, target) {
    await RollBehavior.handleAttributeCheck(event, target, this.document);
  }

  static async #onRollStatKh2(event, target) {
    await RollBehavior.handleAttributeCheckUpperHand(event, target, this.document);
  }

  static async #onRollStatKl2(event, target) {
    await RollBehavior.handleAttributeCheckAgainstOdds(event, target, this.document);
  }

  static async #onRollWeapon(event, target) {
    await RollBehavior.handleWeaponAttack(event, target, this.document);
  }

  static async #onRollWeaponKh2(event, target) {
    await RollBehavior.handleWeaponAttackUpperHand(event, target, this.document);
  }

  static async #onRollWeaponKl2(event, target) {
    await RollBehavior.handleWeaponAttackAgainstOdds(event, target, this.document);
  }

  static async #onRollAdvancement(event, target) {
    await RollBehavior.handleAdvancementRoll(event, target, this.document);
  }

  static async #onOpenItem(event, target) {
    await ItemBehavior.handleOpenItemSheet(event, target, this.document);
  }

  static async #onDeleteItem(event, target) {
    await ItemBehavior.handleDeleteItem(event, target, this.document, this);
  }

  static async #onToggleEquip(event, target) {
    await ItemBehavior.handleToggleEquipped(event, target, this.document, this);
  }

  _attachPartListeners(partId, htmlElement, options) {
    super._attachPartListeners(partId, htmlElement, options);
    
    // Uses inputs for adaptations
    const usesInputs = htmlElement.querySelectorAll('.uses-current[data-item-id]');
    usesInputs.forEach(input => {
      input.addEventListener('change', async (event) => {
        const itemId = event.target.dataset.itemId;
        const item = this.document.items.get(itemId);
        if (item) {
          const newValue = parseInt(event.target.value) || 0;
          const maxValue = item.system.uses.max || 0;
          const clampedValue = Math.max(0, Math.min(newValue, maxValue));
          
          await item.update({ "system.uses.current": clampedValue }, { render: false });
          event.target.value = clampedValue;
        }
      });
    });
  }
}