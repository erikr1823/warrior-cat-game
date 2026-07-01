import { GameConfig } from "./GameConfig.js";
import {
  directionBetween,
  distanceBetween,
  normalizeVector,
} from "../core/MathUtils.js";
import {
  wrappedDirectionBetween,
  wrappedDistanceBetween,
} from "../core/WorldWrap.js";
import { Enemy } from "../entities/Enemy.js";

function directionToPlayer(from, player) {
  return GameConfig.world.wrapWorld
    ? wrappedDirectionBetween(from, player.position)
    : directionBetween(from, player.position);
}

function distanceToPlayer(from, player) {
  return GameConfig.world.wrapWorld
    ? wrappedDistanceBetween(from, player.position)
    : distanceBetween(from, player.position);
}

// Elite behavior modifiers layered on top of normal enemies (no new sprites).
// They appear gradually as the run goes on and are visually marked by a colored
// ring drawn in the Renderer. Effects are capped for performance.
export const ENEMY_MODIFIERS = {
  splitter: { name: "Splitter", color: "#7ee787", health: 1.2, minTime: 75 },
  shielded: { name: "Shielded", color: "#9fb4c8", health: 1.7, speed: 0.9, damageTaken: 0.55, minTime: 90 },
  rusher: { name: "Rusher", color: "#ffae5a", health: 1.0, speed: 0.55, minTime: 75 },
  exploder: { name: "Exploder", color: "#ff6a4a", health: 0.9, speed: 1.05, minTime: 150 },
  healer: { name: "Healer", color: "#61e3c0", health: 0.6, speed: 0.85, minTime: 180 },
  caster: { name: "Caster", color: "#b06cff", health: 0.8, speed: 0.7, minTime: 210 },
};

export function getEnemyModifier(id) {
  return ENEMY_MODIFIERS[id] ?? null;
}

// Returns a random modifier id whose minTime has been reached, or null.
export function pickModifierForTime(survivalTime) {
  const allowed = Object.keys(ENEMY_MODIFIERS).filter(
    (id) => survivalTime >= (ENEMY_MODIFIERS[id].minTime ?? 0),
  );

  if (allowed.length === 0) {
    return null;
  }

  return allowed[Math.floor(Math.random() * allowed.length)];
}

export function applyEnemyModifier(enemy, modifierId) {
  const def = getEnemyModifier(modifierId);

  if (!def) {
    return;
  }

  enemy.modifier = modifierId;
  enemy.isEliteModified = true;
  enemy.modifierColor = def.color;
  enemy.damageTakenMultiplier = def.damageTaken ?? 1;
  enemy.maxHealth = Math.max(1, Math.round(enemy.maxHealth * (def.health ?? 1)));
  enemy.health = enemy.maxHealth;
  enemy.speed *= def.speed ?? 1;
  enemy.modifierState = { chargeTimer: 2 + Math.random() * 1.5, bursting: 0, burstDir: { x: 0, y: 1 }, healTimer: 1.5, fireTimer: 1.6 + Math.random() };
}

// Per-frame modifier logic. Returns true if it set enemy.velocity itself (the
// default chase should be skipped this frame).
export function updateEnemyModifier(enemy, deltaTime, player, game) {
  const state = enemy.modifierState;

  if (!state) {
    return false;
  }

  if (enemy.modifier === "healer") {
    state.healTimer -= deltaTime;

    if (state.healTimer <= 0) {
      state.healTimer = 1.6;
      healNearbyEnemies(enemy, game);
    }

    return false;
  }

  if (enemy.modifier === "caster") {
    return updateCaster(enemy, deltaTime, player, game);
  }

  if (enemy.modifier === "rusher") {
    return updateRusher(enemy, deltaTime, player);
  }

  return false;
}

function updateRusher(enemy, deltaTime, player) {
  const state = enemy.modifierState;

  if (state.bursting > 0) {
    state.bursting -= deltaTime;
    enemy.velocity.x = state.burstDir.x * enemy.speed * 4.2;
    enemy.velocity.y = state.burstDir.y * enemy.speed * 4.2;
    enemy.updateFacing(state.burstDir);
    return true;
  }

  state.chargeTimer -= deltaTime;

  if (state.chargeTimer <= 0) {
    state.chargeTimer = 2.6;
    state.bursting = 0.45;
    state.burstDir = directionToPlayer(enemy.position, player);
  }

  return false;
}

function updateCaster(enemy, deltaTime, player, game) {
  const state = enemy.modifierState;
  const toPlayer = directionToPlayer(enemy.position, player);
  const dist = distanceToPlayer(enemy.position, player);
  const desired = 320;
  let moveDir = { x: 0, y: 0 };

  if (dist < desired - 40) {
    moveDir = { x: -toPlayer.x, y: -toPlayer.y };
  } else if (dist > desired + 40) {
    moveDir = toPlayer;
  }

  enemy.velocity.x = moveDir.x * enemy.speed;
  enemy.velocity.y = moveDir.y * enemy.speed;
  enemy.updateFacing(toPlayer);

  state.fireTimer -= deltaTime;

  if (state.fireTimer <= 0 && dist < 700) {
    state.fireTimer = 2.2;
    game.hazardSystem?.spawnProjectile(enemy.position.x, enemy.position.y, toPlayer, {
      speed: 210,
      damage: enemy.damage,
      radius: 9,
      color: enemy.modifierColor,
    });
  }

  return true;
}

function healNearbyEnemies(healer, game) {
  const radius = 200;
  const healAmount = 6;

  for (const other of game.enemies) {
    if (other.isDead || other === healer) {
      continue;
    }

    if (distanceBetween(healer.position, other.position) <= radius) {
      other.health = Math.min(other.maxHealth, other.health + healAmount);
    }
  }
}

// Death effects for modified enemies (called from EnemyDamage on kill).
export function onEnemyModifierDeath(enemy, game) {
  if (enemy.modifier === "splitter" && !enemy.isSplitChild) {
    spawnSplitlings(enemy, game);
    return;
  }

  if (enemy.modifier === "exploder") {
    game.hazardSystem?.spawnExplosion(enemy.position.x, enemy.position.y, {
      radius: 95,
      damage: Math.max(10, Math.round(enemy.damage * 1.4)),
      warnTime: 0.65,
      color: enemy.modifierColor ?? "#ff6a4a",
    });
  }
}

function spawnSplitlings(parent, game) {
  if (game.enemies.length >= GameConfig.spawn.maxEnemies) {
    return;
  }

  for (let index = 0; index < 2; index += 1) {
    const offset = index === 0 ? -26 : 26;
    const child = new Enemy(parent.position.x + offset, parent.position.y, parent.type, {
      healthMultiplier: 0.4,
      enemyPack: parent.enemyPack,
      worldId: parent.worldId,
    });

    child.isSplitChild = true;
    child.renderSize = Math.max(12, Math.round(child.renderSize * 0.7));
    child.collisionRadius = Math.max(8, Math.round(child.collisionRadius * 0.7));
    child.radius = child.collisionRadius;
    const away = normalizeVector({ x: offset, y: -8 });
    child.knockbackVelocity.x = away.x * 120;
    child.knockbackVelocity.y = away.y * 120;
    game.enemies.push(child);
  }
}
