// sheets/character-sheet.js
// Character sheet for Best Left Buried characters

import { WEAPON_TYPES } from "../module/helpers/weapon-properties.js";
import { ARMOR_TYPES } from "../module/helpers/armor-properties.js";
import { CONSEQUENCE_TYPES } from "../module/helpers/item-properties.js";
import { DisplayManager } from "../module/systems/display-manager.js";
import { RollBehavior } from "./behaviors/roll-behavior.js";
import { ItemBehavior } from "./behaviors/item-behavior.js";
import { TabsBehavior } from "./behaviors/tabs-behavior.js";

/**
 * CharacterSheet - Character sheet for Best Left Buried
 * Handles display and interaction for character actors
 */
export class CharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "actor"],
    position: { width: 870, height: 700 },
    window: { 
      title: "Best Left Buried Character", 
      resizable: true,
      minimizable: true 
    },
    form: {
      handler: CharacterSheet.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      updateXP: CharacterSheet.#onUpdateXP,
      updateAdvancement: CharacterSheet.#onUpdateAdvancement,
      rollWeapon: CharacterSheet.#onRollWeapon,
      rollWeaponKh2: CharacterSheet.#onRollWeaponKh2,
      rollWeaponKl2: CharacterSheet.#onRollWeaponKl2,
      rollStat: CharacterSheet.#onRollStat,
      rollStatKh2: CharacterSheet.#onRollStatKh2,
      rollStatKl2: CharacterSheet.#onRollStatKl2,
      rollAdvancement: CharacterSheet.#onRollAdvancement,
      rollConsequence: CharacterSheet.#onRollConsequence,
      openItem: CharacterSheet.#onOpenItem,
      deleteItem: CharacterSheet.#onDeleteItem,
      toggleEquip: CharacterSheet.#onToggleEquip,
      toggleActive: CharacterSheet.#onToggleActive
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/best-left-buried/templates/actor-v2.hbs"
    }
  };

  constructor(...args) {
    super(...args);
    this.activeTab = "character";
    this._externalTabs = null;
    this._animationFrame = null;
    this._scrollPosition = undefined;
  }

  /** @override */
  async _prepareContext(options) {
    this._scrollPosition = DisplayManager.captureScrollPosition(this.element);
    
    const doc = this.document;
    const src = doc.toObject();
    const rollData = doc.getRollData();
  
    const context = {
      actor: doc,
      source: src,
      system: doc.system,
      rollData: rollData,
      WEAPON_TYPES,
      ARMOR_TYPES,
      CONSEQUENCE_TYPES,
      items: await this._prepareItems(doc.items),
      activeTab: this.activeTab
    };
  
    this._prepareArmor(context);
    return context;
  }

  async _prepareItems(items) {
    const organized = {
      weapon: [],
      armor: [],
      advancement: [],
      consequence: [],
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

  _prepareArmor(context) {
    const system = context.system;
    let armorBonus = 0;
    let armorTotal = system.armor?.base || 7;
    
    for (const armor of context.items.armor) {
      if (armor.system.equipped) {
        if (armor.system.armorType === "basic") armorBonus += 1;
        else if (armor.system.armorType === "plate") armorBonus += 2;
        else if (armor.system.armorType === "shield") armorBonus += 1;
      }
    }
    
    armorTotal += armorBonus;
    context.system.armorBonus = armorBonus;
    context.system.armorTotal = armorTotal;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    
    DisplayManager.restoreScrollPosition(this.element, this._scrollPosition);
    this._scrollPosition = undefined;
    
    this._activateTab(this.activeTab);
    setTimeout(() => this._createExternalTabs(), 100);
    
    DisplayManager.setupPortraitSelector(this.element, this.document, this.position);
    this._setupItemChangeListeners();
  }

  _activateTab(tabName) {
    if (!this.element) return;
    
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

  _setupItemChangeListeners() {
    DisplayManager.watchItemChanges(this.document, () => {
      DisplayManager.refreshEncumbranceDisplay(this.document, this.element);
      if (this.element) {
        this.render(false);
      }
    });

    Hooks.on('updateItem', (item, changes, options, userId) => {
      if (item.parent === this.document) {
        if (changes.system?.slotValue !== undefined) {
          DisplayManager.refreshEncumbranceDisplay(this.document, this.element);
        }
        if (changes.system?.description !== undefined) {
          this.render(false);
        }
      }
    });

    Hooks.on('createItem', (item, options, userId) => {
      if (item.parent === this.document && item.system.slotValue > 0) {
        DisplayManager.refreshEncumbranceDisplay(this.document, this.element);
      }
    });
  }

  _createExternalTabs() {
    this._cleanupExternalTabs();

    const windowElement = this.element;
    if (!windowElement) return;

    this._externalTabs = TabsBehavior.createFloatingTabs(
      windowElement,
      this.activeTab,
      (tabId) => this._switchToTab(tabId)
    );

    document.body.appendChild(this._externalTabs);
    
    this._animationFrame = TabsBehavior.startPositionTracking(
      this._externalTabs,
      windowElement
    );
  }

  _switchToTab(tabId) {
    this.activeTab = tabId;
    this._activateTab(tabId);
    TabsBehavior.updateActiveTab(this._externalTabs, this.activeTab);
  }

  _cleanupExternalTabs() {
    TabsBehavior.cleanupFloatingTabs(this._externalTabs, this._animationFrame);
    this._externalTabs = null;
    this._animationFrame = null;
  }

  async close(options = {}) {
    this._cleanupExternalTabs();
    return super.close(options);
  }

  // Event handlers
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onUpdateXP(event, target) {
    await ItemBehavior.handleUpdateExperience(event, target, this.document);
  }

  static async #onUpdateAdvancement(event, target) {
    await ItemBehavior.handleUpdateAdvancement(event, target, this.document);
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

  static async #onRollConsequence(event, target) {
    await RollBehavior.handleConsequenceRoll(event, target, this.document);
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

  static async #onToggleActive(event, target) {
    await ItemBehavior.handleToggleActive(event, target, this.document);
  }
}