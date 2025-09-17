// module/main.js - DEBUG VERSION

import { BLBActorData } from "./actor.js";
import { BLBWeaponData, BLBArmorData, BLBShieldData, BLBAdvancementData, BLBLootData } from "./items.js";
import { WEAPON_TYPES } from "./helpers/weapons.js";
import { ARMOR_TYPES, SHIELD_TYPES } from "./helpers/armor.js";
import { ADVANCEMENT_TYPES, LOOT_TYPES } from "./helpers/new_items.js";


class BLBActor extends Actor {}

Hooks.once("init", () => {
  console.log("=== BEST LEFT BURIED DEBUG START ===");
  
  // Register document class
  CONFIG.Actor.documentClass = BLBActor;

  // Initialize and register data models
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {};
  CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
  
  CONFIG.Actor.dataModels.character = BLBActorData;
  CONFIG.Item.dataModels.weapon = BLBWeaponData;
  CONFIG.Item.dataModels.armor = BLBArmorData;
  CONFIG.Item.dataModels.shield = BLBShieldData;
  CONFIG.Item.dataModels.advancement = BLBAdvancementData;
  CONFIG.Item.dataModels.loot = BLBLootData;


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

  Handlebars.registerHelper('getWeaponDamage', function(weaponType, isTwoHanded, inMelee) {
    const weaponData = WEAPON_TYPES[weaponType];
    if (!weaponData) return 0;
    let damage = weaponData.damageMod || 0;
    if (inMelee && weaponData.meleePenalty) {
      damage += -1;
    }
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

  Handlebars.registerHelper('getAdvancementType', function(advancementType) {
    const advData = ADVANCEMENT_TYPES[advancementType];
    return advData ? advData.label : advancementType;
  });

  Handlebars.registerHelper('getLootType', function(lootType) {
    const lootData = LOOT_TYPES[lootType];
    return lootData ? lootData.label : lootType;
  });

  Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper('or', function(a, b) {
    return a || b;
  });

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
      types: ["weapon", "armor", "shield", "advancement", "loot"], // Add new types here
      makeDefault: true,
      label: "Best Left Buried Item Sheet V2"
    });
    
    console.log("Sheets registered successfully");
  } catch (error) {
    console.error("Sheet registration failed:", error);
  }
});