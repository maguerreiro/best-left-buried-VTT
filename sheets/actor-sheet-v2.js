// sheets/actor-sheet-v2.js - Complete updated version with stat rolling and no armor exclusivity

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES } from "../module/helpers/armor.js";
import { ADVANCEMENT_TYPES, CONSEQUENCE_TYPES, LOOT_TYPES } from "../module/helpers/new_items.js";

export class BLBActorSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
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
      handler: BLBActorSheetV2.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      updateXP: BLBActorSheetV2.#onUpdateXP,
      updateAdvancement: BLBActorSheetV2.#onUpdateAdvancement,
      rollWeapon: BLBActorSheetV2.#onRollWeapon,
      rollWeaponKh2: BLBActorSheetV2.#onRollWeaponKh2,
      rollWeaponKl2: BLBActorSheetV2.#onRollWeaponKl2,
      rollStat: BLBActorSheetV2.#onRollStat,
      rollStatKh2: BLBActorSheetV2.#onRollStatKh2,
      rollStatKl2: BLBActorSheetV2.#onRollStatKl2,
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
    
    // Set up portrait click handler
    this._setupPortraitHandler();
    
    // Set up item change listeners for encumbrance updates
    this._setupItemChangeListeners();
  }

  _setupItemChangeListeners() {
    // Listen for item updates that might affect encumbrance
    Hooks.on('updateItem', (item, changes, options, userId) => {
      if (item.parent === this.document) {
        // Check if slot value changed
        if (changes.system?.slotValue !== undefined) {
          this._updateEncumbranceDisplay();
        }
      }
    });

    // Listen for item creation
    Hooks.on('createItem', (item, options, userId) => {
      if (item.parent === this.document && item.system.slotValue > 0) {
        this._updateEncumbranceDisplay();
      }
    });
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
    const tabsX = rect.right;
    const tabsY = rect.top; // Fixed offset from top of window
    const tabsZ = Number(windowElement.style.zIndex); 
    
    tabsContainer.style.position = 'fixed';
    tabsContainer.style.left = `${tabsX}px`;
    tabsContainer.style.top = `${tabsY}px`;
    tabsContainer.style.zIndex = tabsZ;
    tabsContainer.style.clipPath = `inset(0 0 ${Math.max(0, (tabsY + 120) - (rect.bottom))}px 0)`; // Clip when exceeding window bounds
  }

  _startPositionTracking(windowElement) {
    let lastX = 0, lastY = 0, lastZ = 0;
    
    const updatePosition = () => {
      if (!this._externalTabs || !windowElement || !document.body.contains(windowElement)) {
        this._cleanupExternalTabs();
        return;
      }

      const rect = windowElement.getBoundingClientRect();
      const newX = rect.right - 49;
      const newY = rect.top + 100; // Fixed offset from top
      const newZ = Number(windowElement.style.zIndex);

      if (newX !== lastX || newY !== lastY || newZ !== lastZ) {
        this._externalTabs.style.left = `${newX}px`;
        this._externalTabs.style.top = `${newY}px`;
        this._externalTabs.style.zIndex = newZ;
        
        // Calculate clipping for tabs that would extend beyond window bottom
        const tabsHeight = 120; // Approximate height of rotated tabs
        const clipAmount = Math.max(0, (newY + tabsHeight) - rect.bottom);
        this._externalTabs.style.clipPath = clipAmount > 0 ? `inset(0 0 ${clipAmount}px 0)` : 'none';
        
        lastX = newX;
        lastY = newY;
        lastZ = newZ;
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

  _setupPortraitHandler() {
    const portrait = this.element.querySelector('.character-portrait[data-edit="img"]');
    if (portrait) {
      portrait.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const current = this.document.img || '';
        
        const fp = new FilePicker({
          type: "image",
          current: current,
          callback: async (path) => {
            await this.document.update({ img: path });
          },
          top: this.position.top + 40,
          left: this.position.left + 10
        });
        
        fp.render(true);
      });
    }
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
    const rollTooltip = await roll.getTooltip();

    // Construct the text to display, including individual die rolls
    const resultText = `
        <div class="dice-roll">
            <div class="dice-result">
                <div class="dice-formula">${roll.formula}</div>
                <h4 class="dice-total dice-results-box">
                    ${dieResults.map(r => `<div class="dice-result-box">${r}</div>`).join("")}
                </h4>
                <div class="dice-tooltip">${rollTooltip}</div>
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

  static async #onRollWeaponKh2(event, target) {
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

    // Evaluate the roll using the 'keep highest 2' formula
    const roll = await new Roll(`4d6kh2 + ${attackValue}`).evaluate();

    // Get the results of each individual die.
    const allDieResults = roll.dice[0].results;

    // Find the single lowest value among the four dice
    let lowestValue = allDieResults[0].result;
    for (const r of allDieResults) {
      if (r.result < lowestValue) {
        lowestValue = r.result;
      }
    }
    
    // Find the first occurrence of the lowest value to mark it as discarded
    const discardedDieIndex = allDieResults.findIndex(r => r.result === lowestValue);

    // Map the results to HTML, applying the 'discarded' class to the correct die
    const dieResultsHtml = allDieResults.map((r, index) => {
      if (index === discardedDieIndex) {
        return `<div class="dice-result-box discarded">${r.result}</div>`;
      } else {
        return `<div class="dice-result-box">${r.result}</div>`;
      }
    }).join("");

    // Get the HTML for the visual dice.
    const rollTooltip = await roll.getTooltip();

    // Construct a custom chat message card that displays all the information at once
    const messageContent = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResultsHtml}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
          </div>
      </div>
    `;

    // Create the chat message with the custom content
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} (Keep Highest 2): Stat: ${attackValue}, DamageMod: ${damage}`,
      content: messageContent,
    });
  }

  static async #onRollWeaponKl2(event, target) {
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

    // Evaluate the roll using the 'keep lowest 2' formula
    const roll = await new Roll(`4d6kl2 + ${attackValue}`).evaluate();

    // Get the results of each individual die.
    const allDieResults = roll.dice[0].results;

    // Find the single highest value among the four dice
    let highestValue = allDieResults[0].result;
    for (const r of allDieResults) {
      if (r.result > highestValue) {
        highestValue = r.result;
      }
    }
    
    // Find the first occurrence of the highest value to mark it as discarded
    const discardedDieIndex = allDieResults.findIndex(r => r.result === highestValue);

    // Map the results to HTML, applying the 'discarded' class to the correct die
    const dieResultsHtml = allDieResults.map((r, index) => {
      if (index === discardedDieIndex) {
        return `<div class="dice-result-box discarded">${r.result}</div>`;
      } else {
        return `<div class="dice-result-box">${r.result}</div>`;
      }
    }).join("");

    // Get the HTML for the visual dice.
    const rollTooltip = await roll.getTooltip();

    // Construct a custom chat message card that displays all the information at once
    const messageContent = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResultsHtml}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
          </div>
      </div>
    `;

    // Create the chat message with the custom content
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${weapon.name} (Keep Lowest 2): Stat: ${attackValue}, DamageMod: ${damage}`,
      content: messageContent,
    });
  }

  // Stat rolling methods
  static async #onRollStat(event, target) {
    const statName = target.dataset.stat;
    const statValue = this.document.system[statName + "Total"] || this.document.system[statName]?.base || 0;
    
    const roll = await new Roll(`2d6 + ${statValue}`).evaluate();
    
    const dieResults = roll.dice[0].results.map(r => r.result);
    const rollTooltip = await roll.getTooltip();
    
    const total = roll.total;
    const success = total >= 9;
    
    const resultText = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResults.map(r => `<div class="dice-result-box">${r}</div>`).join("")}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
              <div style="margin-top: 8px; font-weight: bold; color: ${success ? '#4caf50' : '#f44336'};">
                  ${success ? 'SUCCESS' : 'FAILURE'} (${total}/9)
              </div>
          </div>
      </div>
    `;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${statName.charAt(0).toUpperCase() + statName.slice(1)} Check: ${statValue}`,
      content: resultText
    });
  }

  static async #onRollStatKh2(event, target) {
    const statName = target.dataset.stat;
    const statValue = this.document.system[statName + "Total"] || this.document.system[statName]?.base || 0;
    
    const roll = await new Roll(`3d6kh2 + ${statValue}`).evaluate();
    
    const allDieResults = roll.dice[0].results;
    
    // Find the single lowest value to mark as discarded
    let lowestValue = allDieResults[0].result;
    for (const r of allDieResults) {
      if (r.result < lowestValue) {
        lowestValue = r.result;
      }
    }
    
    const discardedDieIndex = allDieResults.findIndex(r => r.result === lowestValue);
    
    const dieResultsHtml = allDieResults.map((r, index) => {
      if (index === discardedDieIndex) {
        return `<div class="dice-result-box discarded">${r.result}</div>`;
      } else {
        return `<div class="dice-result-box">${r.result}</div>`;
      }
    }).join("");
    
    const rollTooltip = await roll.getTooltip();
    
    const total = roll.total;
    const success = total >= 9;
    
    const messageContent = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResultsHtml}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
              <div style="margin-top: 8px; font-weight: bold; color: ${success ? '#4caf50' : '#f44336'};">
                  ${success ? 'SUCCESS' : 'FAILURE'} (${total}/9)
              </div>
          </div>
      </div>
    `;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${statName.charAt(0).toUpperCase() + statName.slice(1)} Check (Upper Hand): ${statValue}`,
      content: messageContent
    });
  }

  static async #onRollStatKl2(event, target) {
    const statName = target.dataset.stat;
    const statValue = this.document.system[statName + "Total"] || this.document.system[statName]?.base || 0;
    
    const roll = await new Roll(`3d6kl2 + ${statValue}`).evaluate();
    
    const allDieResults = roll.dice[0].results;
    
    // Find the single highest value to mark as discarded
    let highestValue = allDieResults[0].result;
    for (const r of allDieResults) {
      if (r.result > highestValue) {
        highestValue = r.result;
      }
    }
    
    const discardedDieIndex = allDieResults.findIndex(r => r.result === highestValue);
    
    const dieResultsHtml = allDieResults.map((r, index) => {
      if (index === discardedDieIndex) {
        return `<div class="dice-result-box discarded">${r.result}</div>`;
      } else {
        return `<div class="dice-result-box">${r.result}</div>`;
      }
    }).join("");
    
    const rollTooltip = await roll.getTooltip();
    
    const total = roll.total;
    const success = total >= 9;
    
    const messageContent = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResultsHtml}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
              <div style="margin-top: 8px; font-weight: bold; color: ${success ? '#4caf50' : '#f44336'};">
                  ${success ? 'SUCCESS' : 'FAILURE'} (${total}/9)
              </div>
          </div>
      </div>
    `;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      flavor: `${statName.charAt(0).toUpperCase() + statName.slice(1)} Check (Against the Odds): ${statValue}`,
      content: messageContent
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
      
      // Update encumbrance display for any item that had slot value
      if (item.system.slotValue > 0) {
        this._updateEncumbranceDisplay();
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
      
      // No armor exclusivity anymore - all armor/shields can be equipped together
      
      // Update armor display for armor items
      if (item.type === "armor") {
        // Calculate armor values
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
        
        const newArmorTotal = armorBase + armorBonus;
        
        // Update the display
        const armorTotalEl = this.element?.querySelector('.armor-total');
        if (armorTotalEl) {
          armorTotalEl.textContent = newArmorTotal;
        }
        
        // Update the document's system data for consistency (without triggering render)
        this.document.system.armorTotal = newArmorTotal;
        this.document.system.armorBonus = armorBonus;
      }
      
      // Update encumbrance display for all items with slot values
      this._updateEncumbranceDisplay();
      
      // Ensure the clicked checkbox state is correct
      target.checked = isEquipped;
      
    } catch (error) {
      console.error("Error in equipment toggle:", error);
      target.checked = !isEquipped; // Revert on error
    }
  }

  _updateEncumbranceDisplay() {
    console.log("Updating encumbrance display..."); // Debug log
    
    // Calculate current encumbrance from all items with slot values
    let currentEncumbrance = 0;
    const itemsWithSlots = this.document.items.filter(item => 
      item.system.slotValue !== undefined && item.system.slotValue > 0
    );
    
    console.log("Items with slots:", itemsWithSlots.length); // Debug log
    
    for (let item of itemsWithSlots) {
      currentEncumbrance += item.system.slotValue;
      console.log(`Item ${item.name}: ${item.system.slotValue} slots`); // Debug log
    }
    
    console.log("Total encumbrance:", currentEncumbrance); // Debug log
    
    // Update the display - try multiple selectors to find the element
    let encumbranceCurrentEl = this.element?.querySelector('.encumbrance-current');
    
    if (!encumbranceCurrentEl) {
      // Try finding by content if class selector fails
      const allSpans = this.element?.querySelectorAll('span.split-left');
      for (let span of allSpans || []) {
        if (span.classList.contains('encumbrance-current')) {
          encumbranceCurrentEl = span;
          break;
        }
      }
    }
    
    if (!encumbranceCurrentEl) {
      // Last resort - find by looking for the encumbrance section
      const encumbranceLabels = this.element?.querySelectorAll('label');
      for (let label of encumbranceLabels || []) {
        if (label.textContent?.includes('Encumbrance')) {
          const splitInput = label.parentElement?.querySelector('.split-input');
          encumbranceCurrentEl = splitInput?.querySelector('.split-left');
          break;
        }
      }
    }
    
    console.log("Available elements:", this.element?.querySelectorAll('*[class*="encumbrance"]')); // Debug log
    console.log("Split elements:", this.element?.querySelectorAll('.split-left')); // Debug log
    
    if (encumbranceCurrentEl) {
      console.log("Found encumbrance element, updating to:", currentEncumbrance); // Debug log
      encumbranceCurrentEl.textContent = currentEncumbrance;
    } else {
      console.warn("Could not find encumbrance current element"); // Debug log
      console.log("Sheet element:", this.element); // Debug log
      // Try to find any element with encumbrance in the class
      const allEncumbranceEls = this.element?.querySelectorAll('*[class*="encumbrance"]');
      console.log("All encumbrance elements found:", allEncumbranceEls);
    }
    
    // Update the maximum as well in case brawn/wit/will changed
    const encumbranceMaxEl = this.element?.querySelector('.encumbrance-max') || 
                            this.element?.querySelector('span.encumbrance-max') ||
                            this.element?.querySelector('.split-right.encumbrance-max');
    
    if (encumbranceMaxEl) {
      const brawnTotal = this.document.system.brawnTotal || this.document.system.brawn?.base || 0;
      const witTotal = this.document.system.witTotal || this.document.system.wit?.base || 0;
      const willTotal = this.document.system.willTotal || this.document.system.will?.base || 0;
      const maxEncumbrance = 12 + (2 * brawnTotal) + Math.max(witTotal, willTotal);
      encumbranceMaxEl.textContent = maxEncumbrance;
    }
    
    // Update the document's system data for consistency (without triggering render)
    this.document.system.encumbranceCurrent = currentEncumbrance;
    if (this.document.system.encumbrance) {
      this.document.system.encumbrance.current = currentEncumbrance;
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