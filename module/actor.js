// actor.js

// Defines the data schema for the Actor document
export class BLBActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    
    // Define the schema for the 'system' object on the character.
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

      
      // Sub-stats with different styling
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

      armorType: new fields.StringField({
        required: true,
        initial: "none",
        choices: ["none", "basic", "plate"],
      }),


      // Character progression
      xp: new fields.NumberField({
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

      advquantity: new fields.SchemaField({
        base: new fields.NumberField({
        required: true,
        integer: true,
        initial: 10,
        min: -20,
        max: 20
        }),
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
    this.armorTotal = this.armor.base;
    this.armorBonus = 0; // Initialize armor bonus
    

    // Add armor bonuses from equipped items
    const actor = this.parent;
    if (actor) {
      const armorItems = actor.items.filter(item => item.type === "armor");
      for (let armor of armorItems) {
        if (armor.system.equipped) {
          // Basic armor adds +1, Plate armor adds +2
          if (armor.system.armorType === "basic") {
            this.armorTotal += 1;
            this.armorBonus += 1;
          } else if (armor.system.armorType === "plate") {
            this.armorTotal += 2;
            this.armorBonus += 2;
          }
        }
      }
    }
    
    // Add shield bonuses (independent of armor)
    if (actor) {
      const shieldItems = actor.items.filter(item => item.type === "shield");
      for (let shield of shieldItems) {
        if (shield.system.equipped) {
          this.armorTotal += 1; // Shields add +1
        }
      }
    }

  }
}
