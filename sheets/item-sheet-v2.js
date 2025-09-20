// sheets/item-sheet-v2.js - Updated for new item types

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

    return {
      item: doc,
      source: src,
      system: doc.system,
      WEAPON_TYPES,
      ARMOR_TYPES,
      ADVANCEMENT_TYPES,
      CONSEQUENCE_TYPES,
      LOOT_TYPES
    };
  }

  // Event Handlers
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onUpdateWeaponType(event, target) {
    const newType = target.value;
    await this.document.update({
      "system.weaponType": newType,
      "system.isTwoHanded": false,
      "system.inMelee": false
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