// module/items.js - Updated for new item types

export class BLBWeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
      }),
      weaponType: new fields.StringField({
        required: true,
        initial: "hand",
        choices: ["hand", "heavy", "light", "long", "ranged", "throwing"]
      }),
      isTwoHanded: new fields.BooleanField({
        required: true,
        initial: false
      }),
      inMelee: new fields.BooleanField({
        required: true,
        initial: false
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}

export class BLBArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
      }),
      armorType: new fields.StringField({
        required: true,
        initial: "basic",
        choices: ["basic", "plate", "shield"]
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}

export class BLBAdvancementData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
      }),
      advancementType: new fields.StringField({
        required: true,
        initial: "special_ability",
        choices: ["special_ability", "ability", "spell", "skill", "trait"]
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}

export class BLBConsequenceData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
      }),
      consequenceType: new fields.StringField({
        required: true,
        initial: "negative_effect",
        choices: ["negative_effect", "ability"]
      }),
      active: new fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}

export class BLBLootData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
      }),
      value: new fields.NumberField({
        required: false,
        initial: 0,
        min: 0
      }),
      lootType: new fields.StringField({
        required: true,
        initial: "adventuring_gear",
        choices: ["adventuring_gear", "treasure", "misc", "valuable", "artifact", "consumable"]
      })
    };
  }
}