// module/items.js - Updated for new item requirements

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
      }),
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
      }),
      customDamageMod: new fields.NumberField({
        required: false,
        initial: null,
        nullable: true,
        integer: true
      }),
      customInitiative: new fields.NumberField({
        required: false,
        initial: null,
        nullable: true,
        integer: true
      }),
      customRange: new fields.StringField({
        required: false,
        initial: null,
        nullable: true
      }),
      customAttackStat: new fields.StringField({
        required: false,
        initial: null,
        nullable: true
      })
    };
  }

  // Set default icon based on weapon type
  prepareDerivedData() {
    const parent = this.parent;
    if (parent && (parent.img === "icons/svg/item-bag.svg" || !parent.img)) {
      let defaultIcon = "systems/best-left-buried/icons/weapon_1_hand.svg";
      
      switch (this.weaponType) {
        case "heavy":
        case "long":
          defaultIcon = "systems/best-left-buried/icons/weapon_2_hand.svg";
          break;
        case "hand":
        case "light":
        case "ranged":
        case "throwing":
        default:
          defaultIcon = "systems/best-left-buried/icons/weapon_1_hand.svg";
          break;
      }
      
      // Don't update here to avoid infinite loops, this is handled in the sheet
    }
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
      }),
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
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
      // No advancementType field anymore
      // No equipped field anymore
      rollFormula: new fields.StringField({
        required: false,
        initial: "2d6"
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
        initial: "injury",
        choices: ["injury", "affliction"]
      }),
      active: new fields.BooleanField({
        required: true,
        initial: false
      }),
      // Flag to enable/disable uses tracking
      hasUses: new fields.BooleanField({
        required: true,
        initial: false
      }),
      // New fields for number of uses
      uses: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
        }),
      }),
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
      affluence: new fields.NumberField({
        required: false,
        initial: 0,
        min: 0
      }),
      // No lootType field anymore
      slotValue: new fields.NumberField({
        required: true,
        initial: 1,
        min: 0
      })
    };
  }
}