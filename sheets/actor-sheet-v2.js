// sheets/actor-sheet-v2.js - COMPLETE FIXED VERSION - No Re-render Approach

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

  /** Track the active tab per instance */
  constructor(...args) {
    super(...args);
    this.activeTab = "stats";
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

  /**
   * Manually update armor display without re-rendering the entire sheet
   */
  _updateArmorDisplay() {
    const armorBonusEl = this.element.querySelector('.armor-bonus');
    const armorTotalEl = this.element.querySelector('.armor-total .total-score');
    
    if (!armorBonusEl || !armorTotalEl) return;
    
    let armorBonus = 0;
    const armorBase = this.document.system.armor?.base || 7;
    
    // Calculate bonus from equipped items
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
    
    // Update the display elements
    armorBonusEl.textContent = armorBonus;
    armorTotalEl.textContent = armorBase + armorBonus;
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
   * Handle item deletion - Simple working version with scroll preservation
   */
  static async #onDeleteItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    
    // Use V2 DialogV2 instead of deprecated Dialog.confirm
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Delete Item" },
      content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
      modal: true,
      rejectClose: false
    });
    
    if (confirmed) {
      // Remove the item from UI first
      const itemRow = target.closest("[data-item-id]");
      if (itemRow) {
        itemRow.remove();
      }
      
      // Delete from database without re-render
      await item.delete({ render: false });
    }
  }

  /**
   * Save current scroll positions
   */
  _saveCurrentScrollPositions() {
    if (!this.element) return {};
    
    const positions = {};
    
    // Save main container scroll
    const mainContainer = this.element.querySelector('.sheet-container');
    if (mainContainer) {
      positions.main = mainContainer.scrollTop;
    }
    
    // Save individual list scroll positions
    const armorList = this.element.querySelector('.armor-list');
    if (armorList) {
      positions.armorList = armorList.scrollTop;
    }
    
    const weaponList = this.element.querySelector('.weapon-list');
    if (weaponList) {
      positions.weaponList = weaponList.scrollTop;
    }
    
    const shieldList = this.element.querySelector('.shield-list');
    if (shieldList) {
      positions.shieldList = shieldList.scrollTop;
    }
    
    return positions;
  }

  /**
   * Restore scroll positions
   */
  _restoreScrollPositions(positions) {
    if (!this.element || !positions) return;
    
    // Restore main container
    const mainContainer = this.element.querySelector('.sheet-container');
    if (mainContainer && positions.main > 0) {
      mainContainer.scrollTop = positions.main;
    }
    
    // Restore individual lists
    const armorList = this.element.querySelector('.armor-list');
    if (armorList && positions.armorList > 0) {
      armorList.scrollTop = positions.armorList;
    }
    
    const weaponList = this.element.querySelector('.weapon-list');
    if (weaponList && positions.weaponList > 0) {
      weaponList.scrollTop = positions.weaponList;
    }
    
    const shieldList = this.element.querySelector('.shield-list');
    if (shieldList && positions.shieldList > 0) {
      shieldList.scrollTop = positions.shieldList;
    }
  }

  /** @override */
  async _onDrop(event) {
    // Save scroll positions
    const mainContainer = this.element.querySelector('.sheet-container');
    const armorList = this.element.querySelector('.armor-list');
    const weaponList = this.element.querySelector('.weapon-list');
    const shieldList = this.element.querySelector('.shield-list');
    
    const scrollPositions = {
      main: mainContainer ? mainContainer.scrollTop : 0,
      armor: armorList ? armorList.scrollTop : 0,
      weapon: weaponList ? weaponList.scrollTop : 0,
      shield: shieldList ? shieldList.scrollTop : 0
    };
    
    console.log("Saved scroll positions:", scrollPositions);
    
    // Set up observer to catch DOM changes and immediately restore scroll
    const observer = new MutationObserver(() => {
      const container = this.element?.querySelector('.sheet-container');
      const newArmorList = this.element?.querySelector('.armor-list');
      const newWeaponList = this.element?.querySelector('.weapon-list');
      const newShieldList = this.element?.querySelector('.shield-list');
      
      if (container && scrollPositions.main > 0) {
        container.scrollTop = scrollPositions.main;
      }
      if (newArmorList && scrollPositions.armor > 0) {
        newArmorList.scrollTop = scrollPositions.armor;
      }
      if (newWeaponList && scrollPositions.weapon > 0) {
        newWeaponList.scrollTop = scrollPositions.weapon;
      }
      if (newShieldList && scrollPositions.shield > 0) {
        newShieldList.scrollTop = scrollPositions.shield;
      }
      
      console.log("Observer restored scroll positions");
    });
    
    // Start observing changes to the sheet element
    observer.observe(this.element, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    try {
      const result = await super._onDrop(event);
      
      // Stop observing after a delay
      setTimeout(() => {
        observer.disconnect();
        console.log("Observer disconnected");
      }, 200);
      
      return result;
    } catch (error) {
      observer.disconnect();
      throw error;
    }
  }

  async _renderItemList(type) {
  // Re-prepare full items data for template use
  const context = await this._prepareContext();
  // Render the full actor sheet to HTML (or just the list portion)
  // For better performance, render only the item list snippet (if available)
  
  // Here we can re-render the whole actor sheet, but ideally just the item list
  const html = await foundry.applications.handlebars.renderTemplate(
    "systems/best-left-buried/templates/actor-v2.hbs",
    context
  );
  
  // Extract the relevant item list container from the rendered html
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const newList = doc.querySelector(`.${type}-list`);
  if (!newList) return;

  // Replace the existing item list container with the new one
  const container = this.element.querySelector(`.${type}-list`);
  if (container) container.replaceWith(newList);
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
   * Handle equipment toggle - Bypass ApplicationV2 re-render entirely
   */
  static async #onToggleEquip(event, target) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log("Equipment toggle triggered");
    
    const itemId = target.dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) {
      console.error("Item not found:", itemId);
      return;
    }
    
    const isEquipped = target.checked;
    console.log(`Toggling ${item.name} to ${isEquipped ? 'equipped' : 'unequipped'}`);
    
    try {
      await item.update({ "system.equipped": isEquipped }, { render: false });
      console.log("Item updated successfully");
      
      // Handle mutual exclusion manually
      if ((item.type === "armor" || item.type === "shield") && isEquipped) {
        const others = this.document.items.filter(i => 
          i.type === item.type && i.id !== itemId && i.system.equipped
        );
        
        console.log(`Found ${others.length} other ${item.type} items to unequip`);
        
        for (const other of others) {
          await other.update({ "system.equipped": false }, { render: false });
          console.log(`Unequipped ${other.name}`);
          
          const otherCheckbox = this.element.querySelector(`input[data-item-id="${other.id}"]`);
          if (otherCheckbox) {
            otherCheckbox.checked = false;
            console.log(`Updated checkbox for ${other.name}`);
          }
        }
      }
      
      // Update armor display with simple selectors
      console.log("Updating armor display");
      const armorBonusEl = this.element.querySelector('.armor-bonus');
      
      // Find the armor stat box manually
      let armorTotalEl = null;
      const statBoxes = this.element.querySelectorAll('.stat-box');
      for (const box of statBoxes) {
        const statName = box.querySelector('.stat-name');
        if (statName && statName.textContent.trim() === 'Armor') {
          armorTotalEl = box.querySelector('.total-score');
          break;
        }
      }
      
      if (armorBonusEl && armorTotalEl) {
        console.log("Found armor display elements");
        let armorBonus = 0;
        const armorBase = this.document.system.armor?.base || 7;
        
        const equippedArmor = this.document.items.filter(item => 
          item.type === "armor" && item.system.equipped
        );
        const equippedShields = this.document.items.filter(item => 
          item.type === "shield" && item.system.equipped
        );
        
        console.log(`Found equipped: ${equippedArmor.length} armor, ${equippedShields.length} shields`);
        
        for (const armor of equippedArmor) {
          if (armor.system.armorType === "basic") armorBonus += 1;
          else if (armor.system.armorType === "plate") armorBonus += 2;
          console.log(`${armor.name} (${armor.system.armorType}) adds ${armor.system.armorType === "basic" ? 1 : 2}`);
        }
        
        for (const shield of equippedShields) {
          armorBonus += 1;
          console.log(`${shield.name} adds 1`);
        }
        
        armorBonusEl.textContent = armorBonus;
        armorTotalEl.textContent = armorBase + armorBonus;
        console.log(`Armor updated: base=${armorBase}, bonus=${armorBonus}, total=${armorBase + armorBonus}`);
      } else {
        console.warn("Could not find armor display elements");
        console.log("armorBonusEl found:", !!armorBonusEl);
        console.log("armorTotalEl found:", !!armorTotalEl);
      }
      
      target.checked = isEquipped;
      
    } catch (error) {
      console.error("Error in equipment toggle:", error);
      target.checked = !isEquipped;
    }
  }
}