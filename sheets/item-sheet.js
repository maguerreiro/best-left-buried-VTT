// sheets/item-sheet.js
// Item sheet for Best Left Buried items

import { WEAPON_TYPES, WEAPON_RANGES, ATTACK_ATTRIBUTES } from "../module/helpers/weapon-properties.js";
import { ARMOR_TYPES } from "../module/helpers/armor-properties.js";
import { CONSEQUENCE_TYPES } from "../module/helpers/item-properties.js";
import { DisplayManager } from "../module/systems/display-manager.js";

/**
 * ItemSheet - Item sheet for Best Left Buried
 * Handles display and interaction for all item types
 */
export class ItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
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
      handler: ItemSheet.#onFormSubmit,
      submitOnChange: true
    },
    actions: {
      editImage: ItemSheet.#onEditImage,
      updateArmorType: ItemSheet.#onUpdateArmorType,
      updateConsequenceType: ItemSheet.#onUpdateConsequenceType,
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/best-left-buried_V3/templates/item.hbs"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const doc = this.document;
    const src = doc.toObject();

    let defaultIcon = doc.img;
    if (doc.img === "icons/svg/item-bag.svg" || !doc.img || doc.img === "") {
      defaultIcon = DisplayManager.getItemIcon(doc.type, doc.system.weaponType);
    }

    let weaponProperties = null;
    if (doc.type === "weapon" && doc.system.weaponType) {
      weaponProperties = this._prepareWeaponProperties(doc);
    }

    const enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
      doc.system.description || "", 
      {
        async: true,
        secrets: doc.isOwner,
        relativeTo: doc
      }
    );

    return {
      item: doc,
      source: src,
      system: doc.system,
      defaultIcon: defaultIcon,
      weaponProperties: weaponProperties,
      enrichedDescription: enrichedDescription,
      WEAPON_TYPES,
      ARMOR_TYPES,
      CONSEQUENCE_TYPES,
      WEAPON_RANGES,
      ATTACK_STATS: ATTACK_ATTRIBUTES
    };
  }

  _prepareWeaponProperties(doc) {
    const weaponData = WEAPON_TYPES[doc.system.weaponType];
    if (!weaponData) return null;

    let damage = weaponData.damageMod || 0;
    if (doc.system.isTwoHanded && weaponData.twoHandedBonus) {
      damage += 1;
    }
    if (doc.system.inMelee && weaponData.meleePenalty) {
      damage -= 1;
    }

    return {
      range: weaponData.range,
      attackStat: weaponData.attackStat,
      damageMod: damage >= 0 ? `+${damage}` : `${damage}`,
      initiative: weaponData.initiative || 0
    };
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._updateImageDisplay();
  }

  _updateImageDisplay() {
    const imgElement = this.element?.querySelector('header.sheet-header img');
    if (imgElement && this.document.img) {
      imgElement.src = this.document.img;
    }
  }



  // Event handlers
  static async #onEditImage(event, target) {
    const currentImage = this.document.img || '';
    
    const filePicker = new FilePicker({
      type: "image",
      current: currentImage,
      callback: async (selectedPath) => {
        await this.document.update({ img: selectedPath });
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    
    filePicker.render(true);
  }

  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
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


}