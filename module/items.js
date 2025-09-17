// module/item.js - COMPLETE DATA MODELS

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
        choices: ["basic", "plate"]
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false
      })
    };
  }
}

export class BLBShieldData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField({ 
        initial: "" 
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
      rollFormula: new fields.StringField({
        required: false,
        initial: "1d20"
      }),
      usesAttribute: new fields.StringField({
        required: false,
        initial: "none",
        choices: ["none", "brawn", "wit", "will"]
      }),
      advancementType: new fields.StringField({
        required: true,
        initial: "ability",
        choices: ["ability", "spell", "skill", "trait"]
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: true
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
        initial: "misc",
        choices: ["misc", "valuable", "artifact", "consumable"]
      })
    };
  }
}