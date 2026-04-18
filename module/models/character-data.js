// module/models/character-data.js
// Data model for Best Left Buried characters

import { ARMOR_TYPES } from '../helpers/armor-properties.js';
import { calculateMaxEncumbrance } from '../config/constants.js';

/**
 * CharacterData - Data model defining the structure and behavior of characters
 * Extends Foundry's TypeDataModel to provide character-specific functionality
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for character actors
   * @returns {Object} Schema definition with all character fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      // ===== CHARACTER PORTRAIT =====
      portrait: new fields.StringField({
        required: false,
        initial: ""
      }),

      // ===== BASIC ATTACK DICE =====
      attack: new fields.StringField({
        required: true,
        initial: "1d6",
      }),

      // ===== PRIMARY ATTRIBUTES =====
      // Each attribute has a base value and a bonus modifier
      
      brawn: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      wit: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      will: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 30,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      affluence: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
          max: 30,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      observation: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      // ===== RESOURCE POOLS =====
      
      // Vigour represents physical health and stamina
      vigour: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: -20,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
        }),
      }),

      // Grip represents mental fortitude and sanity
      grip: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 30,
        }),
      }),

      // ===== CARRYING CAPACITY =====
      // Tracks how much the character can carry
      encumbrance: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 12,
          min: 0,
        }),
      }),

      // ===== ARMOR =====
      // Base armor value (equipment provides bonuses on top)
      armor: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 7,
          min: 0,
        }),
      }),

      // ===== CHARACTER PROGRESSION =====
      
      // Experience points earned
      xp: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0
      }),

      // Advancement points available
      advancement: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0
      }),

      // ===== CHARACTER IDENTITY =====
      
      race: new fields.StringField({
        required: false,
        initial: ""
      }),

      archetype: new fields.StringField({
        required: false,
        initial: ""
      }),
    }  
  }

  /**
   * Prepare derived data for the character
   * Calculates values based on base data (totals, bonuses, etc.)
   * Called automatically after data is loaded but before rendering
   */
  prepareDerivedData() {
    // ===== CALCULATE ATTRIBUTE TOTALS =====
    // Formula: base + bonus
    this.brawnTotal = this.brawn.base + this.brawn.bonus;
    this.witTotal = this.wit.base + this.wit.bonus;
    this.willTotal = this.will.base + this.will.bonus;
    this.affluenceTotal = this.affluence.base + this.affluence.bonus;
    this.observationTotal = this.observation.base + this.observation.bonus;
    
    // ===== INITIALIZE ARMOR VALUES =====
    this.armorTotal = this.armor.base;
    this.armorBonus = 0;

    // ===== CALCULATE CARRYING CAPACITY =====
    // Formula: 12 + (2 × Brawn) + max(Wit, Will)
    this.encumbranceMax = calculateMaxEncumbrance(this.brawnTotal, this.witTotal, this.willTotal);
    
    // Initialize current encumbrance (calculated from items below)
    this.encumbranceCurrent = 0;

    // Get reference to the parent actor
    const character = this.parent;
    if (!character) return;

    // ===== CALCULATE ARMOR BONUSES FROM EQUIPMENT =====
    const armorItems = character.items.filter(item => item.type === "armor");
    for (let armor of armorItems) {
      if (armor.system.equipped) {
        const bonus = ARMOR_TYPES[armor.system.armorType]?.bonus || 0;
        this.armorTotal += bonus;
        this.armorBonus += bonus;
      }
    }

    // ===== CALCULATE CURRENT ENCUMBRANCE FROM ITEMS =====
    const carriedItems = character.items.filter(item => 
      item.system.slotValue !== undefined && item.system.slotValue > 0
    );
    
    for (let item of carriedItems) {
      this.encumbranceCurrent += item.system.slotValue;
    }
    
    // Update the encumbrance data
    this.encumbrance.current = this.encumbranceCurrent;
    this.encumbrance.max = this.encumbranceMax;
  }
}