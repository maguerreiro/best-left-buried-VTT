// module/helpers/weapon-properties.js
// Weapon type definitions and properties

/**
 * Range categories for weapons
 */
export const WEAPON_RANGES = {
    melee: "Melee",
    short: "Short Range",
    long: "Long Range"
};

/**
 * Attributes that can be used for weapon attacks
 */
export const ATTACK_ATTRIBUTES = {
    brawn: "Brawn",
    wit: "Wit",
    will: "Will"
};

/**
 * Weapon type definitions
 * Each type defines default properties that can be overridden per weapon
 */
export const WEAPON_TYPES = {
    hand: {
        label: "Hand Weapon",
        range: "melee",
        attackStat: "brawn",
        damageMod: 0,
        initiative: 0,
        twoHandedBonus: true  // Can be wielded two-handed for +1 damage
    },
    
    heavy: {
        label: "Heavy Weapon",
        range: "melee",
        attackStat: "brawn",
        damageMod: 1,
        initiative: -1
    },

    light: {
        label: "Light Weapon",
        range: "melee",
        attackStat: "wit",
        damageMod: -1,
        initiative: 0
    },

    long: {
        label: "Long Weapon",
        range: "short",
        attackStat: "brawn",
        damageMod: 0,
        initiative: -1,
        twoHandedBonus: true  // Can be wielded two-handed for +1 damage
    },

    ranged: {
        label: "Ranged Weapon",
        range: "long",
        attackStat: "wit",
        damageMod: 0,
        initiative: 0
    },

    throwing: {
        label: "Throwing Weapon",
        range: "short",
        attackStat: "wit",
        damageMod: 0,
        initiative: 0,
        meleePenalty: true  // -1 damage when used in melee
    }
};