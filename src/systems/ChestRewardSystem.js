import { GameConfig } from "../config/GameConfig.js";
import { getWeaponDefinition } from "../config/WeaponDefinitions.js";
import { getPassiveDefinition } from "../config/PassiveDefinitions.js";

export class ChestRewardSystem {
  rollReward(game) {
    const evolutions = game.weaponSystem.getAvailableEvolutions(game);

    if (evolutions.length > 0) {
      const evolution = evolutions[Math.floor(Math.random() * evolutions.length)];
      return this.buildEvolutionReward(evolution);
    }

    const weaponPool = this.getOwnedWeaponUpgrades(game);
    const passivePool = this.getOwnedPassiveUpgrades(game);
    const luck = game.passiveSystem.getChestLuck();
    const pool = [];

    for (const weaponId of weaponPool) {
      pool.push({ kind: "weaponUpgrade", weaponId, weight: 3.2 + luck * 2 });
    }

    for (const passiveId of passivePool) {
      pool.push({ kind: "passiveUpgrade", passiveId, weight: 3.2 + luck * 2 });
    }

    pool.push({ kind: "coins", weight: 2 });
    pool.push({ kind: "heal", weight: 2 });

    const pick = this.pickWeighted(pool);
    return this.buildReward(game, pick);
  }

  buildEvolutionReward(evolution) {
    const baseDefinition = getWeaponDefinition(evolution.baseWeaponId);
    const passiveDefinition = getPassiveDefinition(evolution.requiredPassiveId);

    return {
      type: "weaponEvolution",
      evolution,
      title: "Tale Rewritten!",
      name: evolution.evolvedName,
      headline: `${baseDefinition?.name ?? evolution.baseWeaponId} → ${evolution.evolvedName}`,
      description: `${evolution.description} Bonded with ${passiveDefinition?.name ?? evolution.requiredPassiveId}.`,
      accent: evolution.accent,
      icon: evolution.icon,
      isEvolution: true,
    };
  }

  getOwnedWeaponUpgrades(game) {
    return game.weaponSystem
      .getAvailableWeaponChoices()
      .filter((choice) => choice.type === "weaponUpgrade")
      .map((choice) => choice.weaponId);
  }

  getOwnedPassiveUpgrades(game) {
    return game.passiveSystem
      .getAvailablePassiveChoices()
      .filter((choice) => choice.type === "passiveUpgrade")
      .map((choice) => choice.passiveId);
  }

  pickWeighted(pool) {
    const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of pool) {
      roll -= entry.weight;

      if (roll <= 0) {
        return entry;
      }
    }

    return pool[pool.length - 1];
  }

  buildReward(game, pick) {
    const chestConfig = GameConfig.chests;

    if (pick.kind === "weaponUpgrade") {
      const weaponId = pick.weaponId ?? this.pickRandom(this.getOwnedWeaponUpgrades(game));
      const weapon = game.weaponSystem.weapons.get(weaponId);
      const definition = getWeaponDefinition(weaponId);
      const nextLevel = (weapon?.level ?? 0) + 1;

      return {
        type: "weaponUpgrade",
        weaponId,
        title: "Margin Awakened!",
        name: `${definition?.name ?? weaponId}`,
        headline: `+1 Level → Lv ${nextLevel}`,
        description: weapon?.upgrades?.[weapon.level - 1]?.label ?? "The tool grows sharper.",
        accent: "#ffd27e",
        icon: "📖",
      };
    }

    if (pick.kind === "passiveUpgrade") {
      const passiveId = pick.passiveId ?? this.pickRandom(this.getOwnedPassiveUpgrades(game));
      const definition = getPassiveDefinition(passiveId);
      const nextLevel = game.passiveSystem.getLevel(passiveId) + 1;

      return {
        type: "passiveUpgrade",
        passiveId,
        title: "Relic Reinforced!",
        name: definition?.name ?? passiveId,
        headline: `+1 Level → Lv ${nextLevel}`,
        description: definition?.description ?? "A relic grows stronger.",
        accent: "#7fd4ff",
        icon: "✦",
      };
    }

    if (pick.kind === "heal") {
      return {
        type: "heal",
        amount: chestConfig.healAmount,
        title: "Warmth Returns!",
        name: "Restorative Tea",
        headline: `+${chestConfig.healAmount} HP`,
        description: "Steam and story-light mend your wounds.",
        accent: "#59d36f",
        icon: "♥",
      };
    }

    return {
      type: "coins",
      amount: chestConfig.coinReward,
      title: "Catalog Spill!",
      name: "Loose Memory Coins",
      headline: `+${chestConfig.coinReward} Memory Coins`,
      description: "The catalog chest spills glittering memory coins.",
      accent: "#ffe09a",
      icon: "◎",
    };
  }

  applyReward(game, reward) {
    if (!reward) {
      return;
    }

    if (reward.type === "weaponEvolution") {
      const evolvedWeapon = game.weaponSystem.evolveWeapon(reward.evolution);

      if (evolvedWeapon) {
        game.passiveSystem.applyWeaponPassivesToWeapon(evolvedWeapon);
        game.runEvolutions.push(reward.evolution.evolvedName);
      }

      game.feedback.onWeaponEvolution();
      return;
    }

    if (reward.type === "weaponUpgrade") {
      game.weaponSystem.levelUpWeapon(reward.weaponId);
      return;
    }

    if (reward.type === "passiveUpgrade") {
      game.passiveSystem.levelUpPassive(reward.passiveId, game);
      return;
    }

    if (reward.type === "heal") {
      game.player.health = Math.min(
        game.player.maxHealth,
        game.player.health + reward.amount,
      );
      return;
    }

    if (reward.type === "coins") {
      game.coins += reward.amount;
    }
  }

  pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }
}
