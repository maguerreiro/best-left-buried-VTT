import { WEAPON_TYPES } from "../module/helpers/weapons.js";

export class MiniItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["best-left-buried", "sheet", "item"],
            template: "systems/best-left-buried/templates/item-template.hbs",
            width: 500,
            height: 400,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "properties"}]
        });
    }

    getData(options) {
        const context = super.getData(options);
        
        // Ensure we're working with the correct data structure
        context.system = context.item.system;
        context.WEAPON_TYPES = WEAPON_TYPES;

        // For debugging
        console.log("Item data:", {
            type: this.item.type,
            systemData: context.system,
            weaponType: context.system.type
        });

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Handle weapon type changes
        html.find('select[name="system.type"]').change(async (event) => {
            event.preventDefault();
            const newType = event.target.value;
            
            // For debugging
            console.log("Updating weapon type:", {
                old: this.item.system.type,
                new: newType
            });

            try {
                await this.item.update({
                    "system.type": newType,
                    // Reset conditional properties when type changes
                    "system.isTwoHanded": false,
                    "system.inMelee": false
                });
            } catch (err) {
                console.error("Error updating weapon type:", err);
            }
        });
    }
}