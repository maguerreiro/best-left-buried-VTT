// module/helpers/armor-properties.js
// Armor type definitions and bonuses

/**
 * Armor type definitions
 * Each type provides a different armor bonus when equipped
 */
export const ARMOR_TYPES = {
    basic: {
        label: "Basic Armor (+1)",
        bonus: 1
    },
    plate: {
        label: "Plate Armor (+2)", 
        bonus: 2
    },
    shield: {
        label: "Shield (+1)",
        bonus: 1
    }
};