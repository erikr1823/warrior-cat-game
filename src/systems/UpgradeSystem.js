import { GameConfig } from "../config/GameConfig.js";
import { applyFallback, getFallbackChoices } from "./PassiveSystem.js";

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function uniqueChoices(choices) {
  const seen = new Set();

  return choices.filter((choice) => {
    const key = [
      choice.type,
      choice.weaponId,
      choice.passiveId,
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

export class UpgradeSystem {
  getChoices(count = 3, game) {
    const weaponChoices = game.weaponSystem.getAvailableWeaponChoices();
    const passiveChoices = game.passiveSystem.getAvailablePassiveChoices();
    let pool = uniqueChoices([...weaponChoices, ...passiveChoices]);

    if (pool.length === 0) {
      pool = getFallbackChoices();
    } else if (pool.length < count) {
      pool = uniqueChoices([...pool, ...getFallbackChoices()]);
    }

    return shuffle(pool).slice(0, count);
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

    if (upgrade.type === "fallback") {
      applyFallback(game, upgrade.id);
    }
  }
}
