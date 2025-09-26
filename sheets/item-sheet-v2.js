// sheets/item-sheet-v2.js - Updated for new requirements

import { WEAPON_TYPES } from "../module/helpers/weapons.js";
import { ARMOR_TYPES } from "../module/helpers/armor.js";
import { CONSEQUENCE_TYPES } from "../module/helpers/new_items.js";

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
      updateConsequenceType: BLBItemSheetV2.#onUpdateConsequenceType,
      rollAdvancement: BLBItemSheetV2.#onRollAdvancement
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

    // Get weapon properties for display
    let weaponProperties = null;
    if (doc.type === "weapon" && doc.system.weaponType) {
      const weaponData = WEAPON_TYPES[doc.system.weaponType];
      if (weaponData) {
        let damage = weaponData.damageMod || 0;
        if (doc.system.isTwoHanded && weaponData.twoHandedBonus) damage += 1;
        if (doc.system.inMelee && weaponData.meleePenalty) damage -= 1;

        weaponProperties = {
          range: weaponData.range,
          attackStat: weaponData.attackStat,
          damageMod: damage >= 0 ? `+${damage}` : `${damage}`,
          initiative: weaponData.initiative || 0
        };
      }
    }

    return {
      item: doc,
      source: src,
      system: doc.system,
      defaultIcon: defaultIcon,
      weaponProperties: weaponProperties,
      WEAPON_TYPES,
      ARMOR_TYPES,
      CONSEQUENCE_TYPES
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

  static async #onUpdateConsequenceType(event, target) {
    const newConsequenceType = target.value;
    await this.document.update({
      "system.consequenceType": newConsequenceType
    });
  }

  static async #onRollAdvancement(event, target) {
    const rollFormula = this.document.system.rollFormula || "2d6";
    
    const roll = await new Roll(rollFormula).evaluate();
    
    const dieResults = roll.dice[0]?.results?.map(r => r.result) || [];
    const rollTooltip = await roll.getTooltip();
    
    const resultText = `
      <div class="dice-roll">
          <div class="dice-result">
              <div class="dice-formula">${roll.formula}</div>
              <h4 class="dice-total dice-results-box">
                  ${dieResults.map(r => `<div class="dice-result-box">${r}</div>`).join("")}
              </h4>
              <div class="dice-tooltip">${rollTooltip}</div>
          </div>
      </div>
    `;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document.parent }),
      flavor: `${this.document.name} Roll`,
      content: resultText
    });
  }
}