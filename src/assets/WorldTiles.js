const TILE_SIZE = 128;

export const TILE_PALETTES = {
  dungeon: {
    grass: { bases: ["#3a3840", "#36343c", "#323038"], accent: ["#4a4850", "#504e58", "#44424c"] },
    stone: { bases: ["#4a4e55", "#434750", "#3f444c"], highlights: ["#5f6670", "#565d67", "#525862"] },
    moss: { bases: ["#4a4e55", "#434750", "#3f444c"], highlights: ["#5f6670", "#565d67", "#525862"], moss: "rgba(70, 82, 58, 0.42)" },
    stroke: "rgba(28, 32, 38, 0.22)",
    edge: "rgba(18, 20, 24, 0.1)",
  },
  dungeonMoss: {
    grass: { bases: ["#344038", "#303c34", "#2c382e"], accent: ["#445048", "#4a564e", "#3e4a42"] },
    stone: { bases: ["#424840", "#3c443c", "#364038"], highlights: ["#565e56", "#505850", "#4a524a"] },
    moss: { bases: ["#424840", "#3c443c", "#364038"], highlights: ["#565e56", "#505850", "#4a524a"], moss: "rgba(58, 92, 54, 0.52)" },
    stroke: "rgba(24, 36, 28, 0.22)",
    edge: "rgba(16, 22, 18, 0.1)",
  },
  margins: {
    grass: { bases: ["#3a4230", "#36402c", "#323c28"], accent: ["#4a5440", "#505a46", "#444e3a"] },
    stone: { bases: ["#4a4034", "#443a30", "#3e342c"], highlights: ["#5e5448", "#584e42", "#52483c"] },
    moss: { bases: ["#4a4034", "#443a30", "#3e342c"], highlights: ["#5e5448", "#584e42", "#52483c"], moss: "rgba(72, 98, 48, 0.48)" },
    stroke: "rgba(32, 38, 24, 0.22)",
    edge: "rgba(20, 24, 16, 0.1)",
  },
  shadow: {
    grass: { bases: ["#242030", "#201c2c", "#1c1828"], accent: ["#342e48", "#3a3450", "#2e2844"] },
    stone: { bases: ["#2a2438", "#262034", "#221c30"], highlights: ["#3a3450", "#36304a", "#322c46"] },
    moss: { bases: ["#2a2438", "#262034", "#221c30"], highlights: ["#3a3450", "#36304a", "#322c46"], moss: "rgba(48, 36, 72, 0.45)" },
    stroke: "rgba(36, 28, 52, 0.24)",
    edge: "rgba(14, 10, 22, 0.12)",
  },
  cursed: {
    grass: { bases: ["#402820", "#3a241c", "#342018"], accent: ["#503830", "#563a32", "#4a342c"] },
    stone: { bases: ["#483028", "#422a24", "#3c261e"], highlights: ["#604038", "#5a3a34", "#543630"] },
    moss: { bases: ["#483028", "#422a24", "#3c261e"], highlights: ["#604038", "#5a3a34", "#543630"], moss: "rgba(120, 48, 32, 0.38)" },
    stroke: "rgba(52, 24, 18, 0.22)",
    edge: "rgba(24, 12, 10, 0.1)",
  },
  unwritten: {
    grass: { bases: ["#2a2848", "#2e2c52", "#262446"], accent: ["#3a3668", "#403c72", "#343060"] },
    stone: { bases: ["#3a2e24", "#342820", "#2e241c"], highlights: ["#524036", "#4a382e", "#443428"] },
    moss: { bases: ["#3a2e24", "#342820", "#2e241c"], highlights: ["#524036", "#4a382e", "#443428"], moss: "rgba(62, 54, 88, 0.45)" },
    stroke: "rgba(48, 44, 72, 0.22)",
    edge: "rgba(22, 20, 36, 0.1)",
    tileWeights: { moss: 0.14, stone: 0.28, grass: 0.58 },
  },
  castleCourtyard: {
    grass: { bases: ["#6a5e48", "#645842", "#5e543c"], accent: ["#8a7858", "#907e60", "#7a6a50"] },
    stone: { bases: ["#9a9080", "#8a8070", "#807668"], highlights: ["#b8b0a0", "#aea698", "#a49c90"] },
    moss: { bases: ["#7a7058", "#746a52", "#6e644c"], highlights: ["#948870", "#8a8068", "#807860"], moss: "rgba(88, 98, 48, 0.28)" },
    stroke: "rgba(48, 40, 28, 0.2)",
    edge: "rgba(32, 26, 18, 0.1)",
    tileWeights: { moss: 0.06, cracked: 0.16, stone: 0.5, grass: 0.28 },
  },
  moonlitForest: {
    grass: { bases: ["#142820", "#122620", "#102420"], accent: ["#244038", "#284840", "#203830"] },
    stone: { bases: ["#1c2830", "#182428", "#142028"], highlights: ["#344048", "#2e3a44", "#283640"] },
    moss: { bases: ["#183024", "#142c20", "#12281e"], highlights: ["#304838", "#2c4434", "#284030"], moss: "rgba(60, 110, 90, 0.52)" },
    stroke: "rgba(16, 32, 28, 0.22)",
    edge: "rgba(8, 14, 12, 0.12)",
    tileWeights: { moss: 0.24, cracked: 0.05, stone: 0.1, grass: 0.61 },
  },
  ancientCrypt: {
    grass: { bases: ["#342838", "#302434", "#2c2030"], accent: ["#443848", "#4a3e50", "#403442"] },
    stone: { bases: ["#484058", "#423a52", "#3c364c"], highlights: ["#625870", "#5c5268", "#564c62"] },
    moss: { bases: ["#403848", "#3a3442", "#34303c"], highlights: ["#5a5068", "#544a60", "#4e465a"], moss: "rgba(68, 58, 92, 0.35)" },
    stroke: "rgba(32, 24, 44, 0.24)",
    edge: "rgba(14, 10, 20, 0.12)",
    tileWeights: { moss: 0.08, stone: 0.62, grass: 0.3 },
  },
  snowyPass: {
    grass: { bases: ["#d8e4f0", "#d0dce8", "#c8d4e0"], accent: ["#eef4fa", "#e8eef6", "#e0e8f2"] },
    stone: { bases: ["#a8b8c8", "#9eb0c0", "#94a8b8"], highlights: ["#c8d8e8", "#becede", "#b4c4d4"] },
    moss: { bases: ["#b0c0d0", "#a6b6c6", "#9cacc0"], highlights: ["#d0e0f0", "#c6d6e6", "#bccce0"], moss: "rgba(180, 210, 240, 0.35)" },
    stroke: "rgba(120, 140, 168, 0.18)",
    edge: "rgba(200, 220, 240, 0.14)",
    tileWeights: { moss: 0.1, stone: 0.48, grass: 0.42 },
  },
  lavaForge: {
    grass: { bases: ["#281814", "#241410", "#20100c"], accent: ["#402820", "#483020", "#382018"] },
    stone: { bases: ["#342018", "#301c14", "#2c1810"], highlights: ["#503028", "#4a2c24", "#442820"] },
    moss: { bases: ["#301810", "#2c140c", "#281008"], highlights: ["#4a3020", "#442c1c", "#3e2818"], moss: "rgba(180, 64, 24, 0.32)" },
    stroke: "rgba(48, 20, 8, 0.26)",
    edge: "rgba(18, 8, 4, 0.14)",
    tileWeights: { moss: 0.12, stone: 0.68, grass: 0.2 },
  },
  royalArchive: {
    grass: { bases: ["#4a3424", "#463020", "#422c1c"], accent: ["#624838", "#684e3e", "#5a4030"] },
    stone: { bases: ["#6a5040", "#644a38", "#5e4434"], highlights: ["#886858", "#806050", "#785848"] },
    moss: { bases: ["#5a4030", "#543a2c", "#4e3428"], highlights: ["#785840", "#705038", "#684830"], moss: "rgba(120, 88, 40, 0.3)" },
    stroke: "rgba(36, 24, 12, 0.22)",
    edge: "rgba(20, 12, 6, 0.1)",
    tileWeights: { moss: 0.04, cracked: 0.08, stone: 0.46, grass: 0.42 },
  },
  plagueVault: {
    grass: { bases: ["#2a3828", "#263424", "#223020"], accent: ["#3a4838", "#405040", "#364430"] },
    stone: { bases: ["#384438", "#343e34", "#303830"], highlights: ["#525c52", "#4c564c", "#465046"] },
    moss: { bases: ["#344028", "#303c24", "#2c3820"], highlights: ["#4c5840", "#465238", "#404c34"], moss: "rgba(72, 120, 64, 0.45)" },
    stroke: "rgba(24, 36, 20, 0.24)",
    edge: "rgba(12, 18, 10, 0.12)",
    tileWeights: { moss: 0.18, stone: 0.52, grass: 0.3 },
  },
  frostBarrow: {
    grass: { bases: ["#3a4858", "#364450", "#32404c"], accent: ["#506070", "#566878", "#4a5c6c"] },
    stone: { bases: ["#586878", "#526272", "#4c5c6c"], highlights: ["#788898", "#728292", "#6c7c8c"] },
    moss: { bases: ["#4a5868", "#445262", "#404c5c"], highlights: ["#687888", "#627282", "#5c6c7c"], moss: "rgba(140, 180, 210, 0.35)" },
    stroke: "rgba(32, 44, 56, 0.22)",
    edge: "rgba(16, 22, 32, 0.12)",
    tileWeights: { moss: 0.1, cracked: 0.16, stone: 0.54, grass: 0.2 },
  },
  boneCrypt: {
    grass: { bases: ["#3a3840", "#36343c", "#323038"], accent: ["#504e58", "#565460", "#4a4850"] },
    stone: { bases: ["#585660", "#525058", "#4c4a54"], highlights: ["#787680", "#727078", "#6c6a74"] },
    moss: { bases: ["#4a4850", "#44444c", "#404048"], highlights: ["#686670", "#626068", "#5c5a64"], moss: "rgba(160, 160, 170, 0.3)" },
    stroke: "rgba(36, 34, 44, 0.22)",
    edge: "rgba(18, 16, 24, 0.12)",
    tileWeights: { moss: 0.1, stone: 0.64, grass: 0.26 },
  },
  fallenParade: {
    grass: { bases: ["#3a2838", "#362434", "#322030"], accent: ["#503848", "#563e50", "#4a3444"] },
    stone: { bases: ["#584058", "#523a52", "#4c344c"], highlights: ["#785870", "#725068", "#6c4860"] },
    moss: { bases: ["#4a3448", "#443044", "#402c40"], highlights: ["#685060", "#624858", "#5c4450"], moss: "rgba(160, 96, 140, 0.32)" },
    stroke: "rgba(36, 20, 32, 0.22)",
    edge: "rgba(18, 10, 16, 0.12)",
    tileWeights: { moss: 0.12, stone: 0.52, grass: 0.36 },
  },
  cursedRuins: {
    grass: { bases: ["#283020", "#242c1c", "#202818"], accent: ["#384830", "#405038", "#344428"] },
    stone: { bases: ["#3a4030", "#363a2c", "#323428"], highlights: ["#525840", "#4c5238", "#464c34"] },
    moss: { bases: ["#344028", "#303c24", "#2c3820"], highlights: ["#4c5840", "#465238", "#404c34"], moss: "rgba(48, 88, 32, 0.55)" },
    stroke: "rgba(24, 32, 18, 0.24)",
    edge: "rgba(12, 16, 8, 0.12)",
    tileWeights: { moss: 0.28, stone: 0.34, grass: 0.38 },
  },
  summerForest: {
    grass: { bases: ["#4a7838", "#467034", "#426830"], accent: ["#68a048", "#70a850", "#5c9840"] },
    stone: { bases: ["#6a6048", "#645a44", "#5e543c"], highlights: ["#847860", "#7c7058", "#746850"] },
    moss: { bases: ["#527840", "#4c7038", "#466834"], highlights: ["#6a9850", "#629048", "#5a8840"], moss: "rgba(72, 120, 48, 0.42)" },
    stroke: "rgba(32, 48, 24, 0.2)",
    edge: "rgba(18, 28, 12, 0.1)",
    tileWeights: { moss: 0.18, stone: 0.1, grass: 0.72 },
  },
  graveyard: {
    grass: { bases: ["#343a32", "#303830", "#2c342e"], accent: ["#444e40", "#4a5644", "#3e4838"] },
    stone: { bases: ["#505860", "#4a5058", "#444850"], highlights: ["#686e78", "#626870", "#5c6268"] },
    moss: { bases: ["#3a4038", "#363a34", "#323630"], highlights: ["#525860", "#4c5248", "#464c44"], moss: "rgba(68, 88, 72, 0.4)" },
    stroke: "rgba(28, 32, 28, 0.22)",
    edge: "rgba(14, 16, 14, 0.12)",
    tileWeights: { moss: 0.16, cracked: 0.1, stone: 0.42, grass: 0.32 },
  },
  graveyardGrounds: {
    grass: { bases: ["#2e3830", "#2a342c", "#263028"], accent: ["#3e4a38", "#44503c", "#384432"] },
    stone: { bases: ["#4a5058", "#444a52", "#3e444c"], highlights: ["#626870", "#5c6268", "#565c64"] },
    moss: { bases: ["#344038", "#303c34", "#2c382e"], highlights: ["#4c5648", "#465042", "#404a3c"], moss: "rgba(58, 78, 52, 0.42)" },
    stroke: "rgba(24, 28, 32, 0.22)",
    edge: "rgba(12, 14, 18, 0.12)",
    tileWeights: { moss: 0.16, stone: 0.52, grass: 0.32 },
  },
};

