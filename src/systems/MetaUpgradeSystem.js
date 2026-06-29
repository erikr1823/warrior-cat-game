import { GameConfig } from "../config/GameConfig.js";
import {
  META_UPGRADE_DEFINITIONS,
  getMetaUpgradeDefinition,
  getMetaUpgradeCost,
} from "../config/MetaUpgradeDefinitions.js";

export class MetaUpgradeSystem {
  getUpgradeLevel(saveData, upgradeId) {
    return saveData.metaUpgrades[upgradeId] ?? 0;
  }

  getUpgradeCost(saveData, upgradeId) {
    const definition = getMetaUpgradeDefinition(upgradeId);

    if (!definition) {
      return null;
    }

    const level = this.getUpgradeLevel(saveData, upgradeId);
    return getMetaUpgradeCost(definition, level);
  }

  canPurchase(saveData, upgradeId) {
    const definition = getMetaUpgradeDefinition(upgradeId);

    if (!definition) {
      return false;
    }

    const level = this.getUpgradeLevel(saveData, upgradeId);

    if (level >= definition.maxLevel) {
      return false;
    }

    const cost = getMetaUpgradeCost(definition, level);
    return cost !== null && saveData.totalCoins >= cost;
  }

  purchase(saveData, upgradeId) {
    if (!this.canPurchase(saveData, upgradeId)) {
      return false;
    }

    const cost = this.getUpgradeCost(saveData, upgradeId);
    saveData.totalCoins -= cost;
    saveData.metaUpgrades[upgradeId] = this.getUpgradeLevel(saveData, upgradeId) + 1;
    return true;
  }

  getShopEntries(saveData) {
    return META_UPGRADE_DEFINITIONS.map((definition) => {
      const level = this.getUpgradeLevel(saveData, definition.id);
      const cost = getMetaUpgradeCost(definition, level);
      const isMaxed = level >= definition.maxLevel;

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        level,
        maxLevel: definition.maxLevel,
        cost,
        isMaxed,
        optional: Boolean(definition.optional),
        canBuy: !isMaxed && cost !== null && saveData.totalCoins >= cost,
      };
    });
  }

  applyToRun(game) {
    const levels = game.saveData?.metaUpgrades ?? {};
    const metaConfig = GameConfig.metaUpgrades;

    game.runModifiers = {
      damageMultiplier: 1 + (levels.damage ?? 0) * metaConfig.damageBonusPerLevel,
      xpMultiplier: 1 + (levels.xpGain ?? 0) * metaConfig.xpBonusPerLevel,
      moveSpeedMultiplier: 1 + (levels.moveSpeed ?? 0) * metaConfig.moveSpeedBonusPerLevel,
      pickupRangeMultiplier: 1 + (levels.pickupRange ?? 0) * metaConfig.pickupRangeBonusPerLevel,
    };

    const playerConfig = GameConfig.player;
    game.player.maxHealth =
      playerConfig.maxHealth + (levels.maxHealth ?? 0) * metaConfig.maxHealthPerLevel;
    game.player.health = game.player.maxHealth;
    game.player.speed = playerConfig.speed * game.runModifiers.moveSpeedMultiplier;
    game.player.pickupRadius = playerConfig.pickupRadius * game.runModifiers.pickupRangeMultiplier;
    game.player.magnetRadius = playerConfig.magnetRadius * game.runModifiers.pickupRangeMultiplier;

    const startingCoins = (levels.startingCoins ?? 0) * metaConfig.startingCoinsPerLevel;

    if (startingCoins > 0) {
      game.coins += startingCoins;
      game.startingCoinBonus = startingCoins;
    }
  }
}
