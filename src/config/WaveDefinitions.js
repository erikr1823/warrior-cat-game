import {
  getLateGameWave,
  isLateGameTime,
  LATE_GAME_START,
} from "./LateGameBiomeDefinitions.js";

export { LATE_GAME_START, isLateGameTime };

export const WAVE_STAGES = [
  {
    id: 1,
    startTime: 0,
    endTime: 60,
    name: "Castle Courtyard",
    announcement: "Biome I — Castle Courtyard",
    worldId: "castleCourtyard",
  },
  {
    id: 2,
    startTime: 60,
    endTime: 120,
    name: "Summer Forest",
    announcement: "Biome II — Summer Forest",
    worldId: "summerForest",
  },
  {
    id: 3,
    startTime: 120,
    endTime: 180,
    name: "Moonlit Forest",
    announcement: "Biome III — Moonlit Forest",
    worldId: "moonlitForest",
  },
  {
    id: 4,
    startTime: 180,
    endTime: 240,
    name: "Ancient Crypt",
    announcement: "Biome IV — Ancient Crypt",
    worldId: "ancientCrypt",
    spawnIntervalMultiplier: 0.92,
  },
  {
    id: 5,
    startTime: 240,
    endTime: 300,
    name: "Graveyard Grounds",
    announcement: "Biome V — Graveyard Grounds",
    worldId: "graveyard",
    spawnIntervalMultiplier: 0.86,
  },
  {
    id: 6,
    startTime: 300,
    endTime: 360,
    name: "Cursed Ruins",
    announcement: "Biome VI — Cursed Ruins",
    worldId: "cursedRuins",
    spawnIntervalMultiplier: 0.8,
  },
  {
    id: 7,
    startTime: 360,
    endTime: 420,
    name: "Royal Archive",
    announcement: "Biome VII — Royal Archive",
    worldId: "royalArchive",
    spawnIntervalMultiplier: 0.74,
  },
  {
    id: 8,
    startTime: 420,
    endTime: 480,
    name: "Plague Vault",
    announcement: "Biome VIII — Plague Vault",
    worldId: "plagueVault",
    spawnIntervalMultiplier: 0.68,
  },
  {
    id: 9,
    startTime: 480,
    endTime: 540,
    name: "Frost Barrow",
    announcement: "Biome IX — Frost Barrow",
    worldId: "frostBarrow",
    spawnIntervalMultiplier: 0.62,
  },
  {
    id: 10,
    startTime: 540,
    endTime: 600,
    name: "Bone Crypt",
    announcement: "Biome X — Bone Crypt",
    worldId: "boneCrypt",
    spawnIntervalMultiplier: 0.56,
  },
  {
    id: 11,
    startTime: 600,
    endTime: Number.POSITIVE_INFINITY,
    name: "Endgame Rotation",
    announcement: "Endgame — Concept Biomes",
    worldId: "castleCourtyard",
    spawnIntervalMultiplier: 0.5,
    isLateGamePlaceholder: true,
  },
];

export function getWaveForTime(survivalTime) {
  if (isLateGameTime(survivalTime)) {
    return getLateGameWave(survivalTime);
  }

  return (
    WAVE_STAGES.find((wave) => survivalTime >= wave.startTime && survivalTime < wave.endTime) ??
    WAVE_STAGES[WAVE_STAGES.length - 2]
  );
}

export function getWaveMinute(survivalTime) {
  return Math.floor(survivalTime / 60) + 1;
}
