// module/helpers/template-helpers.js
// Handlebars helper functions for templates

import { WEAPON_TYPES } from './weapon-properties.js';
import { ARMOR_TYPES } from './armor-properties.js';
import { CONSEQUENCE_TYPES } from './item-properties.js';

/**
 * Register all Handlebars template helpers
 * These helpers are used in .hbs template files for data formatting and display
 */
export function registerTemplateHelpers() {
  
  /**
   * Convert boolean to "checked" attribute for checkboxes
   * Usage: {{checked value}}
   */
  Handlebars.registerHelper('checked', function(value) {
    return value ? 'checked' : '';
  });

  /**
   * Get a property from a weapon's type definition
   * Supports custom property overrides set on individual weapons
   * Usage: {{getWeaponProperty weaponType "range" item}}
   */
  Handlebars.registerHelper('getWeaponProperty', function(weaponType, propertyName, item) {
    // Check for custom overrides first
    if (item && item.system) {
      if (propertyName === 'range' && item.system.customRange) {
        return item.system.customRange;
      }
      if (propertyName === 'attackStat' && item.system.customAttackStat) {
        return item.system.customAttackStat;
      }
      if (propertyName === 'damageMod' && item.system.customDamageMod !== null && item.system.customDamageMod !== undefined) {
        return item.system.customDamageMod;
      }
      if (propertyName === 'initiative' && item.system.customInitiative !== null && item.system.customInitiative !== undefined) {
        return item.system.customInitiative;
      }
    }
    
    // Use default weapon type property
    const weaponDefinition = WEAPON_TYPES[weaponType];
    return weaponDefinition ? weaponDefinition[propertyName] || '' : '';
  });

  /**
   * Calculate and format weapon damage modifier
   * Takes into account two-handed bonus and melee penalty
   * Usage: {{getWeaponDamage weaponType isTwoHanded inMelee item}}
   */
  Handlebars.registerHelper('getWeaponDamage', function(weaponType, isTwoHanded, inMelee, item) {
    let damageModifier;
    
    // Use custom damage if set, otherwise use weapon type default
    if (item && item.system && item.system.customDamageMod !== null && item.system.customDamageMod !== undefined) {
      damageModifier = item.system.customDamageMod;
    } else {
      const weaponDefinition = WEAPON_TYPES[weaponType];
      if (!weaponDefinition) return 0;
      damageModifier = weaponDefinition.damageMod || 0;
    }
    
    // Apply situational modifiers
    if (inMelee && WEAPON_TYPES[weaponType]?.meleePenalty) {
      damageModifier -= 1;
    }
    if (isTwoHanded && WEAPON_TYPES[weaponType]?.twoHandedBonus) {
      damageModifier += 1;
    }

    // Format with sign
    return damageModifier >= 0 ? `+${damageModifier}` : `${damageModifier}`;
  });

  /**
   * Format a number with a +/- sign
   * Usage: {{formatModifier value}}
   */
  Handlebars.registerHelper('formatModifier', function(value) {
    const number = parseInt(value);
    if (isNaN(number)) return '0';
    return number >= 0 ? `+${number}` : `${number}`;
  });

  /**
   * Get the display label for an armor type
   * Usage: {{getArmorLabel armorType}}
   */
  Handlebars.registerHelper('getArmorLabel', function(armorType) {
    const armorDefinition = ARMOR_TYPES[armorType];
    return armorDefinition ? armorDefinition.label : armorType;
  });

  /**
   * Get the display label for a consequence type
   * Usage: {{getConsequenceLabel consequenceType}}
   */
  Handlebars.registerHelper('getConsequenceLabel', function(consequenceType) {
    const consequenceDefinition = CONSEQUENCE_TYPES[consequenceType];
    return consequenceDefinition ? consequenceDefinition.label : consequenceType;
  });

  /**
   * Check if two values are equal
   * Usage: {{#if (eq value1 value2)}}...{{/if}}
   */
  Handlebars.registerHelper('eq', function(valueA, valueB) {
    return valueA === valueB;
  });

  /**
   * Logical OR operation
   * Usage: {{#if (or value1 value2)}}...{{/if}}
   */
  Handlebars.registerHelper('or', function(valueA, valueB) {
    return valueA || valueB;
  });
}