// sheets/actor-sheet-v2.js - Cleaned and Optimized External Tabs

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "../module/helpers/armor.js";
import { ADVANCEMENT_TYPES, LOOT_TYPES } from "../module/helpers/new_items.js";

export class BLBActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "actor"],
    position: { width: 700, height: 800 },
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
      rollAdvancement: BLBActorSheetV2.#onRollAdvancement,
      openItem: BLBActorSheetV2.#onOpenItem,
      deleteItem: BLBActorSheetV2.#onDeleteItem,
      toggleEquip: BLBActorSheetV2.#onToggleEquip
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
    this.activeTab = "stats";
    this._externalTabs = null;
    this._animationFrame = null;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const doc = this.document;
    const src = doc.toObject();
    const rollData = doc.getRollData();
    
    const context = {
      actor: doc,
      source: src,
      system: doc.system,
      rollData: rollData,
      
      // Helper constants
      WEAPON_TYPES,
      ARMOR_TYPES,
      SHIELD_TYPES,
      ADVANCEMENT_TYPES,
      LOOT_TYPES,

      // Items
      items: this._prepareItems(doc.items),
      actions: this._prepareActions(doc.items),

      // Tab state
      activeTab: this.activeTab
    };
    
    this._prepareArmor(context);
    return context;
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._activateTab(this.activeTab);
    
    // Create external tabs after a brief delay for DOM stabilization
    setTimeout(() => this._createExternalTabs(), 100);
  }

  /* -------------------------------------------- */
  /*  External Tabs System                        */
  /* -------------------------------------------- */

  /**
   * Create external tabs positioned outside the window
   */
  _createExternalTabs() {
    this._cleanupExternalTabs();

    const windowElement = this.element;
    if (!windowElement) return;

    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'blb-external-tabs';
    
    // Create navigation
    const tabsNav = document.createElement('nav');
    tabsNav.className = 'sheet-tabs tabs';
    tabsNav.setAttribute('data-group', 'primary');

    // Tab definitions
    const tabs = [
      { id: 'stats', label: 'Stats' },
      { id: 'equipment', label: 'Equipment' },
      { id: 'advancements', label: 'Empty' }
    ];

    // Create tab buttons
    tabs.forEach(tab => {
      const tabButton = document.createElement('a');
      tabButton.className = `item ${this.activeTab === tab.id ? 'active' : ''}`;
      tabButton.dataset.tab = tab.id;
      tabButton.textContent = tab.label;
      
      tabButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._switchToTab(tab.id);
      });

      tabsNav.appendChild(tabButton);
    });

    tabsContainer.appendChild(tabsNav);
    
    // Position and add to DOM
    this._positionExternalTabs(tabsContainer, windowElement);
    document.body.appendChild(tabsContainer);
    this._externalTabs = tabsContainer;

    // Start smooth position tracking
    this._startPositionTracking(windowElement);
  }

  /**
   * Position external tabs outside the window
   */
_positionExternalTabs(tabsContainer, windowElement) {
  const rect = windowElement.getBoundingClientRect();
  const tabsX = rect.right + 100;
  const tabsY = rect.top + 200; // Same fixed offset

  tabsContainer.style.position = 'fixed';
  tabsContainer.style.left = `${tabsX}px`;
  tabsContainer.style.top = `${tabsY}px`;
  tabsContainer.style.zIndex = '10001';
}

  /**
   * Start smooth position tracking using requestAnimationFrame
   */
