// module/models/item-data.js
// Data models for Best Left Buried items

import { AssetPaths } from '../config/constants.js';

/**
 * WeaponData - Data model for weapon items
 */
export class WeaponData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for weapons
   * @returns {Object} Schema definition with all weapon fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      // ===== BASIC INFORMATION =====
      
      description: new fields.StringField({ 
        initial: "" 
      }),
      
      // Weapon category determines base properties
      weaponType: new fields.StringField({
        required: true,
        initial: "hand",
        choices: ["hand", "heavy", "light", "long", "ranged", "throwing"]
      }),
      
      // ===== USAGE MODIFIERS =====
      
      // Two-handed usage grants +1 damage for applicable weapons
      isTwoHanded: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // In-melee penalty for throwing weapons (-1 damage)
      inMelee: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Whether currently equipped and ready for use
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Inventory slots occupied
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
      }),
      
      // ===== CUSTOM PROPERTY OVERRIDES =====
      // These override default weapon type properties when set
      
      customDamageMod: new fields.NumberField({
        required: false,
        initial: null,
        nullable: true,
        integer: true
      }),
      
      customInitiative: new fields.NumberField({
        required: false,
        initial: null,
        nullable: true,
        integer: true
      }),
      
      customRange: new fields.StringField({
        required: false,
        initial: null,
        nullable: true
      }),
      
      customAttackStat: new fields.StringField({
        required: false,
        initial: null,
        nullable: true
      }),
      
      // Note displayed in chat message when weapon is used
      note: new fields.StringField({
        required: false,
        initial: ""
      })
    };
  }

  /**
   * Prepare derived data
   * Set default icon based on weapon type if no custom icon is set
   */
  prepareDerivedData() {
    // Only set default icon if the current icon is the generic Foundry icon
    if (!this.parent.img || this.parent.img === "icons/svg/item-bag.svg") {
      this._setDefaultIcon();
    }
  }

  /**
   * Set the default icon based on weapon type
   * @private
   */
  _setDefaultIcon() {
    const weaponType = this.weaponType || "hand";
    let iconPath;

    switch (weaponType) {
      case "heavy":
        iconPath = AssetPaths.ICONS.WEAPON_TWO_HANDED;
        break;
      case "throwing":
        iconPath = AssetPaths.ICONS.THROWING_WEAPON;
        break;
      case "ranged":
        iconPath = AssetPaths.ICONS.RANGED_WEAPON;
        break;
      case "long":
        iconPath = AssetPaths.ICONS.LONG_WEAPON;
        break;
      default:
        iconPath = AssetPaths.ICONS.WEAPON_ONE_HANDED;
    }

    // Update the parent item's img field
    if (this.parent) {
      this.parent.updateSource({ img: iconPath });
    }
  }
}

/**
 * ArmorData - Data model for armor and shield items
 */
export class ArmorData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for armor
   * @returns {Object} Schema definition with all armor fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      // ===== BASIC INFORMATION =====
      
      description: new fields.StringField({ 
        initial: "" 
      }),
      
      // Armor category determines protection bonus
      // basic (+1), plate (+2), shield (+1)
      armorType: new fields.StringField({
        required: true,
        initial: "basic",
        choices: ["basic", "plate", "shield"]
      }),
      
      // Whether currently worn/carried
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Inventory slots occupied
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
      })
    };
  }
}

/**
 * AdvancementData - Data model for character advancements
 * Represents special abilities, skills, and character improvements
 */
export class AdvancementData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for advancements
   * @returns {Object} Schema definition with all advancement fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      // ===== BASIC INFORMATION =====
      
      description: new fields.StringField({ 
        initial: "" 
      }),
      
      // Custom dice formula for this advancement's effect
      // Default is 2d6, but can be customized
      rollFormula: new fields.StringField({
        required: false,
        initial: "2d6"
      }),
      
      // ===== USAGE TRACKING =====
      
      // Whether to track limited uses for this advancement
      hasUses: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Current and maximum uses (when hasUses is enabled)
      uses: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
      
      // Type label for this advancement
      advancementType: new fields.StringField({
        required: false,
        initial: ""
      })
    };
  }
}

/**
 * ConsequenceData - Data model for character consequences
 * Represents injuries, afflictions, and negative effects
 */
export class ConsequenceData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for consequences
   * @returns {Object} Schema definition with all consequence fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      // ===== BASIC INFORMATION =====
      
      description: new fields.StringField({ 
        initial: "" 
      }),
      
      // Type: injury (physical) or affliction (mental/supernatural)
      consequenceType: new fields.StringField({
        required: true,
        initial: "injury",
        choices: ["injury", "affliction"]
      }),
      
      // Whether this consequence is currently affecting the character
      active: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // ===== USAGE TRACKING =====
      
      // Whether to track limited uses for this consequence
      hasUses: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Current and maximum uses (when hasUses is enabled)
      uses: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
      
      // Type label for this consequence
      typeLabel: new fields.StringField({
        required: false,
        initial: ""
      })
    };
  }
}

/**
 * LootData - Data model for loot items
 * Represents miscellaneous items, treasure, and general equipment
 */
export class LootData extends foundry.abstract.TypeDataModel {
  
  /**
   * Define the data schema for loot
   * @returns {Object} Schema definition with all loot fields
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      // ===== BASIC INFORMATION =====
      
      description: new fields.StringField({ 
        initial: "" 
      }),
      
      // Affluence value (monetary worth)
      affluence: new fields.NumberField({
        required: false,
        initial: 0,
        min: 0
      }),
      
      // Inventory slots occupied (per item)
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
      }),
      
      // Number of items (for stackable items)
      quantity: new fields.NumberField({
        required: true,
        integer: true,
        initial: 1,
        min: 1
      }),
      
      // ===== USAGE TRACKING =====
      
      // Whether to track limited uses for this item
      hasUses: new fields.BooleanField({
        required: true,
        initial: false
      }),
      
      // Current and maximum uses (when hasUses is enabled)
      uses: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
      })
    };
  }
}