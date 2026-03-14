// module/models/npc-data.js
// Data model for NPCs

export class NPCData extends foundry.abstract.TypeDataModel {
  
  static defineSchema() {
    const fields = foundry.data.fields;
    
    return {
      // Primary attributes (no bonus, just base)
      brawn: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        })
      }),

      wit: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        })
      }),

      will: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        })
      }),

      observation: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 0,
          min: -20,
          max: 20
        })
      }),

      // Resource pools
      vigour: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: -20
        }),
        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0
        })
      }),

      grip: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 4,
          min: 0,
          max: 30
        })
      }),

      // Armor value (input field, no calculation)
      armor: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 7,
          min: 0
        })
      })
    };
  }

  prepareDerivedData() {
    // Set totals (for NPCs, total = base since no bonuses)
    this.brawnTotal = this.brawn.base;
    this.witTotal = this.wit.base;
    this.willTotal = this.will.base;
    this.observationTotal = this.observation.base;
    this.armorTotal = this.armor.base;
  }
}