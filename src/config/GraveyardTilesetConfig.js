// Graveyard Grounds tileset — adjust source x/y/w/h here if slices look wrong.
// Image: src/assets/tiles/graveyard/TilesetGraveyard.png (200×200)

export const GRAVEYARD_TILESET_PATH = "./src/assets/tiles/graveyard/TilesetGraveyard.png";

/** Floor tiles picked randomly to fill the world grid. */
export const GRAVEYARD_FLOOR = {
  stone: [
    { x: 4, y: 94, w: 16, h: 16 },
    { x: 22, y: 94, w: 16, h: 16 },
    { x: 40, y: 94, w: 16, h: 16 },
    { x: 58, y: 94, w: 16, h: 16 },
    { x: 4, y: 112, w: 16, h: 16 },
    { x: 22, y: 112, w: 16, h: 16 },
    { x: 40, y: 112, w: 16, h: 16 },
    { x: 58, y: 112, w: 16, h: 16 },
  ],
  /** Large grass patch — drawn scaled to one floor cell for variation. */
  grass: [{ x: 66, y: 96, w: 66, h: 58 }],
  /** Large dirt/stone patch — drawn scaled to one floor cell. */
  dirt: [{ x: 138, y: 98, w: 58, h: 56 }],
};

/** Chance per tile for optional grass/dirt overlays on top of stone (0–100). */
export const GRAVEYARD_FLOOR_OVERLAY_WEIGHTS = {
  grass: 14,
  dirt: 10,
};

/** Visual-only props. Keys match WorldDefinitions decorationTypes. */
export const GRAVEYARD_DECORATIONS = {
  tombstone: [
    { x: 6, y: 10, w: 14, h: 22 },
    { x: 24, y: 8, w: 16, h: 24 },
    { x: 42, y: 6, w: 18, h: 26 },
    { x: 60, y: 8, w: 14, h: 24 },
    { x: 8, y: 36, w: 14, h: 22 },
    { x: 26, y: 34, w: 18, h: 24 },
    { x: 46, y: 32, w: 16, h: 26 },
    { x: 64, y: 34, w: 14, h: 24 },
  ],
  fence: [
    { x: 4, y: 168, w: 32, h: 14 },
    { x: 40, y: 168, w: 32, h: 14 },
    { x: 76, y: 168, w: 32, h: 14 },
    { x: 4, y: 152, w: 14, h: 28 },
    { x: 112, y: 168, w: 28, h: 14 },
    { x: 148, y: 168, w: 28, h: 14 },
  ],
  bone: [
    { x: 28, y: 58, w: 12, h: 10 },
    { x: 42, y: 60, w: 10, h: 8 },
    { x: 54, y: 58, w: 12, h: 10 },
    { x: 66, y: 60, w: 10, h: 8 },
  ],
  rock: [
    { x: 82, y: 56, w: 12, h: 10 },
    { x: 96, y: 58, w: 10, h: 8 },
    { x: 108, y: 56, w: 12, h: 10 },
  ],
  deadTree: [{ x: 88, y: 6, w: 20, h: 34 }],
  torch: [{ x: 76, y: 22, w: 10, h: 18 }],
  /** Rare large backdrop — low spawn weight in WorldMap. */
  chapel: [{ x: 112, y: 4, w: 84, h: 84 }],
};

/** Draw scale multipliers per decoration type (visual size on screen). */
export const GRAVEYARD_DECORATION_SCALE = {
  tombstone: 2.8,
  fence: 2.4,
  bone: 2.2,
  rock: 2.2,
  deadTree: 3.2,
  torch: 2.6,
  chapel: 4.8,
};

/** Sparse placement for readability. */
export const GRAVEYARD_SPAWN = {
  decorationsPerChunkMin: 2,
  decorationsPerChunkMax: 4,
  decorationDensity: 0.38,
  chapelChance: 0.012,
};
