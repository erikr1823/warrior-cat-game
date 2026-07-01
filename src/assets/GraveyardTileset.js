import {
  GRAVEYARD_TILESET_PATH,
  GRAVEYARD_FLOOR,
  GRAVEYARD_FLOOR_OVERLAY_WEIGHTS,
  GRAVEYARD_DECORATIONS,
  GRAVEYARD_DECORATION_SCALE,
} from "../config/GraveyardTilesetConfig.js";

const LOAD_TIMEOUT_MS = 8000;
const BLACK_KEY_THRESHOLD = 14;

function hashTile(tileX, tileY) {
  return (tileX * 374761393 + tileY * 668265263) ^ 144269504088896;
}

function keyBlackPixels(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] <= BLACK_KEY_THRESHOLD && data[i + 1] <= BLACK_KEY_THRESHOLD && data[i + 2] <= BLACK_KEY_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export class GraveyardTileset {
  constructor() {
    this.image = null;
    this.isReady = false;
    this.loadError = null;
    this.sliceCache = new Map();
  }

  load() {
    const loadPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        this.image = image;
        this.isReady = true;
        resolve();
      };
      image.onerror = () => reject(new Error(`Failed to load ${GRAVEYARD_TILESET_PATH}`));
      image.src = GRAVEYARD_TILESET_PATH;
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Graveyard tileset load timed out")), LOAD_TIMEOUT_MS);
    });

    return Promise.race([loadPromise, timeoutPromise]).catch((error) => {
      this.loadError = error;
      console.warn("Graveyard tileset failed to load, using procedural fallback.", error);
    });
  }

  pickStoneRect(tileX, tileY) {
    const hash = hashTile(tileX, tileY);
    const pool = GRAVEYARD_FLOOR.stone;
    return pool[(hash >>> 3) % pool.length];
  }

  pickFloorOverlayRect(tileX, tileY) {
    const hash = hashTile(tileX, tileY);
    const roll = (hash >>> 9) % 100;
    const grassCutoff = GRAVEYARD_FLOOR_OVERLAY_WEIGHTS.grass;
    const dirtCutoff = grassCutoff + GRAVEYARD_FLOOR_OVERLAY_WEIGHTS.dirt;

    if (roll < grassCutoff && GRAVEYARD_FLOOR.grass?.length) {
      return GRAVEYARD_FLOOR.grass[(hash >>> 5) % GRAVEYARD_FLOOR.grass.length];
    }

    if (roll < dirtCutoff && GRAVEYARD_FLOOR.dirt?.length) {
      return GRAVEYARD_FLOOR.dirt[(hash >>> 7) % GRAVEYARD_FLOOR.dirt.length];
    }

    return null;
  }

  pickDecorationRect(type, variant) {
    const pool = GRAVEYARD_DECORATIONS[type] ?? GRAVEYARD_DECORATIONS.rock;
    return pool[variant % pool.length];
  }

  drawFloor(ctx, tileX, tileY, screenX, screenY, renderSize) {
    const stoneRect = this.pickStoneRect(tileX, tileY);
    const stoneCanvas = this.getSliceCanvas(stoneRect, false);

    if (!stoneCanvas) {
      return false;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(stoneCanvas, screenX, screenY, renderSize, renderSize);

    const overlayRect = this.pickFloorOverlayRect(tileX, tileY);

    if (overlayRect) {
      const overlayCanvas = this.getSliceCanvas(overlayRect, true);

      if (overlayCanvas) {
        const inset = renderSize * 0.06;
        const drawSize = renderSize - inset * 2;
        ctx.drawImage(
          overlayCanvas,
          screenX + inset,
          screenY + inset,
          drawSize,
          drawSize,
        );
      }
    }

    return true;
  }

  drawDecoration(ctx, type, variant, screenX, screenY, scale = 1) {
    const rect = this.pickDecorationRect(type, variant);
    const canvas = this.getSliceCanvas(rect, true);

    if (!canvas) {
      return false;
    }

    const baseScale = GRAVEYARD_DECORATION_SCALE[type] ?? 2.4;
    const drawW = rect.w * baseScale * scale;
    const drawH = rect.h * baseScale * scale;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, screenX - drawW / 2, screenY - drawH / 2, drawW, drawH);
    return true;
  }

  getSliceCanvas(rect, keyBlack = false) {
    if (!this.image || !rect) {
      return null;
    }

    const cacheKey = `${rect.x},${rect.y},${rect.w},${rect.h},${keyBlack ? "k" : "r"}`;

    if (this.sliceCache.has(cacheKey)) {
      return this.sliceCache.get(cacheKey);
    }

    if (
      rect.x + rect.w > this.image.width ||
      rect.y + rect.h > this.image.height ||
      rect.w <= 0 ||
      rect.h <= 0
    ) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = rect.w;
    canvas.height = rect.h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.image, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);

    if (keyBlack) {
      keyBlackPixels(canvas);
    }

    this.sliceCache.set(cacheKey, canvas);
    return canvas;
  }
}
