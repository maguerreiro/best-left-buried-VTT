// actor-sheet.js

import { WEAPON_TYPES } from "../module/helpers/weapons.js";

// Define the sheet class for Actors
export class MiniActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["best-left-buried", "sheet", "actor"],
      width: 1000,
      height: 900,
      template: "systems/best-left-buried/templates/actor-template.hbs",
      tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "stats"}]
    });
  }

  getData(options) {
    const context = super.getData(options);
    context.system = context.actor.system;
    context.WEAPON_TYPES = WEAPON_TYPES;
    
    // Debug log to check data
    console.log("Actor Items:", this.actor.items);
    console.log("Weapon Types:", WEAPON_TYPES);
    
    return context;
  }

  async _onDrop(event) {
    try {
        // Get the dropped data
        const data = TextEditor.getDragEventData(event);
        
        if (data.type !== "Item") return;

        // Log the dropped data for debugging
        console.log("Dropped data:", data);

        let itemData;

        // Handle items from compendiums
        if (data.uuid) {
            const item = await fromUuid(data.uuid);
            if (!item) return;
            itemData = item.toObject();
        }
        // Handle items from the sidebar
        else if (data.id) {
            const item = game.items.get(data.id);
            if (!item) return;
            itemData = item.toObject();
        }

        // Create the item
        if (itemData) {
            // Log the item being created
            console.log("Creating item:", itemData);
            
            const created = await this.actor.createEmbeddedDocuments("Item", [itemData]);
            return created;
        }
    } catch (error) {
        console.error("Drop error:", error);
        return false;
    }
  }

  activateListeners(html) {
    super.activateListeners(html);

    // XP buttons
    html.find('.xp-button').click(async (ev) => {
        const isIncrease = ev.currentTarget.classList.contains('increase');
        const currentXP = Number(this.actor.system.xp || 0);
        const newXP = Math.max(0, currentXP + (isIncrease ? 1 : -1));
        
        console.log("Updating XP:", currentXP, "to", newXP); // Debug log
        
        await this.actor.update({
            "system.xp": newXP
        });
    });

    // Handle manual XP input
    html.find('input[name="system.xp"]').change(async (ev) => {
        const newValue = Math.max(0, Number(ev.target.value) || 0);
        await this.actor.update({
            'system.xp': newValue
        });
        ev.target.value = newValue; // Update input to show corrected value if it was negative
    });


    // Listener: "Roll Attack" button
    html.find(".roll-attack").click(async (event) => {

      // Get the attack value, ensuring it's treated as a string
      const attackValue = String(this.actor.system.attack);

      // Combine the base roll with the actor's attack value
      const formula = `1d20 + ${attackValue}`;

      const roll = await new Roll(formula).evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: "Attack Roll"
      });
    });

    
    // Listener: Roll an ability check
    html.find(".roll-ability").click(async (event) => {

      // Create a data object that the Roll function can understand
      const rollData = {
        system: this.actor.system
      };

      // gets which ability is being checked
      const button = event.currentTarget;
      const ability = button.dataset.ability;
      
      // Combine the base roll with the ability value
      const formula = `1d20 + @system.${ability}`; 

      const roll = await new Roll(formula, rollData).evaluate({ async: true });

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${ability} Check`
      });
    });


    // Listener: Click on an item's name or image to open its sheet
    html.find(".weapon-name").click((event) => {
      event.preventDefault();
      const weaponRow = event.currentTarget.closest(".weapon-row");
      const itemId = weaponRow.dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) {
        item.sheet.render(true);
      }
    });


    // Listener: Click on the delete button to remove a weapon
    html.find(".item-delete").click(async (event) => {
      event.preventDefault();
      const weaponRow = event.currentTarget.closest(".weapon-row");
      const itemId = weaponRow.dataset.itemId;
      const item = this.actor.items.get(itemId);
      if (item) {
        await item.delete();
      }
    });

    // Listener: Roll a weapon attack
    html.find(".weapon-roll").click(async (event) => {
      event.preventDefault();
      const weaponId = event.currentTarget.dataset.weaponId;
      const weapon = this.actor.items.get(weaponId);
      
      if (!weapon) {
        console.error("Weapon not found:", weaponId);
        return;
      }

      // Get weapon type from WEAPON_TYPES
      const weaponType = weapon.system.type || "hand";
      const weaponTypeData = WEAPON_TYPES[weaponType];
      
      if (!weaponTypeData) {
        console.error("Weapon type data not found for:", weaponType);
        return;
      }

      // Get the attack stat
      let attackStat = weaponTypeData.attackStat;
      
      // Handle throwing weapons that can use either wit or brawn
      if (weaponType === "throwing" && weapon.system.inMelee) {
        const choice = await new Promise(resolve => {
          new Dialog({
            title: "Choose Attack Stat",
            content: `<p>Choose stat for ${weapon.name} attack:</p>`,
            buttons: {
              wit: {
                label: "Wit (Normal)",
                callback: () => resolve("wit")
              },
              brawn: {
                label: "Brawn (Penalty)",
                callback: () => resolve("brawn")
              }
            },
            default: "wit"
          }).render(true);
        });
        attackStat = choice;
      }

      const attackStatValue = this.actor.system[attackStat + "Total"] || 0;
      
      // Calculate damage modifier
      let damageMod = weaponTypeData.damageMod || 0;
      if (weapon.system.isTwoHanded && weaponTypeData.twoHandedBonus) {
        damageMod += 1;
      }

      // Add penalty for throwing weapons in melee using brawn
      let attackPenalty = 0;
      if (weaponType === "throwing" && weapon.system.inMelee && attackStat === "brawn") {
        attackPenalty = -2;
      }

      // Roll attack
      const attackFormula = `1d20 + ${attackStatValue} + ${attackPenalty}`;
      const attackRoll = await new Roll(attackFormula).evaluate({async: true});
      
      let flavorText = `${weapon.name} Attack Roll (${attackStat})`;
      if (attackPenalty < 0) {
        flavorText += ` with penalty`;
      }
      
      attackRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: flavorText
      });

      // Roll damage
      const damageFormula = `1d6 + ${damageMod}`;
      const damageRoll = await new Roll(damageFormula).evaluate({async: true});
      
      damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${weapon.name} Damage Roll`
      });
    });
  }
}