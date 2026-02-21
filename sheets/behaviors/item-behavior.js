// sheets/behaviors/item-behavior.js
// Handles item CRUD operations for character sheets

import { DisplayManager } from '../../module/systems/display-manager.js';

/**
 * ItemBehavior - Encapsulates all item management interactions
 * Provides methods for opening, deleting, equipping, and modifying items
 */
export const ItemBehavior = {
  
  // ===== ITEM VIEWING =====
  
  /**
   * Open an item's configuration sheet
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character who owns the item
   */
  async handleOpenItemSheet(event, target, character) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = character.items.get(itemId);
    
    if (item) {
      item.sheet.render(true);
    } else {
      console.error(`Item not found: ${itemId}`);
    }
  },

  // ===== ITEM DELETION =====
  
  /**
   * Delete an item after user confirmation
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character who owns the item
   * @param {Object} sheet - The character sheet instance
   */
  async handleDeleteItem(event, target, character, sheet) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    const item = character.items.get(itemId);
    
    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }
    
    // Request user confirmation
    const isConfirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Delete Item" },
      content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
      modal: true,
      rejectClose: false
    });
    
    if (!isConfirmed) return;
    
    // Remove item row from DOM immediately to prevent visual jump
    const itemRow = target.closest("[data-item-id]");
    if (itemRow) {
      itemRow.remove();
    }
    
    // Delete the item from the actor
    await item.delete({ render: false });
    
    // Update relevant displays
    if (sheet && sheet.element) {
      // Update armor display if armor was equipped
      if (item.type === "armor" && item.system.equipped) {
        DisplayManager.refreshArmorDisplay(character, sheet.element);
      }
      
      // Update encumbrance if item had weight
      if (item.system.slotValue > 0) {
        DisplayManager.refreshEncumbranceDisplay(character, sheet.element);
      }
    }
  },

  // ===== ITEM EQUIPMENT =====
  
  /**
   * Toggle item equipped status
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The checkbox element
   * @param {Actor} character - The character who owns the item
   * @param {Object} sheet - The character sheet instance
   */
  async handleToggleEquipped(event, target, character, sheet) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = target.dataset.itemId;
    const item = character.items.get(itemId);
    
    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }
    
    const isNowEquipped = target.checked;
    
    try {
      // Update item without triggering sheet re-render
      await item.update({ "system.equipped": isNowEquipped }, { render: false });
      
      // Update relevant displays
      if (sheet && sheet.element) {
        // Update armor display for armor items
        if (item.type === "armor") {
          DisplayManager.refreshArmorDisplay(character, sheet.element);
        }
        
        // Update encumbrance for all items with weight
        DisplayManager.refreshEncumbranceDisplay(character, sheet.element);
      }
      
      // Ensure checkbox reflects the update
      target.checked = isNowEquipped;
      
    } catch (error) {
      console.error("Failed to toggle equipment:", error);
      target.checked = !isNowEquipped; // Revert on error
    }
  },

  /**
   * Toggle consequence active status
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The checkbox element
   * @param {Actor} character - The character who owns the consequence
   */
  async handleToggleActive(event, target, character) {
    event.preventDefault();
    event.stopPropagation();
    
    const itemId = target.dataset.itemId;
    const item = character.items.get(itemId);
    
    if (!item) {
      console.error(`Item not found: ${itemId}`);
      return;
    }
    
    const isNowActive = target.checked;
    await item.update({ "system.active": isNowActive });
  },

  // ===== CHARACTER PROGRESSION =====
  
  /**
   * Update character experience points
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked button
   * @param {Actor} character - The character to update
   */
  async handleUpdateExperience(event, target, character) {
    const changeAmount = target.dataset.change === "increase" ? 1 : -1;
    const currentXP = character.system.xp || 0;
    const newXP = Math.max(0, currentXP + changeAmount);
    
    await character.update({ "system.xp": newXP });
  },

  /**
   * Update character advancement points
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked button
   * @param {Actor} character - The character to update
   */
  async handleUpdateAdvancement(event, target, character) {
    const changeAmount = target.dataset.change === "increase" ? 1 : -1;
    const currentAdvancement = character.system.advancement || 0;
    const newAdvancement = Math.max(0, currentAdvancement + changeAmount);
    
    await character.update({ "system.advancement": newAdvancement });
  }
};