const SOURCE_TILE_SIZE = 16;

const SHEETS = {
  v1: {
    path: "./src/assets/tiles/ever-rogue/v1-packed-alpha.png",
    columns: 14,
  },
  v2: {
    path: "./src/assets/tiles/ever-rogue/v2-packed-alpha.png",
    columns: 8,
  },
};

const FLOOR_TILES = {
  grass: [
    { sheet: "v2", col: 3, row: 0 },
    { sheet: "v2", col: 2, row: 0 },
  ],
  stone: [
    { sheet: "v2", col: 0, row: 0 },
    { sheet: "v2", col: 1, row: 0 },
  ],
  mossStone: [
    { sheet: "v2", col: 2, row: 0 },
    { sheet: "v2", col: 1, row: 0 },
  ],
};

const DECORATION_TILES = {
  rock: [
    { sheet: "v2", col: 1, row: 3 },
    { sheet: "v1", col: 8, row: 5 },
  ],
  bone: [
    { sheet: "v2", col: 5, row: 6 },
    { sheet: "v1", col: 1, row: 11 },
  ],
  grassPatch: [
    { sheet: "v2", col: 0, row: 1 },
    { sheet: "v2", col: 1, row: 1 },
  ],
  candle: [
    { sheet: "v2", col: 0, row: 2 },
    { sheet: "v2", col: 1, row: 2 },
  ],
  ruin: [
    { sheet: "v2", col: 4, row: 2 },
    { sheet: "v1", col: 0, row: 0 },
  ],
};

const LOAD_TIMEOUT_MS = 8000;

export class EverRogueTileset {
  constructor() {
    this.images = new Map();
    this.tileCache = new Map();
    this.isReady = false;
    this.loadError = null;
  }

  load() {
    const entries = Object.entries(SHEETS);

    const loadPromise = Promise.all(
      entries.map(
        ([key, config]) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => {
              this.images.set(key, image);
              resolve();
            };
            image.onerror = () => reject(new Error(`Failed to load ${config.path}`));
            image.src = config.path;
          }),
      ),
    ).then(() => {
      this.isReady = true;
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Tileset load timed out")), LOAD_TIMEOUT_MS);
    });

    return Promise.race([loadPromise, timeoutPromise]).catch((error) => {
      this.loadError = error;
      console.warn("Ever Rogue tileset failed to load, using procedural tiles.", error);
    });
  }

  pickFloorTile(tileX, tileY) {
    const hash = (tileX * 374761393 + tileY * 668265263) ^ 144269504088896;
    const roll = (hash >>> 0) % 100;

    if (roll < 12) {
      return this.pickFromPool(FLOOR_TILES.mossStone, hash);
    }

    if (roll < 34) {
      return this.pickFromPool(FLOOR_TILES.stone, hash >> 3);
    }

    return this.pickFromPool(FLOOR_TILES.grass, hash >> 5);
  }

  pickDecorationTile(type, variant) {
    const pool = DECORATION_TILES[type] ?? DECORATION_TILES.rock;
    return pool[variant % pool.length];
  }

  pickFromPool(pool, seed) {
    return pool[(seed >>> 0) % pool.length];
  }

  drawTile(ctx, tileRef, screenX, screenY, renderSize) {
    const canvas = this.getTileCanvas(tileRef);

    if (!canvas) {
      return false;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, screenX, screenY, renderSize, renderSize);
    return true;
  }

  drawDecoration(ctx, type, variant, screenX, screenY, scale = 1) {
    const tileRef = this.pickDecorationTile(type, variant);
    const canvas = this.getTileCanvas(tileRef);

    if (!canvas) {
      return false;
    }

    const size = SOURCE_TILE_SIZE * scale * 2.4;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, screenX - size / 2, screenY - size / 2, size, size);
    return true;
  }

  getTileCanvas(tileRef) {
    const key = `${tileRef.sheet}:${tileRef.col}:${tileRef.row}`;

    if (this.tileCache.has(key)) {
      return this.tileCache.get(key);
    }

    const image = this.images.get(tileRef.sheet);
    const sheet = SHEETS[tileRef.sheet];

    if (!image || !sheet) {
      return null;
    }

    const sourceX = tileRef.col * SOURCE_TILE_SIZE;
    const sourceY = tileRef.row * SOURCE_TILE_SIZE;

    if (
      sourceX + SOURCE_TILE_SIZE > image.width ||
      sourceY + SOURCE_TILE_SIZE > image.height
    ) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = SOURCE_TILE_SIZE;
    canvas.height = SOURCE_TILE_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      SOURCE_TILE_SIZE,
      SOURCE_TILE_SIZE,
      0,
      0,
      SOURCE_TILE_SIZE,
      SOURCE_TILE_SIZE,
    );

    this.tileCache.set(key, canvas);
    return canvas;
  }
}
