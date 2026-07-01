import { GameConfig } from "./GameConfig.js";
import { getTinyMonsterDefinition } from "./TinyMonsterDefinitions.js";

/** Resolve stats/name for any enemy id (GameConfig, tiny monster, or slime fallback). */
export function getEnemyConfig(type) {
  const base = GameConfig.enemies[type];

  if (base) {
    return base;
  }

  const tiny = getTinyMonsterDefinition(type);

  if (tiny) {
    return {
      name: tiny.name,
      maxHealth: tiny.maxHealth,
      speed: tiny.speed,
      damage: tiny.damage,
      renderSize: tiny.renderSize,
      collisionRadius: tiny.collisionRadius,
      visualType: type,
    };
  }

  return GameConfig.enemies.slime;
}

export function getEnemyDisplayName(type) {
  return getEnemyConfig(type).name ?? type;
}
