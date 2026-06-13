// module/systems/combat-system.js
// Initiative mechanics for Best Left Buried

import { WEAPON_TYPES } from '../helpers/weapon-properties.js';
import { ARMOR_TYPES } from '../helpers/armor-properties.js';

/**
 * Break down the initiative modifiers for an actor.
 * @param {Actor} actor
 * @returns {{witTotal:number, weaponMod:number, weaponLabel:string|null, armorMod:number, armorLabels:Array, totalMod:number}}
 */
export function getInitiativeComponents(actor) {
  const witTotal = actor.system.witTotal ?? actor.system.wit?.base ?? 0;

  // Weapon modifier: first equipped weapon found (ASSUMPTION - see prior note)
  let weaponMod = 0;
  let weaponLabel = null;
  const equippedWeapon = actor.items?.find(i => i.type === 'weapon' && i.system.equipped);
  if (equippedWeapon) {
    const weaponDef = WEAPON_TYPES[equippedWeapon.system.weaponType || 'hand'];
    const customInit = equippedWeapon.system.customInitiative;
    weaponMod = (customInit !== null && customInit !== undefined)
      ? customInit
      : (weaponDef?.initiative || 0);
    weaponLabel = equippedWeapon.name;
  }

  // Armor modifier: sum across all equipped armor pieces with a non-zero mod
  let armorMod = 0;
  const armorLabels = [];
  const equippedArmor = actor.items?.filter(i => i.type === 'armor' && i.system.equipped) || [];
  for (const armor of equippedArmor) {
    const mod = ARMOR_TYPES[armor.system.armorType]?.initiativeMod || 0;
    if (mod !== 0) armorLabels.push({ name: armor.name, mod });
    armorMod += mod;
  }

  return {
    witTotal,
    weaponMod,
    weaponLabel,
    armorMod,
    armorLabels,
    totalMod: witTotal + weaponMod + armorMod
  };
}

/**
 * Build the chat message HTML for an initiative roll, breaking down each modifier.
 * @param {Roll} roll - evaluated "1d3" roll
 * @param {Object} components - result of getInitiativeComponents()
 * @returns {string}
 */
export function buildInitiativeMessageHtml(roll, components) {
  const dieResult = roll.dice[0]?.results?.[0]?.result ?? roll.total;
  const diceHtml = `<div class="dice-result-box">${dieResult}</div>`;

  const lines = [];
  lines.push(`<div><strong>Wit:</strong> ${components.witTotal >= 0 ? '+' : ''}${components.witTotal}</div>`);

  if (components.weaponLabel) {
    lines.push(`<div><strong>${components.weaponLabel}:</strong> ${components.weaponMod >= 0 ? '+' : ''}${components.weaponMod}</div>`);
  }

  for (const a of components.armorLabels) {
    lines.push(`<div><strong>${a.name}:</strong> ${a.mod >= 0 ? '+' : ''}${a.mod}</div>`);
  }

  return `
    <div class="dice-roll">
      <div class="dice-result">
        <h4 class="dice-total dice-results-box">
          ${diceHtml}
        </h4>
        <div style="margin-top: 8px;">
          ${lines.join('')}
        </div>
        <div style="margin-top: 8px; font-weight: bold;">
          Total: ${roll.total + components.totalMod}
        </div>
      </div>
    </div>
  `;
}