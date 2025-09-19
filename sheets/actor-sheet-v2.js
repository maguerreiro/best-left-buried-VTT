// sheets/actor-sheet-v2.js - Compact redesigned sheet

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES } from "../module/helpers/armor.js";
import { ADVANCEMENT_TYPES, CONSEQUENCE_TYPES, LOOT_TYPES } from "../module/helpers/new_items.js";

export class BLBActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "actor"],
    position: { width: 800, height: 700 },
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
      updateAdvancement: BLBActorSheetV2.#onUpdateAdvancement,
      rollWeapon: BLBActorSheetV2.#onRollWeapon,
      rollAdvancement: BLBActorSheetV2.#onRollAdvancement,
      rollConsequence: BLBActorSheetV2.#onRollConsequence,
      openItem: BLBActorSheetV2.#onOpenItem,
      deleteItem: BLBActorSheetV2.#onDeleteItem,
      toggleEquip: BLBActorSheetV2.#onToggleEquip,
      toggleActive: BLBActorSheetV2.#onToggleActive
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
  }

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
      ADVANCEMENT_TYPES,
      CONSEQUENCE_TYPES,
      LOOT_TYPES,

      // Items
      items: this._prepareItems(doc.items),

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
    setTimeout(() => this._createExternalTabs(), 100);
  }

  _createExternalTabs() {
    this._cleanupExternalTabs();

    const windowElement = this.element;
    if (!windowElement) return;

    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'blb-external-tabs';
    
    const tabsNav = document.createElement('nav');
    tabsNav.className = 'sheet-tabs tabs';
    tabsNav.setAttribute('data-group', 'primary');

    const tabs = [
      { id: 'character', label: 'Character' },
      { id: 'equipment', label: 'Equipment' }
    ];

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
    this._positionExternalTabs(tabsContainer, windowElement);
    document.body.appendChild(tabsContainer);
    this._externalTabs = tabsContainer;
    this._startPositionTracking(windowElement);
  }

  _positionExternalTabs(tabsContainer, windowElement) {
    const rect = windowElement.getBoundingClientRect();
    const tabsX = rect.right + 15;
    const tabsY = rect.top + (rect.height / 2);

    tabsContainer.style.position = 'fixed';
    tabsContainer.style.left = `${tabsX}px`;
    tabsContainer.style.top = `${tabsY}px`;
    tabsContainer.style.zIndex = '10001';
  }

  _startPositionTracking(windowElement) {
    let lastX = 0, lastY = 0;
    
    const updatePosition = () => {
      if (!this._externalTabs || !windowElement || !document.body.contains(windowElement)) {
        this._cleanupExternalTabs();
        return;
      }

      const rect = windowElement.getBoundingClientRect();
      const newX = rect.right - 50;
      const newY = rect.top + (rect.height / 2) - 250;

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

  _switchToTab(tabId) {
    this.activeTab = tabId;
    this._activateTab(tabId);
    this._updateExternalTabStates();
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

  async close(options = {}) {
    this._cleanupExternalTabs();
    return super.close(options);
  }

  _prepareItems(items) {
    const organized = {
      weapon: [],
      armor: [],
      advancement: [],
      consequence: [],
      loot: []
    };
    
    for (const item of items) {
      if (item.type in organized) {
        organized[item.type].push(item);
      }
    }
    
    // Sort items
    organized.weapon.sort((a, b) => a.name.localeCompare(b.name));
    organized.armor.sort((a, b) => a.name.localeCompare(b.name));
    organized.advancement.sort((a, b) => a.name.localeCompare(b.name));
    organized.consequence.sort((a, b) => a.name.localeCompare(b.name));
    organized.loot.sort((a, b) => a.name.localeCompare(b.name));
    
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

  // Event Handlers
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

  static async #onUpdateAdvancement(event, target) {
    const change = target.dataset.change === "increase" ? 1 : -1;
    const currentAdv = this.document.system.advancement || 0;
    const newAdv = Math.max(0, currentAdv + change);
    await this.document.update({ "system.advancement": newAdv });
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
    
    let damage = weaponData.damageMod || 0;
    if (weapon.system.isTwoHanded && weaponData.twoHandedBonus) damage += 1;

    // Evaluate the roll as before
    const roll = await new Roll(`3d6 + ${attackValue} + ${damage}`).evaluate();

    // Get the results of each die from the first dice term
    const dieResults = roll.dice[0].results.map(r => r.result);
    
    // Construct the text to display, including individual die rolls
    let resultText = `
        <div class="dice-roll">
            <div class="dice-result">
                <div class="dice-formula">${roll.formula}</div>
                <h4 class="dice-total">
                    ${dieResults.join(" + ")}
                </h4>
            </div>
        </div>
    `;

    // Create a chat message using the custom content
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.document }),
        flavor: `${weapon.name}: ${attackStat}: ${attackValue}, DamageMod: ${damage}`,
        content: resultText
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

  static async #onRollConsequence(event, target) {
    const consequenceId = target.dataset.consequenceId;
    const consequence = this.document.items.get(consequenceId);
    
    if (!consequence) return;
    
    let rollFormula = consequence.system.rollFormula || "1d20";
    
    if (consequence.system.usesAttribute !== "none") {
      const attrValue = this.document.system[consequence.system.usesAttribute + "Total"] || 
                       this.document.system[consequence.system.usesAttribute]?.base || 0;
      rollFormula += ` + ${attrValue}`;
    }
    
    const roll = await new Roll(rollFormula).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${consequence.name} Roll`
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
      // Remove the item row from the DOM first to prevent scrollbar jump
      const itemRow = target.closest("[data-item-id]");
      if (itemRow) {
        itemRow.remove();
      }
      
      // Delete the item without re-rendering the sheet
      await item.delete({ render: false });
      
      // If it was armor/shield, update the armor display
      if (item.type === "armor" && item.system.equipped) {
        this._updateArmorDisplay();
      }
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
      // Update item without re-rendering the sheet to avoid scrollbar jump
      await item.update({ "system.equipped": isEquipped }, { render: false });
      
      // Handle exclusive equipment (armor/shields)
      if (item.type === "armor" && isEquipped) {
        const armorType = item.system.armorType;
        let conflictTypes = [];
        
        if (armorType === "basic" || armorType === "plate") {
          conflictTypes = ["basic", "plate"];
        } else if (armorType === "shield") {
          conflictTypes = ["shield"];
        }
        
        const others = this.document.items.filter(i => 
          i.type === "armor" && 
          i.id !== itemId && 
          i.system.equipped && 
          conflictTypes.includes(i.system.armorType)
        );
        
        for (const other of others) {
          await other.update({ "system.equipped": false }, { render: false });
          
          // Manually update the other checkboxes in the UI
          const otherCheckbox = this.element.querySelector(`input[data-item-id="${other.id}"]`);
          if (otherCheckbox) {
            otherCheckbox.checked = false;
          }
        }
      }
      
      // Update armor display manually
      this._updateArmorDisplay();
      
      // Ensure the clicked checkbox state is correct
      target.checked = isEquipped;
      
    } catch (error) {
      console.error("Error in equipment toggle:", error);
      target.checked = !isEquipped; // Revert on error
    }
  }

  _updateArmorDisplay() {
    const armorBonusEl = this.element?.querySelector('.armor-bonus');
    let armorTotalEl = null;
    
    const statBoxes = this.element?.querySelectorAll('.armor-display') || [];
    for (const box of statBoxes) {
      armorTotalEl = box.querySelector('.armor-total');
      if (armorTotalEl) break;
    }
    
    if (armorBonusEl && armorTotalEl) {
      let armorBonus = 0;
      const armorBase = this.document.system.armor?.base || 7;
      
      const equippedArmor = this.document.items.filter(item => 
        item.type === "armor" && item.system.equipped
      );
      
      for (const armor of equippedArmor) {
        if (armor.system.armorType === "basic") armorBonus += 1;
        else if (armor.system.armorType === "plate") armorBonus += 2;
        else if (armor.system.armorType === "shield") armorBonus += 1;
      }
      
      armorBonusEl.textContent = armorBonus;
      armorTotalEl.textContent = armorBase + armorBonus;
    }
  }

  static async #onToggleActive(event, target) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    
    const isActive = target.checked;
    await item.update({ "system.active": isActive });
  }
}