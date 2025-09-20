// sheets/item-sheet-v2.js - Updated for textarea descriptions and weapon icons

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES } from "../module/helpers/armor.js";
import { ADVANCEMENT_TYPES, CONSEQUENCE_TYPES, LOOT_TYPES } from "../module/helpers/new_items.js";

export class BLBItemSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["best-left-buried", "sheet", "item"],
    position: { width: 520, height: 480 },
    window: { 
      title: "Best Left Buried Item",
      resizable: true,
      minimizable: true
    },
    form: {
      handler: BLBItemSheetV2.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      updateWeaponType: BLBItemSheetV2.#onUpdateWeaponType,
      updateArmorType: BLBItemSheetV2.#onUpdateArmorType,
      updateAdvancementType: BLBItemSheetV2.#onUpdateAdvancementType,
      updateConsequenceType: BLBItemSheetV2.#onUpdateConsequenceType,
      updateLootType: BLBItemSheetV2.#onUpdateLootType,
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/best-left-buried/templates/item-v2.hbs"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const doc = this.document;
    const src = doc.toObject();

    // Set default icons based on item type and weapon type
    let defaultIcon = doc.img;
    if (doc.img === "icons/svg/item-bag.svg" || !doc.img || doc.img === "") {
      defaultIcon = this._getDefaultIcon(doc.type, doc.system.weaponType);
    }

    return {
      item: doc,
      source: src,
      system: doc.system,
      defaultIcon: defaultIcon,
      WEAPON_TYPES,
      ARMOR_TYPES,
      ADVANCEMENT_TYPES,
      CONSEQUENCE_TYPES,
      LOOT_TYPES
    };
  }

  _getDefaultIcon(itemType, weaponType) {
    if (itemType === "weapon") {
      if (weaponType === "hand") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "heavy" || weaponType === "long") {
        return "systems/best-left-buried/icons/weapon_2_hand.svg";
      }
      // Default weapon icon for other types
      return "systems/best-left-buried/icons/weapon_1_hand.svg";
    }
    
    // Default Foundry icons for other types
    return "icons/svg/item-bag.svg";
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    
    // Set the default icon if needed
    if (this.document.img === "icons/svg/item-bag.svg" || !this.document.img) {
      const newIcon = this._getDefaultIcon(this.document.type, this.document.system.weaponType);
      if (newIcon !== this.document.img) {
        await this.document.update({ img: newIcon }, { render: false });
      }
    }
  }

  // Event Handlers
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onUpdateWeaponType(event, target) {
    const newType = target.value;
    
    // Get the appropriate icon for the new weapon type
    let newIcon = this._getDefaultIcon("weapon", newType);
    
    await this.document.update({
      "system.weaponType": newType,
      "system.isTwoHanded": false,
      "system.inMelee": false,
      "img": newIcon
    });
  }

  static async #onUpdateArmorType(event, target) {
    const newArmorType = target.value;
    await this.document.update({
      "system.armorType": newArmorType
    });
  }

  static async #onUpdateAdvancementType(event, target) {
    const newAdvancementType = target.value;
    await this.document.update({
      "system.advancementType": newAdvancementType
    });
  }

  static async #onUpdateConsequenceType(event, target) {
    const newConsequenceType = target.value;
    await this.document.update({
      "system.consequenceType": newConsequenceType
    });
  }

  static async #onUpdateLootType(event, target) {
    const newLootType = target.value;
    await this.document.update({
      "system.lootType": newLootType
    });
  }
}