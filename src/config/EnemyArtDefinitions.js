/** Normalized paths under src/assets/sprites/enemies/{packId}/{type}.png */
export const ENEMY_TYPES = ["slime", "bat", "brute", "crawler", "elite", "boss"];

const SHEET_32X4 = { frameWidth: 32, frameHeight: 32, frameCount: 4, row: 0 };
const SHEET_64X9 = { frameWidth: 64, frameHeight: 64, frameCount: 9, row: 0 };
const SHEET_112X14 = { frameWidth: 112, frameHeight: 112, frameCount: 14, row: 0 };
const SHEET_112X12 = { frameWidth: 112, frameHeight: 112, frameCount: 12, row: 0 };

export const ENEMY_ART_PACKS = {
  pixelCrawler: {
    id: "pixelCrawler",
    label: "Pixel Crawler",
    credit: "Anokolisa — Pixel Crawler Free Pack",
    creditUrl: "https://anokolisa.itch.io/free-pixel-art-asset-pack-topdown-tileset-rpg-16x16-sprites",
    sourceSize: 32,
    renderScale: 3.6,
    proceduralTint: "#b8c4d8",
    mapping: {
      slime: "slime",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    },
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
    mapping: {
      slime: "slime",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    },
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
    mapping: {
      slime: "slime",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    },
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
    mapping: {
      slime: "slime",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    },
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
    mapping: {
      slime: "slime",
      bat: "bat",
      brute: "brute",
      crawler: "crawler",
      elite: "elite",
      boss: "boss",
    },
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
