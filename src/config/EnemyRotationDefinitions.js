import { getEnemyDisplayName } from "./EnemyDefinitions.js";
import { TINY_MONSTER_ROTATION_ORDER } from "./TinyMonsterDefinitions.js";

// Imported directional enemies with walk animation (kept from prior art pass).
export const ANIMATED_ENEMY_ROTATION = [
  "zombie",
  "brainZombie",
  "vikingUndead",
  "skeletonUndead",
  "popstarUndead",
  "knightUndead",
  "greenDragon",
];

/** Full rotation roster: tiny monsters + animated imports, interleaved for variety. */
export const ENEMY_ROTATION_ORDER = buildRotationOrder();

function buildRotationOrder() {
  const order = [];
  let animatedIndex = 0;

  for (let index = 0; index < TINY_MONSTER_ROTATION_ORDER.length; index += 1) {
    order.push(TINY_MONSTER_ROTATION_ORDER[index]);

    // Sprinkle an animated enemy every ~9 tiny monsters.
    if ((index + 1) % 9 === 0 && animatedIndex < ANIMATED_ENEMY_ROTATION.length) {
      order.push(ANIMATED_ENEMY_ROTATION[animatedIndex]);
      animatedIndex += 1;
    }
  }

  while (animatedIndex < ANIMATED_ENEMY_ROTATION.length) {
    order.push(ANIMATED_ENEMY_ROTATION[animatedIndex]);
    animatedIndex += 1;
  }

  return order;
}

export const ENEMY_ROTATION_CONFIG = {
  interval: 45,
  typesPerSlot: 2,
};

/** Which 45-second slot the run is in (0 = first slot, etc.). */
export function getRotationSlotIndex(survivalTime) {
  return Math.floor(survivalTime / ENEMY_ROTATION_CONFIG.interval);
}

export function getRotationInterval(survivalTime) {
  return ENEMY_ROTATION_CONFIG.interval;
}

/** Two distinct enemy types active for the current slot. */
export function getRotatingEnemyTypes(survivalTime) {
  const slot = getRotationSlotIndex(survivalTime);
  const order = ENEMY_ROTATION_ORDER;
  const stride = ENEMY_ROTATION_CONFIG.typesPerSlot;
  const primary = order[(slot * stride) % order.length] ?? "greenSlime";
  let secondary = order[(slot * stride + 1) % order.length] ?? primary;

  if (secondary === primary && order.length > 1) {
    secondary = order[(slot * stride + 2) % order.length] ?? order[1];
  }

  return secondary === primary ? [primary] : [primary, secondary];
}

/** Pick one of the two active rotation types for a spawn. */
export function pickRotatingEnemyType(survivalTime, seed = Math.random()) {
  const types = getRotatingEnemyTypes(survivalTime);
  return types[Math.floor(seed * types.length)] ?? types[0];
}

export function formatEnemyTypeNames(types) {
  return types.map((type) => getEnemyDisplayName(type)).join(" & ");
}

export function getEnemyRotationAnnouncement(survivalTime) {
  const types = getRotatingEnemyTypes(survivalTime);

  return {
    title: "Enemy Tide Shifts",
    subtitle: `Now spawning: ${formatEnemyTypeNames(types)}`,
    enemyTypes: types,
    enemyType: types[0],
    intervalSeconds: ENEMY_ROTATION_CONFIG.interval,
  };
}

export function getRotationSlotStartTime(slotIndex) {
  return slotIndex * ENEMY_ROTATION_CONFIG.interval;
}
