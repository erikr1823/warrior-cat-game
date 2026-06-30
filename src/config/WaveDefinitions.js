export const WAVE_STAGES = [
  // Regular waves use the working imported enemies (slime + zombie/undead family).
  // Do NOT add the old ugly/disabled types — see src/config/EnemyRoster.md.
  {
    id: 1,
    startTime: 0,
    endTime: 60,
    name: "Castle Courtyard",
    announcement: "Biome I — Castle Courtyard",
    worldId: "castleCourtyard",
    spawnWeights: {
      slime: 1,
    },
  },
  {
    id: 2,
    startTime: 60,
    endTime: 120,
    name: "Summer Forest",
    announcement: "Biome II — Summer Forest",
    worldId: "summerForest",
    spawnWeights: {
      slime: 0.75,
      zombie: 0.25,
    },
  },
  {
    id: 3,
    startTime: 120,
    endTime: 180,
    name: "Moonlit Forest",
    announcement: "Biome III — Moonlit Forest",
    worldId: "moonlitForest",
    spawnWeights: {
      slime: 0.55,
      zombie: 0.3,
      greenDragon: 0.15,
    },
  },
  {
    id: 4,
    startTime: 180,
    endTime: 240,
    name: "Ancient Crypt",
    announcement: "Biome IV — Ancient Crypt",
    worldId: "ancientCrypt",
    spawnIntervalMultiplier: 0.92,
    spawnWeights: {
      slime: 0.6,
      zombie: 0.4,
    },
  },
  {
    id: 5,
    startTime: 240,
    endTime: 300,
    name: "Moon Graveyard",
    announcement: "Biome V — Moon Graveyard",
    worldId: "graveyard",
    spawnIntervalMultiplier: 0.86,
    spawnWeights: {
      slime: 0.6,
      zombie: 0.4,
    },
  },
  {
    id: 6,
    startTime: 300,
    endTime: 360,
    name: "Cursed Ruins",
    announcement: "Biome VI — Cursed Ruins",
    worldId: "cursedRuins",
    spawnIntervalMultiplier: 0.8,
    spawnWeights: {
      slime: 0.6,
      zombie: 0.4,
    },
  },
  {
    id: 7,
    startTime: 360,
    endTime: 420,
    name: "Royal Archive",
    announcement: "Biome VII — Royal Archive",
    worldId: "royalArchive",
    spawnIntervalMultiplier: 0.74,
    spawnWeights: {
      slime: 0.6,
      zombie: 0.4,
    },
  },
  {
    id: 8,
    startTime: 420,
    endTime: 480,
    name: "Plague Vault",
    announcement: "Biome VIII — Plague Vault",
    worldId: "plagueVault",
    spawnIntervalMultiplier: 0.68,
    spawnWeights: {
      slime: 0.5,
      zombie: 0.25,
      brainZombie: 0.25,
    },
  },
  {
    id: 9,
    startTime: 480,
    endTime: 540,
    name: "Frost Barrow",
    announcement: "Biome IX — Frost Barrow",
    worldId: "frostBarrow",
    spawnIntervalMultiplier: 0.62,
    spawnWeights: {
      slime: 0.4,
      zombie: 0.2,
      brainZombie: 0.2,
      vikingUndead: 0.2,
    },
  },
  {
    id: 10,
    startTime: 540,
    endTime: 600,
    name: "Bone Crypt",
    announcement: "Biome X — Bone Crypt",
    worldId: "boneCrypt",
    spawnIntervalMultiplier: 0.56,
    spawnWeights: {
      slime: 0.3,
      zombie: 0.15,
      brainZombie: 0.15,
      vikingUndead: 0.15,
      skeletonUndead: 0.25,
    },
  },
  {
    id: 11,
    startTime: 600,
    endTime: Number.POSITIVE_INFINITY,
    name: "Fallen Parade",
    announcement: "Biome XI — Fallen Parade",
    worldId: "fallenParade",
    spawnIntervalMultiplier: 0.5,
    spawnWeights: {
      slime: 0.2,
      zombie: 0.1,
      brainZombie: 0.1,
      vikingUndead: 0.1,
      skeletonUndead: 0.15,
      popstarUndead: 0.175,
      knightUndead: 0.175,
    },
  },
];

export function getWaveForTime(survivalTime) {
  return WAVE_STAGES.find(
    (wave) => survivalTime >= wave.startTime && survivalTime < wave.endTime,
  ) ?? WAVE_STAGES[WAVE_STAGES.length - 1];
}

export function getWaveMinute(survivalTime) {
  return Math.floor(survivalTime / 60) + 1;
}
