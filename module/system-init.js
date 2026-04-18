// module/main.js
// Main entry point for the Best Left Buried system

import { CharacterData } from "./models/character-data.js";
import { NPCData } from "./models/npc-data.js";
import { WeaponData, ArmorData, AdvancementData, ConsequenceData, LootData } from "./models/item-data.js";
import { WEAPON_TYPES } from "./helpers/weapon-properties.js";
import { ARMOR_TYPES } from "./helpers/armor-properties.js";
import { CONSEQUENCE_TYPES } from "./helpers/item-properties.js";
import { registerTemplateHelpers } from "./helpers/template-helpers.js";
import { AssetPaths } from "./config/constants.js";
import { getWeaponIconPath, isDefaultIcon } from "./config/constants.js";

/**
 * BestLeftBuriedActor - Custom Actor class
 * Extends the base Foundry Actor with system-specific functionality
 */
class BestLeftBuriedActor extends Actor {}

/**
 * Initialize the system
 * Registers data models and Handlebars helpers
 * Runs once when Foundry starts up
 */
Hooks.once("init", () => {
  console.log("=== BEST LEFT BURIED: INITIALIZING ===");
  
  // Register custom Actor class
  CONFIG.Actor.documentClass = BestLeftBuriedActor;

  // Initialize data model registries
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {};
  CONFIG.Item.dataModels = CONFIG.Item.dataModels || {};
  
  // Register Actor data models
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.npc = NPCData;
  
  // Register Item data models
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.armor = ArmorData;
  CONFIG.Item.dataModels.advancement = AdvancementData;
  CONFIG.Item.dataModels.consequence = ConsequenceData;
  CONFIG.Item.dataModels.loot = LootData;

  // Register Handlebars template helpers
  registerTemplateHelpers();
  
  // Set default weapon icon at creation time (not in prepareDerivedData)
  Hooks.on('preCreateItem', (item, data) => {
    if (item.type !== 'weapon') return;
    if (data.img && data.img !== 'icons/svg/item-bag.svg') return;

    const weaponType = data.system?.weaponType || 'hand';
    item.updateSource({ img: getWeaponIconPath(weaponType) });
  });

  // Update weapon icon when weapon type changes (if still using a default icon)
  Hooks.on('preUpdateItem', (item, changes) => {
    if (item.type !== 'weapon') return;
    if (!changes.system?.weaponType) return;

    const currentImg = item.img;
    const defaultIcons = Object.values(AssetPaths.ICONS);
    const isDefaultIcon = !currentImg
      || currentImg === 'icons/svg/item-bag.svg'
      || defaultIcons.includes(currentImg);

    if (!isDefaultIcon) return;

    const iconMap = {
      heavy: AssetPaths.ICONS.WEAPON_TWO_HANDED,
      throwing: AssetPaths.ICONS.THROWING_WEAPON,
      ranged: AssetPaths.ICONS.RANGED_WEAPON,
      long: AssetPaths.ICONS.LONG_WEAPON
    };
    changes.img = iconMap[changes.system.weaponType] || AssetPaths.ICONS.WEAPON_ONE_HANDED;
  });

  console.log("=== BEST LEFT BURIED: DATA MODELS REGISTERED ===");
});

/**
 * Register sheets once Foundry is ready
 * Ensures all dependencies are loaded before sheet registration
 */
Hooks.once("ready", async () => {
  console.log("=== BEST LEFT BURIED: REGISTERING SHEETS ===");
  
  try {
    // Import sheet classes dynamically
    const { CharacterSheet } = await import("../sheets/character-sheet.js");
    const { NPCSheet } = await import("../sheets/npc-sheet.js");
    const { ItemSheet } = await import("../sheets/item-sheet.js");
    
    // Register character sheet
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      Actor, 
      "best-left-buried", 
      CharacterSheet, 
      {
        types: ["character"],
        makeDefault: true,
        label: "Best Left Buried Character Sheet"
      }
    );
    
    // Register NPC sheet
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      Actor, 
      "best-left-buried", 
      NPCSheet, 
      {
        types: ["npc"],
        makeDefault: true,
        label: "Best Left Buried NPC Sheet"
      }
    );
    
    // Register item sheet (handles all item types)
    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      Item, 
      "best-left-buried", 
      ItemSheet, 
      {
        types: ["weapon", "armor", "advancement", "consequence", "loot"],
        makeDefault: true,
        label: "Best Left Buried Item Sheet"
      }
    );
    
    console.log("=== BEST LEFT BURIED: SHEETS REGISTERED SUCCESSFULLY ===");
  } catch (error) {
    console.error("=== BEST LEFT BURIED: SHEET REGISTRATION FAILED ===", error);
  }
});