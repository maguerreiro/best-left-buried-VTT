// module/helpers/armor.js - Updated to include shields

export const ARMOR_TYPES = {
    basic: {
        label: "Basic armor (+1)",
        bonus: 1
    },
    plate: {
        label: "Plate armor (+2)", 
        bonus: 2
    },
    shield: {
        label: "Shield (+1)",
        bonus: 1
    }
};

// module/helpers/new_items.js - Updated item types

export const ADVANCEMENT_TYPES = {
    special_ability: {
        label: "Special Ability",
        description: "Special character abilities and powers"
    }
};

export const CONSEQUENCE_TYPES = {
    negative_effect: {
        label: "Negative Effect",
        description: "Negative consequences and debuffs"
    }
};

export const LOOT_TYPES = {
    adventuring_gear: {
        label: "Adventuring Gear",
        description: "Equipment and tools for adventuring"
    },
    treasure: {
        label: "Treasure",
        description: "Valuable items and treasures"
    }
};