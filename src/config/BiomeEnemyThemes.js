import { ENEMY_ROTATION_ORDER, ENEMY_ROTATION_CONFIG } from "./EnemyRotationDefinitions.js";
import { getEnemyDisplayName } from "./EnemyDefinitions.js";

function buildTheme(types) {
  return types.map((entry) => (typeof entry === "string" ? { id: entry, weight: 1 } : entry));
}

export const BIOME_ENEMY_THEMES = {
  castleCourtyard: {
    subtitle: "Guards · brutes · shield wall",
    types: buildTheme([
      { id: "knightUndead", weight: 4 },
      { id: "skeletonUndead", weight: 3 },
      { id: "stoneGolem", weight: 3 },
      { id: "scrapGolem", weight: 2 },
      { id: "armoredRat", weight: 2 },
      { id: "mudGolem", weight: 2 },
      { id: "vikingUndead", weight: 2 },
      { id: "babySkeleton", weight: 2 },
    ]),
    preferredModifiers: ["shielded", "rusher"],
  },
  moonlitForest: {
    subtitle: "Crawlers · bats · poison tide",
    types: buildTheme([
      { id: "caveBat", weight: 4 },
      { id: "poisonBat", weight: 3 },
      { id: "caveSpider", weight: 3 },
      { id: "poisonSpider", weight: 3 },
      { id: "poisonSlime", weight: 3 },
      { id: "goblinThief", weight: 2 },
      { id: "walkingFungus", weight: 2 },
      { id: "sporeBeast", weight: 2 },
      { id: "greenSlime", weight: 1 },
    ]),
    preferredModifiers: ["rusher", "splitter"],
  },
  graveyard: {
    subtitle: "Bones · spirits · exploding dead",
    types: buildTheme([
      { id: "babySkeleton", weight: 4 },
      { id: "skeletonCrawler", weight: 3 },
      { id: "skeletonHead", weight: 3 },
      { id: "bonePileMonster", weight: 3 },
      { id: "smallGhost", weight: 3 },
      { id: "shadowGhost", weight: 2 },
      { id: "lostSoul", weight: 2 },
      { id: "skeletonUndead", weight: 2 },
      { id: "tinyLich", weight: 1 },
    ]),
    preferredModifiers: ["exploder", "caster", "splitter"],
  },
  royalArchive: {
    subtitle: "Arcane eyes · casters · ranged dead",
    types: buildTheme([
      { id: "floatingEye", weight: 4 },
      { id: "bloodEye", weight: 3 },
      { id: "shadowEye", weight: 3 },
      { id: "goblinShaman", weight: 3 },
      { id: "tinyLich", weight: 2 },
      { id: "fireImp", weight: 2 },
      { id: "poisonImp", weight: 2 },
      { id: "goblinArcher", weight: 2 },
      { id: "hornedImp", weight: 1 },
    ]),
    preferredModifiers: ["caster", "shielded"],
  },
  frostBarrow: {
    subtitle: "Frozen brutes · ice rush · elites",
    types: buildTheme([
      { id: "iceBat", weight: 3 },
      { id: "iceSpider", weight: 3 },
      { id: "iceImp", weight: 3 },
      { id: "frostEye", weight: 3 },
      { id: "stoneGolem", weight: 3 },
      { id: "crystalGolem", weight: 3 },
      { id: "mudGolem", weight: 2 },
      { id: "boneWorm", weight: 2 },
      { id: "vikingUndead", weight: 2 },
    ]),
    preferredModifiers: ["shielded", "rusher", "splitter"],
  },
};

const FALLBACK_TYPES = ENEMY_ROTATION_ORDER.map((id) => ({ id, weight: 1 }));

export function getBiomeEnemyTheme(worldId) {
  return BIOME_ENEMY_THEMES[worldId] ?? null;
}

export function pickBiomeThemedEnemyType(worldId, seed = Math.random()) {
  const theme = getBiomeEnemyTheme(worldId);
  const pool = theme?.types?.length ? theme.types : FALLBACK_TYPES;
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = seed * totalWeight;

  for (const entry of pool) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.id;
    }
  }

  return pool[pool.length - 1].id;
}

export function pickBiomePreferredModifier(worldId, survivalTime, allowedIds) {
  const theme = getBiomeEnemyTheme(worldId);

  if (!theme?.preferredModifiers?.length || !allowedIds?.length) {
    return null;
  }

  const preferred = theme.preferredModifiers.filter((id) => allowedIds.includes(id));

  if (preferred.length === 0) {
    return null;
  }

  if (Math.random() < 0.62) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }

  return allowedIds[Math.floor(Math.random() * allowedIds.length)];
}

function biomePairSeed(slot, offset, worldId) {
  let hash = slot * 73856093 + offset * 19349663;

  for (let index = 0; index < worldId.length; index += 1) {
    hash = (hash * 31 + worldId.charCodeAt(index)) >>> 0;
  }

  return (hash % 1000) / 1000;
}

/** Two themed enemy types for the current 45-second slot (late game). */
export function getBiomeThemedEnemyPair(worldId, survivalTime) {
  const slot = Math.floor(survivalTime / ENEMY_ROTATION_CONFIG.interval);
  const primary = pickBiomeThemedEnemyType(worldId, biomePairSeed(slot, 0, worldId));
  let secondary = pickBiomeThemedEnemyType(worldId, biomePairSeed(slot, 1, worldId));

  if (secondary === primary) {
    secondary = pickBiomeThemedEnemyType(worldId, biomePairSeed(slot, 2, worldId));
  }

  return secondary === primary ? [primary] : [primary, secondary];
}

export function pickBiomeThemedEnemyFromPair(worldId, survivalTime, seed = Math.random()) {
  const types = getBiomeThemedEnemyPair(worldId, survivalTime);
  return types[Math.floor(seed * types.length)] ?? types[0];
}

export function getBiomeRotationAnnouncement(worldId, survivalTime) {
  const types = getBiomeThemedEnemyPair(worldId, survivalTime);

  return {
    title: "Enemy Tide Shifts",
    subtitle: `Now spawning: ${types.map((type) => getEnemyDisplayName(type)).join(" & ")}`,
    enemyTypes: types,
    enemyType: types[0],
    intervalSeconds: ENEMY_ROTATION_CONFIG.interval,
  };
}
