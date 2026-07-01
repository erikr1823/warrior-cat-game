import { getWorldDefinition } from "./WorldDefinitions.js";

/** Minute 10 — endgame biome rotation begins. */
export const LATE_GAME_START = 600;

/** Each late-game biome lasts 2 minutes, then loops the five concept biomes. */
export const LATE_GAME_BIOME_DURATION = 120;

/** Order matches uploaded concept art direction. */
export const LATE_GAME_BIOME_ORDER = [
  "castleCourtyard",
  "moonlitForest",
  "graveyard",
  "royalArchive",
  "frostBarrow",
];

export function isLateGameTime(survivalTime) {
  return survivalTime >= LATE_GAME_START;
}

export function getLateGameCycleIndex(survivalTime) {
  if (!isLateGameTime(survivalTime)) {
    return -1;
  }

  return Math.floor((survivalTime - LATE_GAME_START) / LATE_GAME_BIOME_DURATION);
}

export function getLateGameBiomeIndex(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);

  if (cycle < 0) {
    return 0;
  }

  return cycle % LATE_GAME_BIOME_ORDER.length;
}

export function getLateGameWorldId(survivalTime) {
  return LATE_GAME_BIOME_ORDER[getLateGameBiomeIndex(survivalTime)] ?? LATE_GAME_BIOME_ORDER[0];
}

export function getLateGameWave(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);
  const worldId = getLateGameWorldId(survivalTime);
  const world = getWorldDefinition(worldId);
  const loopPass = Math.floor(cycle / LATE_GAME_BIOME_ORDER.length);
  const stageNumber = cycle + 1;

  return {
    id: 100 + cycle,
    startTime: LATE_GAME_START + cycle * LATE_GAME_BIOME_DURATION,
    endTime: LATE_GAME_START + (cycle + 1) * LATE_GAME_BIOME_DURATION,
    name: world.name,
    announcement: loopPass > 0 ? `Endgame II — ${world.name}` : `Endgame — ${world.name}`,
    worldId,
    spawnIntervalMultiplier: Math.max(0.3, 0.5 - cycle * 0.022),
    isLateGame: true,
    lateGameCycle: cycle,
    lateGameStage: stageNumber,
    lateGameLoopPass: loopPass,
  };
}

export function getLateGameHealthMultiplier(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);

  if (cycle < 0) {
    return 1;
  }

  return 1 + cycle * 0.055;
}

export function getLateGameSpeedMultiplier(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);

  if (cycle < 0) {
    return 1;
  }

  return 1 + Math.min(0.18, cycle * 0.012);
}

export function getLateGameEliteChanceBonus(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);

  if (cycle < 0) {
    return 0;
  }

  return Math.min(0.14, cycle * 0.011);
}

export function getLateGameSpawnPressure(survivalTime) {
  const cycle = getLateGameCycleIndex(survivalTime);

  if (cycle < 0) {
    return 1;
  }

  return 1 + Math.min(0.35, cycle * 0.028);
}

/** Debug: jump to the start of a specific late-game biome index (0–4). */
export function getTimeForLateGameBiomeIndex(biomeIndex) {
  const index = ((biomeIndex % LATE_GAME_BIOME_ORDER.length) + LATE_GAME_BIOME_ORDER.length) %
    LATE_GAME_BIOME_ORDER.length;
  return LATE_GAME_START + index * LATE_GAME_BIOME_DURATION;
}

export function getTimeForNextLateGameBiome(survivalTime) {
  if (!isLateGameTime(survivalTime)) {
    return LATE_GAME_START;
  }

  const cycle = getLateGameCycleIndex(survivalTime);
  return LATE_GAME_START + (cycle + 1) * LATE_GAME_BIOME_DURATION;
}
