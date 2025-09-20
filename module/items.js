// module/items.js - Updated for better default icons

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