_startPositionTracking(windowElement) {
  let lastX = 0, lastY = 0;
  let fixedYOffset = null; // Store the initial Y offset
  
  const updatePosition = () => {
    if (!this._externalTabs || !windowElement || !document.body.contains(windowElement)) {
      this._cleanupExternalTabs();
      return;
    }

    const rect = windowElement.getBoundingClientRect();
    
    // Set fixed Y offset on first run
    if (fixedYOffset === null) {
      fixedYOffset = + 120; // Fixed distance from window top - adjust this value
    }
    
    let newX = rect.right - 79;
    let newY = rect.top + fixedYOffset; // Use fixed offset instead of centering

    // Keep tabs on screen - clamp to viewport bounds
    const maxX = window.innerWidth - 150;
    const minX = 10;
    const maxY = window.innerHeight - 30;
    const minY = 10;

    newX = Math.min(Math.max(newX, minX), maxX);
    newY = Math.min(Math.max(newY, minY), maxY);

    if (newX !== lastX || newY !== lastY) {
      this._externalTabs.style.left = `${newX}px`;
      this._externalTabs.style.top = `${newY}px`;
      lastX = newX;
      lastY = newY;
    }

    this._animationFrame = requestAnimationFrame(updatePosition);
  };

  this._animationFrame = requestAnimationFrame(updatePosition);
}

  /**
   * Switch to a specific tab
   */
  _switchToTab(tabId) {
    this.activeTab = tabId;
    this._activateTab(tabId);
    this._updateExternalTabStates();
  }

  /**
   * Activate tab content in the sheet
   */
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

  /**
   * Update external tab visual states
   */
  _updateExternalTabStates() {
    if (!this._externalTabs) return;

    const tabButtons = this._externalTabs.querySelectorAll('.item');
    tabButtons.forEach(button => {
      if (button.dataset.tab === this.activeTab) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  /**
   * Cleanup external tabs and animations
   */
  _cleanupExternalTabs() {
    if (this._externalTabs && document.body.contains(this._externalTabs)) {
      this._externalTabs.remove();
    }
    this._externalTabs = null;

    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }
  }

  /**
   * Override close to cleanup external tabs
   */
  async close(options = {}) {
    this._cleanupExternalTabs();
    return super.close(options);
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  _prepareItems(items) {
    const organized = {
      weapon: [],
      armor: [],
      shield: [],
      advancement: [],
      loot: []
    };
    
    for (const item of items) {
      if (item.type in organized) {
        organized[item.type].push(item);
      }
    }
    
    // Sort weapons by type
    organized.weapon.sort((a, b) => {
      const typeOrder = ["hand", "heavy", "light", "long", "ranged", "throwing"];
      const aIndex = typeOrder.indexOf(a.system.weaponType || "hand");
      const bIndex = typeOrder.indexOf(b.system.weaponType || "hand");
      
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.name.localeCompare(b.name);
    });
    
    organized.armor.sort((a, b) => a.name.localeCompare(b.name));
    organized.shield.sort((a, b) => a.name.localeCompare(b.name));
    
    return organized;
  }

  _prepareActions(items) {
    const actions = {
      weapons: [],
      advancements: []
    };
    
    actions.weapons = items.filter(item => 
      item.type === "weapon" && item.system.equipped
    );
    
    actions.advancements = items.filter(item => 
      item.type === "advancement" && item.system.equipped
    );
    
    return actions;
  }

  _prepareArmor(context) {
    const system = context.system;
    let armorBonus = 0;
    let armorTotal = system.armor?.base || 7;
    
    for (const armor of context.items.armor) {
      if (armor.system.equipped) {
        if (armor.system.armorType === "basic") armorBonus += 1;
        else if (armor.system.armorType === "plate") armorBonus += 2;
      }
    }
    
    for (const shield of context.items.shield) {
      if (shield.system.equipped) armorBonus += 1;
    }
    
    armorTotal += armorBonus;
    
    context.system.armorBonus = armorBonus;
    context.system.armorTotal = armorTotal;
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onUpdateXP(event, target) {
    const change = target.dataset.change === "increase" ? 1 : -1;
    const currentXP = this.document.system.xp || 0;
    const newXP = Math.max(0, currentXP + change);
    
    await this.document.update({ "system.xp": newXP });
  }

  static async #onRollWeapon(event, target) {
    const weaponId = target.dataset.weaponId;
    const weapon = this.document.items.get(weaponId);
    
    if (!weapon) return;
    
    const weaponType = weapon.system.weaponType || "hand";
    const weaponData = WEAPON_TYPES[weaponType];
    
    if (!weaponData) return;
    
    const attackStat = weaponData.attackStat;
    const attackValue = this.document.system[attackStat + "Total"] || this.document.system[attackStat]?.base || 0;
    
    const roll = await new Roll(`1d20 + ${attackValue}`).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} Attack Roll`
    });
    
    let damage = weaponData.damageMod || 0;
    if (weapon.system.isTwoHanded && weaponData.twoHandedBonus) damage += 1;
    
    const damageRoll = await new Roll(`1d6 + ${damage}`).evaluate();
    damageRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} Damage`
    });
  }

  static async #onRollAdvancement(event, target) {
    const advancementId = target.dataset.advancementId;
    const advancement = this.document.items.get(advancementId);
    
    if (!advancement) return;
    
    let rollFormula = advancement.system.rollFormula || "1d20";
    
    if (advancement.system.usesAttribute !== "none") {
      const attrValue = this.document.system[advancement.system.usesAttribute + "Total"] || 
                       this.document.system[advancement.system.usesAttribute]?.base || 0;
      rollFormula += ` + ${attrValue}`;
    }
    
    const roll = await new Roll(rollFormula).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${advancement.name} Roll`
    });
  }

  static async #onOpenItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  static async #onDeleteItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Delete Item" },
      content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
      modal: true,
      rejectClose: false
    });
    
    if (confirmed) {
      const itemRow = target.closest("[data-item-id]");
      if (itemRow) itemRow.remove();
      await item.delete({ render: false });
    }
  }

  static async #onToggleEquip(event, target) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    
    const isEquipped = target.checked;
    
    try {
      await item.update({ "system.equipped": isEquipped }, { render: true });
      
      // Handle exclusive equipment (armor/shields)
      if ((item.type === "armor" || item.type === "shield") && isEquipped) {
        const others = this.document.items.filter(i => 
          i.type === item.type && i.id !== itemId && i.system.equipped
        );
        
        for (const other of others) {
          await other.update({ "system.equipped": false }, { render: false });
          
          const otherCheckbox = this.element.querySelector(`input[data-item-id="${other.id}"]`);
          if (otherCheckbox) {
            otherCheckbox.checked = false;
          }
        }
      }
      
      // Update armor display
      this._updateArmorDisplay();
      target.checked = isEquipped;
      
    } catch (error) {
      console.error("Error in equipment toggle:", error);
      target.checked = !isEquipped;
    }
  }

  _updateArmorDisplay() {
    const armorBonusEl = this.element?.querySelector('.armor-bonus');
    let armorTotalEl = null;
    
    const statBoxes = this.element?.querySelectorAll('.stat-box') || [];
    for (const box of statBoxes) {
      const statName = box.querySelector('.stat-name');
      if (statName && statName.textContent.trim() === 'Armor') {
        armorTotalEl = box.querySelector('.total-score');
        break;
      }
    }
    
    if (armorBonusEl && armorTotalEl) {
      let armorBonus = 0;
      const armorBase = this.document.system.armor?.base || 7;
      
      const equippedArmor = this.document.items.filter(item => 
        item.type === "armor" && item.system.equipped
      );
      const equippedShields = this.document.items.filter(item => 
        item.type === "shield" && item.system.equipped
      );
      
      for (const armor of equippedArmor) {
        if (armor.system.armorType === "basic") armorBonus += 1;
        else if (armor.system.armorType === "plate") armorBonus += 2;
      }
      
      for (const shield of equippedShields) {
        armorBonus += 1;
      }
      
      armorBonusEl.textContent = armorBonus;
      armorTotalEl.textContent = armorBase + armorBonus;
    }
  }
}