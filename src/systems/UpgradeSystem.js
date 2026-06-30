import { GameConfig } from "../config/GameConfig.js";
import { applyFallback, getFallbackChoices } from "./PassiveSystem.js";

function uniqueChoices(choices) {
  const seen = new Set();

  return choices.filter((choice) => {
    const key = [
      choice.type,
      choice.weaponId,
      choice.passiveId,
      choice.traitId,
      choice.synergyId,
      choice.id,
      choice.name,
    ].filter(Boolean).join(":");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

// Picks `count` distinct choices using each choice's relative weight, so Traits
// and Synergies (lower weight) appear less often than normal weapon/passive ups.
function weightedSample(choices, count) {
  const pool = choices.map((choice) => ({
    choice,
    weight: choice._weight ?? 1,
  }));
  const picked = [];

  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenIndex = pool.length - 1;

    for (let index = 0; index < pool.length; index += 1) {
      roll -= pool[index].weight;

      if (roll <= 0) {
        chosenIndex = index;
        break;
      }
    }

    picked.push(pool[chosenIndex].choice);
    pool.splice(chosenIndex, 1);
  }

  return picked;
}

export class UpgradeSystem {
  getChoices(count = 3, game) {
    const weaponChoices = game.weaponSystem.getAvailableWeaponChoices();
    const passiveChoices = game.passiveSystem.getAvailablePassiveChoices();

    const traitChoices = (game.traitSystem?.getAvailableTraitChoices() ?? []).map((choice) => ({
      ...choice,
      _weight: GameConfig.traits?.appearWeight ?? 0.5,
    }));

    const synergyChoices = (game.synergySystem?.getAvailableSynergyChoices(game) ?? []).map((choice) => ({
      ...choice,
      _weight: GameConfig.synergies?.appearWeight ?? 0.75,
    }));

    let pool = uniqueChoices([
      ...weaponChoices,
      ...passiveChoices,
      ...traitChoices,
      ...synergyChoices,
    ]);

    if (pool.length === 0) {
      pool = getFallbackChoices();
    } else if (pool.length < count) {
      pool = uniqueChoices([...pool, ...getFallbackChoices()]);
    }

    return weightedSample(pool, count);
  }

  applyUpgrade(game, upgrade) {
    if (upgrade.type === "newWeapon") {
      game.weaponSystem.addWeapon(upgrade.weaponId);
      return;
    }

    if (upgrade.type === "weaponUpgrade") {
      game.weaponSystem.levelUpWeapon(upgrade.weaponId);
      return;
    }

    if (upgrade.type === "newPassive") {
      game.passiveSystem.addPassive(upgrade.passiveId, game);
      return;
    }

    if (upgrade.type === "passiveUpgrade") {
      game.passiveSystem.levelUpPassive(upgrade.passiveId, game);
      return;
    }

    if (upgrade.type === "trait") {
      game.traitSystem?.acquireTrait(upgrade.traitId, game);
      return;
    }

    if (upgrade.type === "synergy") {
      game.synergySystem?.acquireSynergy(upgrade.synergyId, game);
      return;
    }

    if (upgrade.type === "fallback") {
      applyFallback(game, upgrade.id);
    }
  }
}
