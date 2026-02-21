// module/config/constants.js
// System-wide constants and configuration values

/**
 * Core system constants
 * Centralized configuration for the Best Left Buried system
 */
export const SystemConstants = {
  // Character attribute identifiers
  ATTRIBUTES: {
    BRAWN: 'brawn',
    WIT: 'wit',
    WILL: 'will',
    AFFLUENCE: 'affluence',
    OBSERVATION: 'observation'
  },

  // Roll modifiers and variants
  ROLL_MODES: {
    STANDARD: 'standard',
    UPPER_HAND: 'upperHand',
    AGAINST_ODDS: 'againstOdds'
  },

  // Standard dice formulas for different roll types
  DICE_FORMULAS: {
    // Attribute checks
    ATTRIBUTE_CHECK_STANDARD: '2d6',
    ATTRIBUTE_CHECK_ADVANTAGE: '3d6kh2',     // Keep highest 2
    ATTRIBUTE_CHECK_DISADVANTAGE: '3d6kl2',  // Keep lowest 2
    
    // Weapon attacks
    WEAPON_ATTACK_STANDARD: '3d6',
    WEAPON_ATTACK_ADVANTAGE: '4d6kh2',
    WEAPON_ATTACK_DISADVANTAGE: '4d6kl2'
  },

  // Encumbrance calculation constants
  ENCUMBRANCE: {
    BASE_CAPACITY: 12,
    BRAWN_MULTIPLIER: 2
  },

  // Armor system defaults
  ARMOR: {
    BASE_VALUE: 7,
    BASIC_BONUS: 1,
    PLATE_BONUS: 2,
    SHIELD_BONUS: 1
  },

  // UI layout configuration
  UI_LAYOUT: {
    EXTERNAL_TABS: {
      WIDTH: 120,
      HEIGHT: 25,
      OFFSET_X: -49,
      OFFSET_Y: 100
    },
    SHEET_DIMENSIONS: {
      DEFAULT_WIDTH: 870,
      DEFAULT_HEIGHT: 700
    }
  },

  // Game mechanics thresholds
  MECHANICS: {
    ATTRIBUTE_CHECK_SUCCESS_THRESHOLD: 9
  }
};

/**
 * Visual theme constants
 * Colors used for different UI states and roll results
 */
export const ThemeColors = {
  // Roll result indicators
  SUCCESS: '#4caf50',
  FAILURE: '#f44336',
  UPPER_HAND: '#77DD77',
  AGAINST_ODDS: '#FF6B6B',
  
  // UI element colors
  PRIMARY_ACCENT: '#4a90e2',
  SECONDARY_ACCENT: '#357abd'
};

/**
 * Default asset paths
 * Icons and images used throughout the system
 */
export const AssetPaths = {
  ICONS: {
    WEAPON_ONE_HANDED: "systems/best-left-buried/icons/weapon_1_hand.svg",
    WEAPON_TWO_HANDED: "systems/best-left-buried/icons/weapon_2_hand.svg",
    ITEM_GENERIC: "icons/svg/item-bag.svg"
  }
};

/**
 * Item type identifiers
 */
export const ItemTypes = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  ADVANCEMENT: 'advancement',
  CONSEQUENCE: 'consequence',
  LOOT: 'loot'
};

/**
 * Actor type identifiers
 */
export const ActorTypes = {
  CHARACTER: 'character'
};