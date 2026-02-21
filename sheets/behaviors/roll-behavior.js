// sheets/behaviors/roll-behavior.js
// Handles dice rolling interactions for character sheets

import { DiceSystem } from '../../module/systems/dice-system.js';
import { SystemConstants } from '../../module/config/constants.js';

/**
 * RollBehavior - Encapsulates all dice rolling interactions
 * Provides methods for handling roll button clicks and triggering dice rolls
 */
export const RollBehavior = {
  
  // ===== ATTRIBUTE CHECK ROLLS =====
  
  /**
   * Handle standard attribute check roll
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the roll
   */
  async handleAttributeCheck(event, target, character) {
    const attributeName = target.dataset.stat;
    await DiceSystem.rollAttributeCheck(character, attributeName, SystemConstants.ROLL_MODES.STANDARD);
  },

  /**
   * Handle attribute check with upper hand (keep highest 2 dice)
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the roll
   */
  async handleAttributeCheckUpperHand(event, target, character) {
    const attributeName = target.dataset.stat;
    await DiceSystem.rollAttributeCheck(character, attributeName, SystemConstants.ROLL_MODES.UPPER_HAND);
  },

  /**
   * Handle attribute check against the odds (keep lowest 2 dice)
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the roll
   */
  async handleAttributeCheckAgainstOdds(event, target, character) {
    const attributeName = target.dataset.stat;
    await DiceSystem.rollAttributeCheck(character, attributeName, SystemConstants.ROLL_MODES.AGAINST_ODDS);
  },

  // ===== WEAPON ATTACK ROLLS =====
  
  /**
   * Handle standard weapon attack roll
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the attack
   */
  async handleWeaponAttack(event, target, character) {
    const weaponId = target.dataset.weaponId;
    const weapon = character.items.get(weaponId);
    
    if (!weapon) {
      console.error(`Weapon not found: ${weaponId}`);
      return;
    }
    
    await DiceSystem.rollWeaponAttack(character, weapon, SystemConstants.ROLL_MODES.STANDARD);
  },

  /**
   * Handle weapon attack with upper hand (keep highest 2 dice)
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the attack
   */
  async handleWeaponAttackUpperHand(event, target, character) {
    const weaponId = target.dataset.weaponId;
    const weapon = character.items.get(weaponId);
    
    if (!weapon) {
      console.error(`Weapon not found: ${weaponId}`);
      return;
    }
    
    await DiceSystem.rollWeaponAttack(character, weapon, SystemConstants.ROLL_MODES.UPPER_HAND);
  },

  /**
   * Handle weapon attack against the odds (keep lowest 2 dice)
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the attack
   */
  async handleWeaponAttackAgainstOdds(event, target, character) {
    const weaponId = target.dataset.weaponId;
    const weapon = character.items.get(weaponId);
    
    if (!weapon) {
      console.error(`Weapon not found: ${weaponId}`);
      return;
    }
    
    await DiceSystem.rollWeaponAttack(character, weapon, SystemConstants.ROLL_MODES.AGAINST_ODDS);
  },

  // ===== SPECIAL ITEM ROLLS =====
  
  /**
   * Handle advancement ability roll
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the roll
   */
  async handleAdvancementRoll(event, target, character) {
    const advancementId = target.dataset.advancementId;
    const advancement = character.items.get(advancementId);
    
    if (!advancement) {
      console.error(`Advancement not found: ${advancementId}`);
      return;
    }
    
    await DiceSystem.rollSpecialItem(character, advancement);
  },

  /**
   * Handle consequence effect roll
   * @param {Event} event - The triggering event
   * @param {HTMLElement} target - The clicked element
   * @param {Actor} character - The character making the roll
   */
  async handleConsequenceRoll(event, target, character) {
    const consequenceId = target.dataset.consequenceId;
    const consequence = character.items.get(consequenceId);
    
    if (!consequence) {
      console.error(`Consequence not found: ${consequenceId}`);
      return;
    }
    
    await DiceSystem.rollSpecialItem(character, consequence);
  }
};