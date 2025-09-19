// module/actor.js - Updated for new sheet layout

export class BLBActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      // Character portrait
      portrait: new fields.StringField({
        required: false,
        initial: ""
      }),

      // Basic attack dice
      attack: new fields.StringField({
        required: true,
        initial: "1d6",
      }),

      // Main stats
      brawn: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      wit: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      will: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 30,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      affluence: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
          max: 30,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      observation: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20,
        }),
        bonus: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 20,
        }),
      }),

      // Sub-stats
      vigour: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: -20,
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
        }),
      }),

      grip: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: 0,
          max: 30,
        }),
      }),

      // Armor (base value before modifiers)
      armor: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 7,
          min: 0,
        }),
      }),

      // Character progression
      xp: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0
      }),

      advancement: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0
      }),

      // Race and archetype
      race: new fields.StringField({
        required: false,
        initial: ""
      }),

      archetype: new fields.StringField({
        required: false,
        initial: ""
      }),
    }  
  }

  // Add computed properties (getters)
  prepareDerivedData() {
    // Calculate total stats scores, formula: base + bonus
    this.brawnTotal = this.brawn.base + this.brawn.bonus;
    this.witTotal = this.wit.base + this.wit.bonus;
    this.willTotal = this.will.base + this.will.bonus;
    this.affluenceTotal = this.affluence.base + this.affluence.bonus;
    this.observationTotal = this.observation.base + this.observation.bonus;
    this.armorTotal = this.armor.base;
    this.armorBonus = 0;

    // Add armor bonuses from equipped items
    const actor = this.parent;
    if (actor) {
      const armorItems = actor.items.filter(item => item.type === "armor");
      for (let armor of armorItems) {
        if (armor.system.equipped) {
          if (armor.system.armorType === "basic") {
            this.armorTotal += 1;
            this.armorBonus += 1;
          } else if (armor.system.armorType === "plate") {
            this.armorTotal += 2;
            this.armorBonus += 2;
          } else if (armor.system.armorType === "shield") {
            this.armorTotal += 1;
            this.armorBonus += 1;
          }
        }
      }
    }
  }
}