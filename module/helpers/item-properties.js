// module/helpers/item-properties.js
// Item type definitions for advancements, consequences, and loot

/**
 * Advancement type definitions
 * Currently no specific types, but structure allows for future expansion
 */
export const ADVANCEMENT_TYPES = {};

/**
 * Loot type definitions
 * Currently no specific types, but structure allows for future expansion
 */
export const LOOT_TYPES = {};

/**
 * Consequence type definitions
 * Consequences can be physical injuries or mental/supernatural afflictions
 */
export const CONSEQUENCE_TYPES = {
    injury: {
        label: "Injury",
        description: "Physical injuries and wounds"
    },
    affliction: {
        label: "Affliction",
        description: "Mental or supernatural afflictions"
    }
};