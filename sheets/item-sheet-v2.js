// sheets/item-sheet-v2.js - Updated with ProseMirror API (non-deprecated)

import { WEAPON_TYPES, WEAPON_RANGES, ATTACK_STATS } from "../module/helpers/weapons.js";
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

    // Enrich the description HTML for display
    const enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(doc.system.description || "", {
      async: true,
      secrets: doc.isOwner,
      relativeTo: doc
    });

    return {
      item: doc,
      source: src,
      system: doc.system,
      defaultIcon: defaultIcon,
      weaponProperties: weaponProperties,
      enrichedDescription: enrichedDescription,
      editable: this.isEditable,
      owner: doc.isOwner,
      WEAPON_TYPES,
      ARMOR_TYPES,
      CONSEQUENCE_TYPES,
      WEAPON_RANGES,
      ATTACK_STATS
    };
  }

  _getDefaultIcon(itemType, weaponType) {
    if (itemType === "weapon") {
      if (weaponType === "hand") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "heavy" || weaponType === "long") {
        return "systems/best-left-buried/icons/weapon_2_hand.svg";
      } else if (weaponType === "light") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "ranged") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "throwing") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      }
      // Default weapon icon for other types
      return "systems/best-left-buried/icons/weapon_1_hand.svg";
    }
    
    // Default Foundry icons for other types
    return "icons/svg/item-bag.svg";
  }

  static _getDefaultIconStatic(itemType, weaponType) {
    if (itemType === "weapon") {
      if (weaponType === "hand") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "heavy" || weaponType === "long") {
        return "systems/best-left-buried/icons/weapon_2_hand.svg";
      } else if (weaponType === "light") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "ranged") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
      } else if (weaponType === "throwing") {
        return "systems/best-left-buried/icons/weapon_1_hand.svg";
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
    
    // Update the image element to ensure it matches the document
    const imgElement = this.element?.querySelector('header.sheet-header img');
    if (imgElement && this.document.img) {
      imgElement.src = this.document.img;
    }
    
    // Add change event listener to weapon type dropdown for immediate icon preview
    const weaponTypeSelect = this.element?.querySelector('select[name="system.weaponType"]');
    if (weaponTypeSelect) {
      weaponTypeSelect.addEventListener('change', (event) => {
        const newType = event.target.value;
        const newIcon = BLBItemSheetV2._getDefaultIconStatic("weapon", newType);
        
        // Update icon immediately in DOM
        const img = this.element?.querySelector('header.sheet-header img');
        if (img) {
          img.src = newIcon;
        }
      });
    }

    // Always try to activate editor on render
    await this._activateEditors();
  }

  /**
   * Activate ProseMirror editors for all description fields
   */
  async _activateEditors() {
    const editorDiv = this.element?.querySelector('.editor[data-edit="system.description"]');
    if (!editorDiv) return;
    
    // If editor already exists and is active, don't recreate
    if (this._editor?.view && document.body.contains(this._editor.view.dom)) {
      return;
    }

    // Clear any existing editor reference
    this._editor = null;

    // Create the editor with ONLY required parameters
    try {
      this._editor = await foundry.applications.ux.TextEditor.implementation.create({
        target: editorDiv,
        engine: "prosemirror"
      }, this.document.system.description || "");
      
      // Auto-save on content change (using ProseMirror's update event)
      if (this._editor.view) {
        const view = this._editor.view;
        const originalDispatch = view.dispatch.bind(view);
        view.dispatch = (tr) => {
          originalDispatch(tr);
          // Debounced save after content changes
          if (tr.docChanged) {
            clearTimeout(this._saveTimeout);
            this._saveTimeout = setTimeout(() => this._saveEditor(), 1000);
          }
        };
      }
      
      console.log("Editor created successfully");
    } catch (err) {
      console.error("Error creating editor:", err);
    }
  }

  /**
   * Save editor content
   */
  async _saveEditor() {
    if (this._editor?.view) {
      try {
        const content = ProseMirror.dom.serializeString(this._editor.view.state.doc);
        if (content !== this.document.system.description) {
          await this.document.update({ "system.description": content }, { render: false });
          console.log("Editor content saved");
        }
      } catch (err) {
        console.error("Error saving editor:", err);
      }
    }
  }

  /**
   * Override close to save editor content
   */
  async close(options = {}) {
    // Clear any pending save
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
    }
    
    await this._saveEditor();
    this._editor = null;
    return super.close(options);
  }

  /**
   * Override close to save editor content
   */
  async close(options = {}) {
    if (this._editor?.active) {
      try {
        const content = this._editor.instance.getData();
        if (content !== this.document.system.description) {
          await this.document.update({ "system.description": content }, { render: false });
        }
      } catch (err) {
        console.error("Error saving editor:", err);
      }
    }
    this._editor = null;
    return super.close(options);
  }

  // Event Handlers
  static async #onFormSubmit(event, form, formData) {
    const updateData = foundry.utils.expandObject(formData.object);
    await this.document.update(updateData);
  }

  static async #onUpdateWeaponType(event, target) {
    const newType = target.value;
    
    // Get the appropriate icon for the new weapon type
    let newIcon = BLBItemSheetV2._getDefaultIconStatic("weapon", newType);
    
    // Update the document
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