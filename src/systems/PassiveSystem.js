import { GameConfig } from "../config/GameConfig.js";
import {
  PASSIVE_MAX_LEVEL,
  getPassiveDefinition,
  getPassiveConfig,
  getAllPassiveIds,
} from "../config/PassiveDefinitions.js";

function forEachWeapon(game, callback) {
  for (const weapon of game.weaponSystem.weapons.values()) {
    callback(weapon);
  }
}

export class PassiveSystem {
  constructor() {
    this.passives = new Map();
    this.chestLuck = 0;
  }

  ownsPassive(id) {
    return this.passives.has(id);
  }

  getLevel(id) {
    return this.passives.get(id) ?? 0;
  }

  isMaxLevel(id) {
    return this.getLevel(id) >= PASSIVE_MAX_LEVEL;
  }

  addPassive(id, game) {
    if (this.ownsPassive(id)) {
      return this.levelUpPassive(id, game);
    }

    this.passives.set(id, 0);
    return this.levelUpPassive(id, game);
  }

  levelUpPassive(id, game) {
    if (this.isMaxLevel(id)) {
      return this.getLevel(id);
    }

    const nextLevel = this.getLevel(id) + 1;
    this.passives.set(id, nextLevel);
    this.applyPassiveLevel(id, game);
    return nextLevel;
  }

  applyPassiveLevel(id, game) {
    const config = getPassiveConfig(id);

    if (!config) {
      return;
    }

    if (id === "spellbook") {
      forEachWeapon(game, (weapon) => {
        if (weapon.cooldown > 0) {
          weapon.cooldown *= config.cooldownMultiplier;
        }
      });
      return;
    }

    if (id === "powerStone") {
      forEachWeapon(game, (weapon) => {
        if (weapon.projectileDamage !== undefined) {
          weapon.projectileDamage += config.damageBonus;
        }

        if (weapon.damage !== undefined) {
          weapon.damage += config.damageBonus;
        }
      });
      return;
    }

    if (id === "windBoots") {
      game.player.speed += config.moveSpeedBonus;
      return;
    }

    if (id === "magnetCharm") {
      game.player.magnetRadius += config.magnetBonus;
      return;
    }

    if (id === "ironHeart") {
      game.player.maxHealth += config.maxHealthBonus;
      game.player.health += config.maxHealthBonus;
      return;
    }

    if (id === "cloverCoin") {
      this.chestLuck += config.luckBonus;
    }
  }

  applyWeaponPassivesToWeapon(weapon) {
    for (const [id, level] of this.passives) {
      const config = getPassiveConfig(id);

      if (!config) {
        continue;
      }

      for (let appliedLevel = 0; appliedLevel < level; appliedLevel += 1) {
        if (id === "spellbook" && weapon.cooldown > 0) {
          weapon.cooldown *= config.cooldownMultiplier;
        }

        if (id === "powerStone") {
          if (weapon.projectileDamage !== undefined) {
            weapon.projectileDamage += config.damageBonus;
          }

          if (weapon.damage !== undefined) {
            weapon.damage += config.damageBonus;
          }
        }
      }
    }
  }

  getChestLuck() {
    return this.chestLuck;
  }

  getOwnedPassiveSummary() {
    return [...this.passives.entries()].map(([id, level]) => {
      const definition = getPassiveDefinition(id);

      return {
        id,
        name: definition?.name ?? id,
        level,
        maxLevel: PASSIVE_MAX_LEVEL,
        color: definition?.color ?? "#fff4dc",
        isMaxLevel: level >= PASSIVE_MAX_LEVEL,
      };
    });
  }

  getAvailablePassiveChoices() {
    return getAllPassiveIds()
      .map((passiveId) => this.buildPassiveChoice(passiveId))
      .filter(Boolean);
  }

  buildPassiveChoice(passiveId) {
    const definition = getPassiveDefinition(passiveId);
    const config = getPassiveConfig(passiveId);
    const level = this.getLevel(passiveId);

    if (level >= PASSIVE_MAX_LEVEL) {
      return null;
    }

    if (level === 0) {
      return {
        type: "newPassive",
        passiveId,
        name: definition?.name ?? passiveId,
        description: definition?.description ?? "Adds a new passive item.",
        rank: 0,
        maxRank: PASSIVE_MAX_LEVEL,
      };
    }

    return {
      type: "passiveUpgrade",
      passiveId,
      name: `${definition?.name ?? passiveId} Lv ${level + 1}`,
      description: config?.levelLabel ?? "Passive power increases.",
      rank: level,
      maxRank: PASSIVE_MAX_LEVEL,
    };
  }
}

export function getFallbackChoices() {
  const fallbacks = GameConfig.fallbackUpgrades;

  return [
    {
      type: "fallback",
      id: "heal",
      name: fallbacks.heal.name,
      description: fallbacks.heal.description,
      rank: 0,
      maxRank: Number.POSITIVE_INFINITY,
    },
    {
      type: "fallback",
      id: "coins",
      name: fallbacks.coins.name,
      description: fallbacks.coins.description,
      rank: 0,
      maxRank: Number.POSITIVE_INFINITY,
    },
  ];
}

export function applyFallback(game, fallbackId) {
  const fallbacks = GameConfig.fallbackUpgrades;

  if (fallbackId === "heal") {
    game.player.health = Math.min(
      game.player.maxHealth,
      game.player.health + fallbacks.heal.amount,
    );
    return;
  }

  if (fallbackId === "coins") {
    game.coins += fallbacks.coins.amount;
  }
}
