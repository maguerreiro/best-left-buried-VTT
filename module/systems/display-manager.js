// module/systems/display-manager.js
// Manages UI updates and visual display calculations

import { AssetPaths, getWeaponIconPath } from '../config/constants.js';
import { ARMOR_TYPES } from '../helpers/armor-properties.js';
import { calculateMaxEncumbrance } from '../config/constants.js';

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
    return getWeaponIconPath(weaponType);
  }

  /**
   * Get the appropriate icon for any item type
   * @param {string} itemType - The item type (weapon, armor, etc.)
   * @param {string} subType - Optional subtype (e.g., weaponType for weapons)
   * @returns {string} Path to the item icon
   */
  static getItemIcon(itemType, subType = null) {
    if (itemType === "weapon" && subType) {
      return getWeaponIconPath(subType);
    }
    return AssetPaths.ICONS.ITEM_GENERIC;
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
      const maxEncumbrance = calculateMaxEncumbrance(brawnTotal, witTotal, willTotal);
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
      armorBonus += ARMOR_TYPES[armor.system.armorType]?.bonus || 0;
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
}