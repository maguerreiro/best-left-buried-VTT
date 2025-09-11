// helpers/weapons.js

export const WEAPON_TYPES = {
    hand: {
        label: "Hand Weapon",
        range: "melee",
        attackStat: "brawn",
        damageMod: 0,
        initiative: 0,
        twoHandedBonus: true
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
        twoHandedBonus: true
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
        meleePenalty: true
    }

};