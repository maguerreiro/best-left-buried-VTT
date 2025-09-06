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
        case "shield":
          defaultImg = "icons/svg/item-bag.svg"; // or set a custom shield icon
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
import { BLBWeaponData, BLBArmorData, BLBShieldData } from "./items.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "./helpers/armor.js";

Hooks.once("init", () => {
  console.log("Best Left Buried | Initializing");
 
  // Register custom Handlebars helpers
  Handlebars.registerHelper('getWeaponType', function(itemType) {
    return itemType.replace('weapon-', '');
  });
 
  Handlebars.registerHelper('getWeaponProperty', function(weaponType, property) {
    const weaponData = WEAPON_TYPES[weaponType];
    return weaponData ? weaponData[property] : '';
  });
 
  Handlebars.registerHelper('getWeaponDamage', function(weaponType, isTwoHanded) {
    const weaponData = WEAPON_TYPES[weaponType];
    if (!weaponData) return 0;
   
    let damage = weaponData.damageMod || 0;
    if (isTwoHanded && weaponData.twoHandedBonus) {
      damage += 1;
    }
    return damage;
  });

  // Helper for armor types
  Handlebars.registerHelper('getArmorType', function(armorType) {
    const armorData = ARMOR_TYPES[armorType];
    return armorData ? armorData.label : armorType;
  });

  // Math helper for simple calculations
  Handlebars.registerHelper('math', function(lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    
    switch (operator) {
      case '+': return lvalue + rvalue;
      case '-': return lvalue - rvalue;
      case '*': return lvalue * rvalue;
      case '/': return rvalue !== 0 ? lvalue / rvalue : 0;
      case '%': return rvalue !== 0 ? lvalue % rvalue : 0;
      default: return 0;
    }
  });

  // Helper for logical AND operations
  Handlebars.registerHelper('and', function() {
    const args = Array.prototype.slice.call(arguments, 0, -1); // Remove options object
    return args.every(Boolean);
  });

  // Helper for logical NOT operations  
  Handlebars.registerHelper('ne', function(a, b) {
    return a !== b;
  });

  // Register the custom document classes
  CONFIG.Actor.documentClass = BLBActor;
  CONFIG.Item.documentClass = BLBItem;
 
  // Register the custom data models
  CONFIG.Actor.dataModels.character = BLBActorData;
  
  // Register item data models
  CONFIG.Item.dataModels.weapon = BLBWeaponData;
  CONFIG.Item.dataModels.armor = BLBArmorData;
  CONFIG.Item.dataModels.shield = BLBShieldData;
 
  // Unregister the default Actor Sheet
  Actors.unregisterSheet("core", ActorSheet);

  // Register the custom Actor sheet
  Actors.registerSheet("best-left-buried", MiniActorSheet, {
    types: ["character"],
    makeDefault: true
  });
 
  // Unregister the default Item Sheet
  Items.unregisterSheet("core", ItemSheet);
  
  // Register the custom Item Sheet for all item types
  Items.registerSheet("best-left-buried", MiniItemSheet, {
    types: ["weapon", "armor", "shield"],
    makeDefault: true
  });
});