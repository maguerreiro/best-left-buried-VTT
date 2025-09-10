// module/main.js - DEBUG VERSION

import { BLBActorData } from "./actor.js";
import { BLBWeaponData, BLBArmorData, BLBShieldData } from "./items.js";
import { WEAPON_TYPES } from "./helpers/weapons.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "./helpers/armor.js";

class BLBActor extends Actor {}

Hooks.once("init", () => {
  console.log("=== BEST LEFT BURIED DEBUG START ===");
  
  // Check if data models loaded correctly
  console.log("Data models loaded:", {
    BLBActorData: !!BLBActorData,
    BLBWeaponData: !!BLBWeaponData, 
    BLBArmorData: !!BLBArmorData,
    BLBShieldData: !!BLBShieldData
  });

  // Register document class
  CONFIG.Actor.documentClass = BLBActor;
  console.log("Actor document class registered");

  // Initialize and register data models
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {};
  CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
  
  CONFIG.Actor.dataModels.character = BLBActorData;
  CONFIG.Item.dataModels.weapon = BLBWeaponData;
  CONFIG.Item.dataModels.armor = BLBArmorData;
  CONFIG.Item.dataModels.shield = BLBShieldData;

  console.log("Data models after registration:", {
    Actor: Object.keys(CONFIG.Actor.dataModels),
    Item: Object.keys(CONFIG.Item.dataModels)
  });

  // Test data model instantiation
  try {
    console.log("Testing weapon data model...");
    const testWeapon = new BLBWeaponData({});
    console.log("Weapon model test passed:", testWeapon);
  } catch (error) {
    console.error("Weapon model test failed:", error);
  }

  try {
    console.log("Testing armor data model...");
    const testArmor = new BLBArmorData({});
    console.log("Armor model test passed:", testArmor);
  } catch (error) {
    console.error("Armor model test failed:", error);
  }

  try {
    console.log("Testing shield data model...");
    const testShield = new BLBShieldData({});
    console.log("Shield model test passed:", testShield);
  } catch (error) {
    console.error("Shield model test failed:", error);
  }

  // Register Handlebars helpers
  Handlebars.registerHelper('select', function(selected, options) {
    const select = document.createElement('select');
    select.innerHTML = options.fn(this);
    select.value = selected;
    if (select.children[select.selectedIndex]) {
      select.children[selected ].setAttribute('selected', 'selected');
    }
    return select.innerHTML;
  });

  Handlebars.registerHelper('checked', function(value) {
    return value ? 'checked' : '';
  });

  Handlebars.registerHelper('getWeaponProperty', function(weaponType, property) {
    const weaponData = WEAPON_TYPES[weaponType];
    if (!weaponData) {
      console.warn(`Weapon type "${weaponType}" not found in WEAPON_TYPES`);
      return '';
    }
    const result = weaponData[property];
    console.log(`getWeaponProperty: ${weaponType}.${property} = ${result}`);
    return result || '';
  });

  Handlebars.registerHelper('getWeaponDamage', function(weaponType, isTwoHanded) {
    const weaponData = WEAPON_TYPES[weaponType];
    if (!weaponData) return 0;
    let damage = weaponData.damageMod || 0;
    if (isTwoHanded && weaponData.twoHandedBonus) {
      damage += 1;
    }
    return damage >= 0 ? `+${damage}` : `${damage}`;
  });

  Handlebars.registerHelper('getArmorType', function(armorType) {
    const armorData = ARMOR_TYPES[armorType];
    return armorData ? armorData.label : armorType;
  });

  Handlebars.registerHelper('getShieldType', function(shieldType) {
    const shieldData = SHIELD_TYPES[shieldType];
    return shieldData ? shieldData.label : shieldType;
  });

  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper('or', function(a, b) {
    return a || b;
  });

  console.log("Handlebars helpers registered");
  console.log("=== BEST LEFT BURIED DEBUG COMPLETE ===");
});

// Hook to debug item creation
Hooks.on("preCreateItem", (document, data, options, userId) => {
  console.log("=== ITEM CREATION DEBUG ===");
  console.log("Document:", document);
  console.log("Data:", data);
  console.log("Document type:", data.type);
  console.log("Available data models:", Object.keys(CONFIG.Item.dataModels || {}));
  console.log("Model for this type:", CONFIG.Item.dataModels?.[data.type]);
  console.log("=== END ITEM CREATION DEBUG ===");
});

Hooks.once("ready", async () => {
  console.log("=== REGISTERING SHEETS ===");
  
  try {
    const { BLBActorSheetV2 } = await import("../sheets/actor-sheet-v2.js");
    const { BLBItemSheetV2 } = await import("../sheets/item-sheet-v2.js");
    
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "best-left-buried", BLBActorSheetV2, {
      types: ["character"],
      makeDefault: true,
      label: "Best Left Buried Character Sheet V2"
    });
    
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Item, "best-left-buried", BLBItemSheetV2, {
      types: ["weapon", "armor", "shield"],
      makeDefault: true,
      label: "Best Left Buried Item Sheet V2"
    });
    
    console.log("Sheets registered successfully");
  } catch (error) {
    console.error("Sheet registration failed:", error);
  }
});