// module/item.js

// Base item data model
export class BLBItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      description: new fields.StringField({
        required: true,
        initial: "",
      }),
    };
  }
}

// Weapon data model
export class BLBWeaponData extends BLBItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const baseSchema = super.defineSchema();
    
    return {
      ...baseSchema,
      type: new fields.StringField({
        required: true,
        initial: "hand",
      }),
      isTwoHanded: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      inMelee: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}

// Armor data model
export class BLBArmorData extends BLBItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const baseSchema = super.defineSchema();
    
    return {
      ...baseSchema,
      armorType: new fields.StringField({
        required: true,
        initial: "basic",
        choices: ["basic", "plate"],
      }),
      equipped: new fields.BooleanField({
        required: true,
        initial: false, // This ensures armor starts unequipped
      }),
    };
  }
}

// Shield data model
export class BLBShieldData extends BLBItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    const baseSchema = super.defineSchema();
    
    return {
      ...baseSchema,
      equipped: new fields.BooleanField({
        required: true,
        initial: false, // This ensures shields start unequipped
      }),
    };
  }
}