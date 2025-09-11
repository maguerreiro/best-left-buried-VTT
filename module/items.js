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