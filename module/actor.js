// actor.js

// Defines the data schema for the Actor document
export class BLBActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    // Define the schema for the 'system' object on the character.
    return {
      attack: new fields.StringField({
        required: true,
        initial: "1d6",
      }),


      brawn: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
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


      wit: new fields.SchemaField({
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


      vigour: new fields.SchemaField({
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

      
      grip: new fields.SchemaField({
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


      // Health/Hit Points
      health: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
        }),


        max: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
        }),
      }),


      // Armor (base value before modifiers)
      armor: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          integer: true,
          initial: 10,
          min: 0,
        }),
      }),


      armorType: new fields.StringField({
        required: true,
        initial: "none",
        choices: ["none", "shield", "basic", "plate"]
      }),


      xp: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0
      }),
    };
  }


  // Add computed properties (getters)
  prepareDerivedData() {

    // Calculate total stats scores, formula: base + bonus
    this.brawnTotal = this.brawn.base + this.brawn.bonus;
    this.witTotal = this.wit.base + this.wit.bonus;
    this.affluenceTotal = this.affluence.base + this.affluence.bonus;
    this.vigourTotal = this.vigour.base + this.vigour.bonus;
    this.gripTotal = this.grip.base + this.grip.bonus;
    this.armorTotal = this.armor.base;
    
    // Add armor bonuses from equipped items
    const actor = this.parent;
    if (actor) {
      const armorItems = actor.items.filter(item => item.type === "armor");
      for (let armor of armorItems) {
        if (armor.system.equipped) {
          this.armorTotal += armor.system.armor.bonus || 0;
        }
      }
    }
    

    // Calculate max health (base + constitution modifier)
    if (this.health.max < (10 + this.constitutionMod)) {
      this.health.max = Math.max(1, 10 + this.constitutionMod);
    }
  }
}
