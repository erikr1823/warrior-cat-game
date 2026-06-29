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
  },
};

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
  ctx.fillRect(0, 0, TILE_SIZE, 6);
  ctx.fillRect(0, TILE_SIZE - 6, TILE_SIZE, 6);
  ctx.fillRect(0, 0, 6, TILE_SIZE);
  ctx.fillRect(TILE_SIZE - 6, 0, 6, TILE_SIZE);

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

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const x = col * 32 + (row % 2) * 8;
      const y = row * 32;
      ctx.fillStyle = highlights[(row + col + variant) % highlights.length];
      ctx.fillRect(x + 2, y + 2, 28, 26);
      ctx.strokeStyle = "rgba(18, 20, 24, 0.22)";
      ctx.strokeRect(x + 2, y + 2, 28, 26);
    }
  }

  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = `rgba(20, 24, 28, ${0.08 + rand() * 0.08})`;
    ctx.beginPath();
    ctx.arc(rand() * TILE_SIZE, rand() * TILE_SIZE, 4 + rand() * 8, 0, Math.PI * 2);
    ctx.fill();
  }

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
    grassTiles: [0, 1, 2].map((variant) => createGrassTile(variant, paletteId)),
    stoneTiles: [0, 1].map((variant) => createStoneTile(variant, paletteId)),
    mossStoneTiles: [0].map((variant) => createMossStoneTile(variant, paletteId)),
  };
}

export function hashWorldPosition(x, y) {
  return hashTile(Math.floor(x), Math.floor(y));
}

export { mulberry32, hashTile };
