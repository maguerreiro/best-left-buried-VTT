// module/systems/display-manager.js
// Manages UI updates and visual display calculations

import { AssetPaths } from '../config/constants.js';

/**
 * DisplayManager - Handles all UI updates and display calculations
 * Centralizes logic for updating character sheet displays
 */
export class DisplayManager {
  
  /**
   * Get the appropriate icon for a weapon based on its properties
   * @param {string} weaponType - The weapon type identifier
   * @returns {string} Path to the weapon icon
   */
  static getWeaponIcon(weaponType) {
    const twoHandedTypes = ['heavy', 'long'];
    
    if (twoHandedTypes.includes(weaponType)) {
      return AssetPaths.ICONS.WEAPON_TWO_HANDED;
    }
    
    return AssetPaths.ICONS.WEAPON_ONE_HANDED;
  }

  /**
   * Get the appropriate icon for any item type
   * @param {string} itemType - The item type (weapon, armor, etc.)
   * @param {string} subType - Optional subtype (e.g., weaponType for weapons)
   * @returns {string} Path to the item icon
   */
  static getItemIcon(itemType, subType = null) {
    if (itemType === "weapon" && subType) {
      return this.getWeaponIcon(subType);
    }
    return AssetPaths.ICONS.ITEM_GENERIC;
  }

  /**
   * Enrich HTML content in item descriptions
   * @param {Array} items - Array of items to process
   * @returns {Promise<Array>} Items with enriched descriptions
   */
  static async enrichItemDescriptions(items) {
    for (const item of items) {
      item.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
        item.system.description || "", 
        {
          async: true,
          secrets: item.isOwner,
          relativeTo: item
        }
      );
    }
    return items;
  }

  /**
   * Setup portrait selection handler
   * @param {HTMLElement} sheetElement - The character sheet element
   * @param {Actor} character - The character actor
   * @param {Object} sheetPosition - The sheet's position for FilePicker
   */
  static setupPortraitSelector(sheetElement, character, sheetPosition) {
    const portraitImage = sheetElement.querySelector('.character-portrait[data-edit="img"]');
    if (!portraitImage) return;
    
    portraitImage.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const currentImage = character.img || '';
      
      const filePicker = new FilePicker({
        type: "image",
        current: currentImage,
        callback: async (selectedPath) => {
          await character.update({ img: selectedPath });
        },
        top: sheetPosition.top + 40,
        left: sheetPosition.left + 10
      });
      
      filePicker.render(true);
    });
  }

  /**
   * Update the encumbrance display on the character sheet
   * @param {Actor} character - The character actor
   * @param {HTMLElement} sheetElement - The character sheet element
   */
  static refreshEncumbranceDisplay(character, sheetElement) {
    // Calculate current encumbrance from all items
    let currentEncumbrance = 0;
    const carriedItems = character.items.filter(item => 
      item.system.slotValue !== undefined && item.system.slotValue > 0
    );
    
    for (let item of carriedItems) {
      currentEncumbrance += item.system.slotValue;
    }
    
    // Update current encumbrance display
    const currentDisplay = sheetElement?.querySelector('.split-left');
    if (currentDisplay) {
      currentDisplay.textContent = currentEncumbrance;
    }
    
    // Update maximum encumbrance display
    const maximumDisplay = sheetElement?.querySelector('.split-right');
    if (maximumDisplay) {
      const brawnTotal = character.system.brawnTotal || character.system.brawn?.base || 0;
      const witTotal = character.system.witTotal || character.system.wit?.base || 0;
      const willTotal = character.system.willTotal || character.system.will?.base || 0;
      const maxEncumbrance = 12 + (2 * brawnTotal) + Math.max(witTotal, willTotal);
      maximumDisplay.textContent = maxEncumbrance;
    }
    
    // Update actor's system data
    character.system.encumbranceCurrent = currentEncumbrance;
    if (character.system.encumbrance) {
      character.system.encumbrance.current = currentEncumbrance;
    }
  }

  /**
   * Update the armor display on the character sheet
   * @param {Actor} character - The character actor
   * @param {HTMLElement} sheetElement - The character sheet element
   */
  static refreshArmorDisplay(character, sheetElement) {
    const armorDisplay = sheetElement?.querySelector('.armor-total');
    if (!armorDisplay) return;
    
    let armorBonus = 0;
    const baseArmor = character.system.armor?.base || 7;
    
    const equippedArmor = character.items.filter(item => 
      item.type === "armor" && item.system.equipped
    );
    
    for (const armor of equippedArmor) {
      switch (armor.system.armorType) {
        case "basic":
          armorBonus += 1;
          break;
        case "plate":
          armorBonus += 2;
          break;
        case "shield":
          armorBonus += 1;
          break;
      }
    }
    
    const totalArmor = baseArmor + armorBonus;
    armorDisplay.textContent = totalArmor;
    
    // Update actor's system data
    character.system.armorTotal = totalArmor;
    character.system.armorBonus = armorBonus;
  }

  /**
   * Save the current scroll position before re-render
   * @param {HTMLElement} sheetElement - The character sheet element
   * @returns {number|undefined} The saved scroll position
   */
  static captureScrollPosition(sheetElement) {
    const container = sheetElement?.querySelector('.sheet-container');
    return container ? container.scrollTop : undefined;
  }

  /**
   * Restore the scroll position after re-render
   * @param {HTMLElement} sheetElement - The character sheet element
   * @param {number} scrollPosition - The position to restore
   */
  static restoreScrollPosition(sheetElement, scrollPosition) {
    if (scrollPosition === undefined) return;
    
    const container = sheetElement?.querySelector('.sheet-container');
    if (container) {
      container.scrollTop = scrollPosition;
    }
  }

  /**
   * Setup listeners for item changes that affect displays
   * @param {Actor} character - The character actor
   * @param {Function} updateCallback - Callback to run when items change
   */
  static watchItemChanges(character, updateCallback) {
    // Listen for item updates
    Hooks.on('updateItem', (item, changes, options, userId) => {
      if (item.parent === character) {
        const shouldUpdate = 
          changes.system?.slotValue !== undefined || 
          changes.system?.equipped !== undefined ||
          changes.system?.description !== undefined;
        
        if (shouldUpdate) {
          updateCallback();
        }
      }
    });

    // Listen for item creation
    Hooks.on('createItem', (item, options, userId) => {
      if (item.parent === character && item.system.slotValue > 0) {
        updateCallback();
      }
    });
  }
}