const DEFAULT_TILE_WEIGHTS = { moss: 0.12, cracked: 0.08, stone: 0.22, grass: 0.58 };

export function getTileWeights(paletteId) {
  const palette = TILE_PALETTES[paletteId] ?? TILE_PALETTES.unwritten;
  return palette.tileWeights ?? DEFAULT_TILE_WEIGHTS;
}

function mulberry32(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTile(x, y) {
  return (x * 374761393 + y * 668265263) ^ 144269504088896;
}

export function getTileSize() {
  return TILE_SIZE;
}

export function createGrassTile(variant, paletteId = "unwritten") {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext("2d");
  const palette = TILE_PALETTES[paletteId] ?? TILE_PALETTES.unwritten;
  const bases = palette.grass.bases;
  const accent = palette.grass.accent;

  ctx.fillStyle = bases[variant % bases.length];
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  const rand = mulberry32(hashTile(variant, 11));

  for (let i = 0; i < 28; i += 1) {
    const x = rand() * TILE_SIZE;
    const y = rand() * TILE_SIZE;
    ctx.fillStyle = accent[(variant + i) % accent.length];
    ctx.fillRect(x, y, 2 + (i % 2), 2 + (i % 3));
  }

  for (let i = 0; i < 16; i += 1) {
    const x = rand() * TILE_SIZE;
    const y = rand() * TILE_SIZE;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x + (rand() - 0.5) * 8, y - 6);
    ctx.stroke();
  }

  ctx.fillStyle = palette.edge;
  const vignette = mulberry32(hashTile(variant, 53));
  for (let i = 0; i < 4; i += 1) {
    const corner = i;
    const size = 18 + vignette() * 14;
    ctx.globalAlpha = 0.08 + vignette() * 0.06;
    if (corner === 0) {
      ctx.fillRect(0, 0, size, size);
    } else if (corner === 1) {
      ctx.fillRect(TILE_SIZE - size, 0, size, size);
    } else if (corner === 2) {
      ctx.fillRect(0, TILE_SIZE - size, size, size);
    } else {
      ctx.fillRect(TILE_SIZE - size, TILE_SIZE - size, size, size);
    }
  }
  ctx.globalAlpha = 1;

  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = `rgba(12, 14, 18, ${0.02 + rand() * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(rand() * TILE_SIZE, rand() * TILE_SIZE, 6 + rand() * 10, 4 + rand() * 8, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export function createStoneTile(variant, paletteId = "unwritten") {
  const canvas = document.createElement("canvas");
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext("2d");
  const palette = TILE_PALETTES[paletteId] ?? TILE_PALETTES.unwritten;
  const bases = palette.stone.bases;
  const highlights = palette.stone.highlights;

  ctx.fillStyle = bases[variant % bases.length];
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  const rand = mulberry32(hashTile(variant, 29));
  const stoneCount = 9 + (variant % 3);

  for (let i = 0; i < stoneCount; i += 1) {
    const w = 22 + rand() * 28;
    const h = 18 + rand() * 24;
    const x = rand() * (TILE_SIZE - w);
    const y = rand() * (TILE_SIZE - h);
    const inset = 1 + rand() * 2;

    ctx.fillStyle = highlights[(i + variant) % highlights.length];
    ctx.beginPath();
    ctx.moveTo(x + inset, y + h * 0.15);
    ctx.lineTo(x + w - inset, y + inset);
    ctx.lineTo(x + w - inset * 2, y + h - inset);
    ctx.lineTo(x + inset * 2, y + h - inset * 1.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(18, 20, 24, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = `rgba(20, 24, 28, ${0.05 + rand() * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(rand() * TILE_SIZE, rand() * TILE_SIZE, 3 + rand() * 9, 2 + rand() * 7, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export function createCrackedStoneTile(variant, paletteId = "unwritten") {
  const canvas = createStoneTile(variant, paletteId);
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(hashTile(variant, 61));

  ctx.strokeStyle = "rgba(14, 16, 20, 0.42)";
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 3 + (variant % 2); i += 1) {
    ctx.beginPath();
    const startX = rand() * TILE_SIZE;
    const startY = rand() * TILE_SIZE;
    ctx.moveTo(startX, startY);

    let x = startX;
    let y = startY;

    for (let step = 0; step < 3 + Math.floor(rand() * 3); step += 1) {
      x += (rand() - 0.5) * 36;
      y += (rand() - 0.5) * 36;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  ctx.fillStyle = "rgba(10, 12, 16, 0.12)";
  ctx.beginPath();
  ctx.ellipse(24 + rand() * 80, 24 + rand() * 80, 8 + rand() * 12, 5 + rand() * 8, 0, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

export function createMossStoneTile(variant, paletteId = "unwritten") {
  const canvas = createStoneTile(variant, paletteId);
  const ctx = canvas.getContext("2d");
  const rand = mulberry32(hashTile(variant, 47));
  const palette = TILE_PALETTES[paletteId] ?? TILE_PALETTES.unwritten;
  const mossColor = palette.moss?.moss ?? "rgba(62, 54, 88, 0.45)";

  for (let i = 0; i < 10; i += 1) {
    ctx.fillStyle = mossColor;
    ctx.beginPath();
    ctx.ellipse(rand() * TILE_SIZE, rand() * TILE_SIZE, 8 + rand() * 10, 5 + rand() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

export function createWorldTileSet(paletteId) {
  return {
    grassTiles: [0, 1, 2, 3, 4].map((variant) => createGrassTile(variant, paletteId)),
    stoneTiles: [0, 1, 2, 3].map((variant) => createStoneTile(variant, paletteId)),
    crackedStoneTiles: [0, 1].map((variant) => createCrackedStoneTile(variant, paletteId)),
    mossStoneTiles: [0, 1].map((variant) => createMossStoneTile(variant, paletteId)),
  };
}

export function hashWorldPosition(x, y) {
  return hashTile(Math.floor(x), Math.floor(y));
}

export { mulberry32, hashTile };
