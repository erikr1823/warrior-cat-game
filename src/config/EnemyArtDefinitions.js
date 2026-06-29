/** Normalized paths under src/assets/sprites/enemies/{packId}/{type}.png */
export const ENEMY_TYPES = [
  "slime",
  "zombie",
  "brainZombie",
  "vikingUndead",
  "skeletonUndead",
  "popstarUndead",
  "knightUndead",
  "greenDragon",
  "bat",
  "brute",
  "crawler",
  "elite",
  "boss",
  "wolfPouncer",
  "skeletonArcher",
  "shieldBrute",
  "goblinRunner",
  "necromancer",
  "fireImp",
  "iceWraith",
  "castleKnight",
  "polarDogBoss",
  "spottedDogBoss",
  "reaperBoss",
];

const EXTENDED_MAPPING = {
  wolfPouncer: "bat",
  skeletonArcher: "crawler",
  shieldBrute: "brute",
  goblinRunner: "crawler",
  necromancer: "elite",
  fireImp: "bat",
  iceWraith: "elite",
  castleKnight: "brute",
};

function withExtendedMapping(baseMapping) {
  return { ...baseMapping, ...EXTENDED_MAPPING };
}

const SHEET_32X4 = { frameWidth: 32, frameHeight: 32, frameCount: 4, row: 0 };
const SHEET_64X9 = { frameWidth: 64, frameHeight: 64, frameCount: 9, row: 0 };
const SHEET_112X14 = { frameWidth: 112, frameHeight: 112, frameCount: 14, row: 0 };
const SHEET_112X12 = { frameWidth: 112, frameHeight: 112, frameCount: 12, row: 0 };

/** Shared 64×64 walk layout for imported zombie-style sheets. */
const ZOMBIE_DIRECTIONAL_SHEET = {
  frameWidth: 64,
  frameHeight: 64,
  sourceSize: 64,
  renderScale: 1.84375,
  directionRows: {
    down: 6,
    left: 1,
    right: 3,
    up: 8,
  },
  directionFrameCounts: {
    down: 8,
    left: 7,
    right: 7,
    up: 9,
  },
};

/** Single 64×64 sprite facing right; left uses horizontal flip. */
const SINGLE_SPRITE_DIRECTIONAL = {
  frameWidth: 64,
  frameHeight: 64,
  sourceSize: 64,
  renderScale: 2.5,
  directionRows: {
    down: 0,
    left: 0,
    right: 0,
    up: 0,
  },
  directionFrameCounts: {
    down: 1,
    left: 1,
    right: 1,
    up: 1,
  },
  flipDirections: {
    left: true,
  },
};

/** Imported sheets live outside pack folders and override pack art for that type. */
export const IMPORTED_ENEMY_SHEETS = {
  zombie: {
    path: "./src/assets/imported/enemies/zombie/Zombie.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  brainZombie: {
    path: "./src/assets/imported/enemies/brainZombie/BrainZombie.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  vikingUndead: {
    path: "./src/assets/imported/enemies/vikingUndead/VikingUndead.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  skeletonUndead: {
    path: "./src/assets/imported/enemies/skeletonUndead/SkeletonUndead.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  popstarUndead: {
    path: "./src/assets/imported/enemies/popstarUndead/PopstarUndead.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  knightUndead: {
    path: "./src/assets/imported/enemies/knightUndead/KnightUndead.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
  },
  greenDragon: {
    path: "./src/assets/imported/enemies/greenDragon/GreenDragon.png",
    ...SINGLE_SPRITE_DIRECTIONAL,
    renderScale: 1.84375,
  },
  polarDogBoss: {
    path: "./src/assets/imported/bosses/polarDogBoss/PolarDogBoss.png",
    ...SINGLE_SPRITE_DIRECTIONAL,
  },
  spottedDogBoss: {
    path: "./src/assets/imported/bosses/spottedDogBoss/SpottedDogBoss.png",
    ...SINGLE_SPRITE_DIRECTIONAL,
  },
  reaperBoss: {
    path: "./src/assets/imported/bosses/reaperBoss/ReaperBoss.png",
    ...ZOMBIE_DIRECTIONAL_SHEET,
    renderScale: 2.5,
  },
};

export function getImportedEnemySheet(enemyType) {
  return IMPORTED_ENEMY_SHEETS[enemyType] ?? null;
}

