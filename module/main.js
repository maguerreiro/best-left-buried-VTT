// module/main.js

// Create Custom Document Classes
class BLBActor extends Actor {}


class BLBItem extends Item {

  // Override the _onCreate method to set default images based on type
  async _onCreate(data, options, userId) {
    await super._onCreate(data, options, userId);
    
    // Set default image based on item type if no custom image was provided
    if (this.img === "icons/svg/item-bag.svg") {
      let defaultImg;
      
      switch (this.type) {
        case "weapon":
          defaultImg = "systems/best-left-buried/icons/weapon_2_hand.svg";
          break;
        case "armor":
          defaultImg = "icons/svg/item-bag.svg"; // or set a custom armor icon
          break;
        default:
          defaultImg = "icons/svg/item-bag.svg";
      }
      
      // Update the image
      await this.update({ img: defaultImg });
    }
  }
}


// Import custom sheets
import { MiniActorSheet } from "../sheets/actor-sheet.js";
import { MiniItemSheet } from "../sheets/item-sheet.js";

// Import custom data models
import { BLBActorData } from "./actor.js";
import { WEAPON_TYPES } from "./helpers/weapons.js";

Hooks.once("init", () => {
  console.log("Best Left Buried | Initializing");
  
  // Register custom Handlebars helpers
  Handlebars.registerHelper('getWeaponType', function(itemType) {
    return itemType.replace('weapon-', '');
  });

  // Register the custom document classes
  CONFIG.Actor.documentClass = BLBActor;
  CONFIG.Item.documentClass = BLBItem;
  
  // Register the custom data models
  CONFIG.Actor.dataModels.character = BLBActorData;

  // Unregister the default Actor Sheet 
  Actors.unregisterSheet("core", ActorSheet);

  // Register the custom Actor sheet
  Actors.registerSheet("best-left-buried", MiniActorSheet, {
    types: ["character"],
    makeDefault: true
  });

  // Unregister the default Item Sheet
  Items.unregisterSheet("core", ItemSheet);

  // Register the custom Item Sheet
  Items.registerSheet("best-left-buried", MiniItemSheet, {
    types: ["weapon"],
    makeDefault: true
  });
});