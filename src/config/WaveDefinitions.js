export const WAVE_STAGES = [
  {
    id: 1,
    startTime: 0,
    endTime: 60,
    name: "Dusty Stacks",
    announcement: "Wing I — Dusty Stacks",
    worldId: "pixelCrawler",
    spawnWeights: {
      slime: 1,
    },
  },
  {
    id: 2,
    startTime: 60,
    endTime: 120,
    name: "Fluttering Leaves",
    announcement: "Wing II — Fluttering Leaves",
    worldId: "pixelCrawlerDeep",
    spawnWeights: {
      slime: 0.72,
      bat: 0.28,
    },
  },
  {
    id: 3,
    startTime: 120,
    endTime: 180,
    name: "Scurrying Margins",
    announcement: "Wing III — Scurrying Margins",
    worldId: "tinyMonsters",
    spawnWeights: {
      slime: 0.42,
      bat: 0.33,
      crawler: 0.25,
    },
  },
  {
    id: 4,
    startTime: 180,
    endTime: 240,
    name: "Heavy Tomes",
    announcement: "Wing IV — Heavy Tomes",
    worldId: "darkFantasy",
    spawnIntervalMultiplier: 0.88,
    spawnWeights: {
      slime: 0.35,
      bat: 0.3,
      crawler: 0.25,
      brute: 0.1,
    },
  },
  {
    id: 5,
    startTime: 240,
    endTime: 300,
    name: "Collapsing Shelves",
    announcement: "Wing V — Collapsing Shelves",
    worldId: "cursedSpirits",
    spawnIntervalMultiplier: 0.82,
    spawnWeights: {
      slime: 0.22,
      bat: 0.22,
      crawler: 0.2,
      brute: 0.36,
    },
  },
  {
    id: 6,
    startTime: 300,
    endTime: Number.POSITIVE_INFINITY,
    name: "Unwritten Tide",
    announcement: "Wing VI — The Unwritten Tide",
    worldId: "unwritten",
    spawnIntervalMultiplier: 0.76,
    eliteChance: 0.08,
    spawnWeights: {
      slime: 0.2,
      bat: 0.2,
      crawler: 0.22,
      brute: 0.28,
      elite: 0.1,
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