export const ENEMY_ART_PACKS = {
  pixelCrawler: {
    id: "pixelCrawler",
    label: "Pixel Crawler",
    credit: "Anokolisa — Pixel Crawler Free Pack",
    creditUrl: "https://anokolisa.itch.io/free-pixel-art-asset-pack-topdown-tileset-rpg-16x16-sprites",
    sourceSize: 32,
    renderScale: 3.6,
    proceduralTint: "#b8c4d8",
    mapping: withExtendedMapping({
      slime: "slime",
      zombie: "zombie",
      brainZombie: "brainZombie",
      vikingUndead: "vikingUndead",
      skeletonUndead: "skeletonUndead",
      popstarUndead: "popstarUndead",
      knightUndead: "knightUndead",
      greenDragon: "greenDragon",
      polarDogBoss: "polarDogBoss",
      spottedDogBoss: "spottedDogBoss",
      reaperBoss: "reaperBoss",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    }),
    sheets: {
      slime: SHEET_32X4,
      bat: SHEET_32X4,
      brute: SHEET_32X4,
      crawler: SHEET_32X4,
      elite: SHEET_32X4,
      boss: SHEET_32X4,
    },
  },
  tinyMonsters: {
    id: "tinyMonsters",
    label: "64x Tiny Monsters",
    credit: "JedimeisterX — 64x Tiny Monsters",
    creditUrl: "https://jedimeisterx.itch.io/64-tiny-monsters-free-32x32-pixel-art",
    sourceSize: 32,
    renderScale: 3.5,
    proceduralTint: "#9ec49a",
    mapping: withExtendedMapping({
      slime: "slime",
      zombie: "zombie",
      brainZombie: "brainZombie",
      vikingUndead: "vikingUndead",
      skeletonUndead: "skeletonUndead",
      popstarUndead: "popstarUndead",
      knightUndead: "knightUndead",
      greenDragon: "greenDragon",
      polarDogBoss: "polarDogBoss",
      spottedDogBoss: "spottedDogBoss",
      reaperBoss: "reaperBoss",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    }),
    sheets: {},
  },
  darkFantasy: {
    id: "darkFantasy",
    label: "Dark Fantasy Enemies",
    credit: "MonoPixelArt — Dark Fantasy Enemies",
    creditUrl: "https://monopixelart.itch.io/dark-fantasy-enemies-asset-pack",
    sourceSize: 64,
    renderScale: 1.8,
    proceduralTint: "#7a6a98",
    mapping: withExtendedMapping({
      slime: "slime",
      zombie: "zombie",
      brainZombie: "brainZombie",
      vikingUndead: "vikingUndead",
      skeletonUndead: "skeletonUndead",
      popstarUndead: "popstarUndead",
      knightUndead: "knightUndead",
      greenDragon: "greenDragon",
      polarDogBoss: "polarDogBoss",
      spottedDogBoss: "spottedDogBoss",
      reaperBoss: "reaperBoss",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    }),
    sheets: {
      bat: SHEET_64X9,
    },
  },
  cursedSpirits: {
    id: "cursedSpirits",
    label: "Cursed Spirits",
    credit: "exclusiveOlive — Free Fantasy Enemy Pack 1",
    creditUrl: "https://exclusiveolive.itch.io/free-fantasy-enemy-pack-1",
    sourceSize: 112,
    renderScale: 1.05,
    proceduralTint: "#d89078",
    mapping: withExtendedMapping({
      slime: "slime",
      zombie: "zombie",
      brainZombie: "brainZombie",
      vikingUndead: "vikingUndead",
      skeletonUndead: "skeletonUndead",
      popstarUndead: "popstarUndead",
      knightUndead: "knightUndead",
      greenDragon: "greenDragon",
      polarDogBoss: "polarDogBoss",
      spottedDogBoss: "spottedDogBoss",
      reaperBoss: "reaperBoss",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    }),
    sheets: {
      slime: SHEET_112X12,
      bat: SHEET_112X12,
      brute: SHEET_112X14,
      crawler: SHEET_112X14,
      elite: SHEET_112X14,
      boss: SHEET_112X14,
    },
  },
  ink: {
    id: "ink",
    label: "Lanternfall Ink",
    credit: "Procedural — Lanternfall",
    creditUrl: "",
    sourceSize: 182,
    renderScale: 1,
    proceduralTint: null,
    mapping: withExtendedMapping({
      slime: "slime",
      zombie: "zombie",
      brainZombie: "brainZombie",
      vikingUndead: "vikingUndead",
      skeletonUndead: "skeletonUndead",
      popstarUndead: "popstarUndead",
      knightUndead: "knightUndead",
      greenDragon: "greenDragon",
      polarDogBoss: "polarDogBoss",
      spottedDogBoss: "spottedDogBoss",
      reaperBoss: "reaperBoss",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    }),
  },
};

export function getEnemyArtPack(packId) {
  return ENEMY_ART_PACKS[packId] ?? ENEMY_ART_PACKS.ink;
}

export function getEnemySpritePath(packId, enemyType) {
  const pack = getEnemyArtPack(packId);
  const fileKey = pack.mapping[enemyType] ?? enemyType;
  return `./src/assets/sprites/enemies/${packId}/${fileKey}.png`;
}

export function getEnemySheetPath(packId, enemyType) {
  const pack = getEnemyArtPack(packId);
  const fileKey = pack.mapping[enemyType] ?? enemyType;
  return `./src/assets/sprites/enemies/${packId}/${fileKey}/sheet.png`;
}

export function getEnemySheetMeta(packId, enemyType) {
  const pack = getEnemyArtPack(packId);
  return pack.sheets?.[enemyType] ?? null;
}
