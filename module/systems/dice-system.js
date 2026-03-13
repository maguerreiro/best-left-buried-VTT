// module/systems/dice-system.js
// Dice rolling mechanics and chat message generation

import { SystemConstants, ThemeColors } from '../config/constants.js';

/**
 * DiceSystem - Manages all dice rolling mechanics and result presentation
 * Handles stat checks, weapon attacks, and special item rolls
 */
export class DiceSystem {
  
  /**
   * Roll an attribute check (Brawn, Wit, Will, etc.)
   * @param {Actor} character - The character making the check
   * @param {string} attributeName - Name of the attribute (brawn, wit, will, etc.)
   * @param {string} rollMode - STANDARD, UPPER_HAND, or AGAINST_ODDS
   * @returns {Promise<Roll>} The evaluated roll object
   */
  static async rollAttributeCheck(character, attributeName, rollMode = SystemConstants.ROLL_MODES.STANDARD) {
    const attributeValue = character.system[attributeName + "Total"] || character.system[attributeName]?.base || 0;
    
    // Select appropriate dice formula based on roll mode
    const { formula, modeLabel } = this._getAttributeCheckFormula(attributeValue, rollMode);
    
    // Execute the roll
    const roll = await new Roll(formula).evaluate();
    const isSuccess = roll.total >= SystemConstants.MECHANICS.ATTRIBUTE_CHECK_SUCCESS_THRESHOLD;
    
    // Generate and send chat message
    const messageContent = await this._buildAttributeCheckMessage(roll, rollMode, isSuccess);
    
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: character }),
      flavor: `${this._capitalizeText(attributeName)} Check${modeLabel}: ${attributeValue}`,
      content: messageContent
    });
    
    return roll;
  }

  /**
   * Roll a weapon attack
   * @param {Actor} character - The character making the attack
   * @param {Item} weapon - The weapon being used
   * @param {string} rollMode - STANDARD, UPPER_HAND, or AGAINST_ODDS
   * @returns {Promise<Roll>} The evaluated roll object
   */
  static async rollWeaponAttack(character, weapon, rollMode = SystemConstants.ROLL_MODES.STANDARD) {
    const { WEAPON_TYPES } = await import('../helpers/weapon-properties.js');
    
    const weaponType = weapon.system.weaponType || "hand";
    const weaponProperties = WEAPON_TYPES[weaponType];
    
    if (!weaponProperties) {
      console.error(`Unknown weapon type: ${weaponType}`);
      return null;
    }
    
    // Check for custom attack stat first, then use weapon type default
    const attackAttribute = weapon.system.customAttackStat || weaponProperties.attackStat;
    const attackValue = character.system[attackAttribute + "Total"] || character.system[attackAttribute]?.base || 0;
    
    // Calculate total damage modifier
    const damageModifier = this._calculateWeaponDamage(weapon, weaponProperties);
     
    // Get appropriate dice formula
    const { formula, modeLabel } = this._getWeaponAttackFormula(attackValue, damageModifier, rollMode);
    
    // Execute the roll
    const roll = await new Roll(formula).evaluate();
    
    // Generate and send chat message (include note if present)
    const messageContent = await this._buildWeaponAttackMessage(roll, rollMode, weapon.system.note);
    
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: character }),
      flavor: `${weapon.name}${modeLabel}: <br> <span style="color: #000000;font-size: 2em;"><strong>${this._capitalizeText(attackAttribute)}:</strong> ${attackValue} </span> <br> <span style="color: rgb(93, 20, 43);font-size: 2em;"><strong>Damage Mod:</strong> ${damageModifier >= 0 ? '+' : ''}${damageModifier}</span> `,
      content: messageContent
    });
    
    return roll;
  }

  /**
   * Roll for an advancement or consequence item
   * @param {Actor} character - The character making the roll
   * @param {Item} item - The advancement or consequence item
   * @returns {Promise<Roll>} The evaluated roll object
   */
  static async rollSpecialItem(character, item) {
    const rollFormula = item.system.rollFormula || "2d6";
    const roll = await new Roll(rollFormula).evaluate();
    
    // Determine roll mode from formula
    const rollMode = this._detectRollModeFromFormula(rollFormula);
    
    const messageContent = await this._buildGenericRollMessage(roll, rollMode);
    
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: character }),
      flavor: `${item.name}`,
      content: messageContent
    });
    
    return roll;
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Detect roll mode from formula string
   * @private
   */
  static _detectRollModeFromFormula(formula) {
    if (formula.includes('kh')) {
      return SystemConstants.ROLL_MODES.UPPER_HAND;
    } else if (formula.includes('kl')) {
      return SystemConstants.ROLL_MODES.AGAINST_ODDS;
    }
    return SystemConstants.ROLL_MODES.STANDARD;
  }

  /**
   * Get dice formula for attribute checks
   * @private
   */
  static _getAttributeCheckFormula(attributeValue, rollMode) {
    let formula, modeLabel = '';
    
    switch (rollMode) {
      case SystemConstants.ROLL_MODES.UPPER_HAND:
        formula = `${SystemConstants.DICE_FORMULAS.ATTRIBUTE_CHECK_ADVANTAGE} + ${attributeValue}`;
        modeLabel = ' (Upper Hand)';
        break;
      case SystemConstants.ROLL_MODES.AGAINST_ODDS:
        formula = `${SystemConstants.DICE_FORMULAS.ATTRIBUTE_CHECK_DISADVANTAGE} + ${attributeValue}`;
        modeLabel = ' (Against the Odds)';
        break;
      default:
        formula = `${SystemConstants.DICE_FORMULAS.ATTRIBUTE_CHECK_STANDARD} + ${attributeValue}`;
    }
    
    return { formula, modeLabel };
  }

  /**
   * Get dice formula for weapon attacks
   * @private
   */
  static _getWeaponAttackFormula(attackValue, damageModifier, rollMode) {
    let diceFormula, modeLabel = '';
    
    switch (rollMode) {
      case SystemConstants.ROLL_MODES.UPPER_HAND:
        diceFormula = SystemConstants.DICE_FORMULAS.WEAPON_ATTACK_ADVANTAGE;
        modeLabel = ' (Upper Hand)';
        break;
      case SystemConstants.ROLL_MODES.AGAINST_ODDS:
        diceFormula = SystemConstants.DICE_FORMULAS.WEAPON_ATTACK_DISADVANTAGE;
        modeLabel = ' (Against the Odds)';
        break;
      default:
        diceFormula = SystemConstants.DICE_FORMULAS.WEAPON_ATTACK_STANDARD;
    }
    
    let formula = `${diceFormula} `;

    // Only append the attackValue if it's not zero 
    if (attackValue !== 0) {
      formula += ` + ${attackValue}`;
     }

    // Only append the modifier if it's not zero 
    if (damageModifier !== 0) {
      formula += ` + ${damageModifier}`;
     }


    return { formula, modeLabel };
  }

  /**
   * Calculate total weapon damage including modifiers
   * @private
   */
  static _calculateWeaponDamage(weapon, weaponProperties) {
    // Check for custom damage mod first, then use weapon type default
    let damage = (weapon.system.customDamageMod !== null && weapon.system.customDamageMod !== undefined)
      ? weapon.system.customDamageMod
      : (weaponProperties.damageMod || 0);
    
    // Apply two-handed bonus (only if not using custom damage)
    if (weapon.system.isTwoHanded && weaponProperties.twoHandedBonus && weapon.system.customDamageMod === null) {
      damage += 1;
    }
    
    // Apply melee penalty for thrown weapons when range is melee (only if not using custom damage)
    if (weaponProperties.meleePenalty && weapon.system.customDamageMod === null) {
      const effectiveRange = weapon.system.customRange || weaponProperties.range;
      if (effectiveRange === 'melee') {
        damage -= 1;
      }
    }
    
    return damage;
  }

  /**
   * Build HTML for attribute check chat message
   * @private
   */
  static async _buildAttributeCheckMessage(roll, rollMode, isSuccess) {
    const diceResults = this._extractDiceResults(roll, rollMode);
    const diceHtml = this._formatDiceResultsHtml(diceResults);
    const total = roll.total;
    
    const successColor = isSuccess ? ThemeColors.SUCCESS : ThemeColors.FAILURE;
    const successText = isSuccess ? 'SUCCESS' : 'FAILURE';
    const threshold = SystemConstants.MECHANICS.ATTRIBUTE_CHECK_SUCCESS_THRESHOLD;
    
    return `
      <div class="dice-roll">
        <div class="dice-result">
          <h4 class="dice-total dice-results-box">
            ${diceHtml}
          </h4>
          <div style="margin-top: 8px; font-weight: bold; color: ${successColor};">
            ${successText} (${total}/${threshold})
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build HTML for weapon attack chat message
   * @private
   */
  static async _buildWeaponAttackMessage(roll, rollMode, note) {
    const diceResults = this._extractDiceResults(roll, rollMode);
    const diceHtml = this._formatDiceResultsHtml(diceResults);
    
    const noteHtml = note ? `<div style="margin-top: 8px; font-style: italic; color: #2a2a2a;">${note}</div>` : '';
    
    return `
      <div class="dice-roll">
        <div class="dice-result">
          <h4 class="dice-total dice-results-box">
            ${diceHtml}
          </h4>
          ${noteHtml}
        </div>
      </div>
    `;
  }

  /**
   * Build HTML for generic item roll chat message
   * @private
   */
  static async _buildGenericRollMessage(roll, rollMode = SystemConstants.ROLL_MODES.STANDARD) {
    const diceResults = this._extractDiceResults(roll, rollMode);
    const diceHtml = this._formatDiceResultsHtml(diceResults);
    
    return `
      <div class="dice-roll">
        <div class="dice-result">
          <h4 class="dice-total dice-results-box">
            ${diceHtml}
          </h4>
        </div>
      </div>
    `;
  }

  /**
   * Extract dice results and mark discarded dice
   * Relies on Foundry's built-in keep/drop evaluation
   * @private
   */
  static _extractDiceResults(roll, rollMode) {
    const firstDiceTerm = roll.dice[0];
    if (!firstDiceTerm) return [];
    
    const allResults = firstDiceTerm.results;
    
    // For standard rolls, nothing is discarded
    if (rollMode === SystemConstants.ROLL_MODES.STANDARD) {
      return allResults.map(r => ({ value: r.result, isDiscarded: false }));
    }
    
    // Check if this die term has keep/drop modifiers
    const hasKeepModifier = firstDiceTerm.modifiers?.some(m => m.startsWith('k'));
    
    if (!hasKeepModifier) {
      // No keep modifier, all dice are active
      return allResults.map(r => ({ value: r.result, isDiscarded: false }));
    }
    
    // Mark discarded dice based on the roll's own evaluation
    // Foundry automatically sets the 'discarded' flag on dice results
    return allResults.map(r => ({
      value: r.result,
      isDiscarded: r.discarded || false
    }));
  }

  /**
   * Format dice results as HTML
   * @private
   */
  static _formatDiceResultsHtml(diceResults) {
    return diceResults.map(result => {
      const discardedClass = result.isDiscarded ? ' discarded' : '';
      return `<div class="dice-result-box${discardedClass}">${result.value}</div>`;
    }).join('');
  }

  /**
   * Capitalize first letter of text
   * @private
   */
  static _capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}