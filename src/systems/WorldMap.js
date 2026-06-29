import { GameConfig } from "../config/GameConfig.js";
import { EverRogueTileset } from "../assets/EverRogueTileset.js";
import {
  createWorldTileSet,
  getTileSize,
  hashTile,
  mulberry32,
} from "../assets/WorldTiles.js";

const DECORATION_TYPES = ["rock", "bone", "grassPatch", "candle", "ruin"];

export class WorldMap {
  constructor(config = GameConfig.world) {
    this.config = config;
    this.tileSize = config.tileSize ?? getTileSize();
    this.chunkSize = config.chunkSize ?? 512;
    this.bounds = config.bounds;
    this.decorationCache = new Map();
    this.usePixelTileset = config.useEverRogueTileset ?? true;
    this.tileset = new EverRogueTileset();
    this.tileSets = {};
    this.activeTilePalette = "unwritten";
  }

  setTilePalette(paletteId) {
    if (this.activeTilePalette === paletteId) {
      return;
    }

    this.activeTilePalette = paletteId;

    if (!this.tileSets[paletteId]) {
      this.tileSets[paletteId] = createWorldTileSet(paletteId);
    }
  }

  getActiveTiles() {
    if (!this.tileSets[this.activeTilePalette]) {
      this.tileSets[this.activeTilePalette] = createWorldTileSet(this.activeTilePalette);
    }

    return this.tileSets[this.activeTilePalette];
  }

  async load() {
    if (!this.usePixelTileset) {
      return;
    }

    await this.tileset.load();
  }

  usesEverRogueTiles() {
    return this.usePixelTileset && this.tileset.isReady;
  }

  clampPosition(position) {
    position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, position.x));
    position.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, position.y));
  }

  draw(ctx, camera) {
    this.drawTiles(ctx, camera);
    this.drawDecorations(ctx, camera);
    this.drawEdgeFade(ctx, camera);
  }

  pickProceduralTile(tileX, tileY) {
    const tiles = this.getActiveTiles();
    const hash = hashTile(tileX, tileY);
    const rand = mulberry32(hash);
    const roll = rand();

    if (roll < 0.12) {
      return tiles.mossStoneTiles[this.modIndex(hash, tiles.mossStoneTiles.length)];
    }

    if (roll < 0.34) {
      return tiles.stoneTiles[this.modIndex(hash, tiles.stoneTiles.length)];
    }

    return tiles.grassTiles[this.modIndex(hash, tiles.grassTiles.length)];
  }

  drawProceduralTile(ctx, tileX, tileY, screenX, screenY, tileSize) {
    const tile = this.pickProceduralTile(tileX, tileY);

    if (tile) {
      ctx.drawImage(tile, screenX, screenY, tileSize, tileSize);
      return;
    }

    ctx.fillStyle = "#3f5a3d";
    ctx.fillRect(screenX, screenY, tileSize, tileSize);
  }

  modIndex(value, length) {
    return ((value % length) + length) % length;
  }

  drawTiles(ctx, camera) {
    const tileSize = this.tileSize;
    const startTileX = Math.floor(camera.position.x / tileSize) - 1;
    const endTileX = Math.ceil((camera.position.x + camera.width) / tileSize) + 1;
    const startTileY = Math.floor(camera.position.y / tileSize) - 1;
    const endTileY = Math.ceil((camera.position.y + camera.height) / tileSize) + 1;

    ctx.imageSmoothingEnabled = false;

    for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
      for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
        const worldX = tileX * tileSize;
        const worldY = tileY * tileSize;
        const screenX = worldX - camera.position.x;
        const screenY = worldY - camera.position.y;

        if (this.usesEverRogueTiles()) {
          const tileRef = this.tileset.pickFloorTile(tileX, tileY);
          const drew = this.tileset.drawTile(ctx, tileRef, screenX, screenY, tileSize);

          if (!drew) {
            this.drawProceduralTile(ctx, tileX, tileY, screenX, screenY, tileSize);
          }
        } else {
          this.drawProceduralTile(ctx, tileX, tileY, screenX, screenY, tileSize);
        }
      }
    }
  }

  getChunkDecorations(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;

    if (this.decorationCache.has(key)) {
      return this.decorationCache.get(key);
    }

    const decorations = this.generateChunkDecorations(chunkX, chunkY);
    this.decorationCache.set(key, decorations);

    if (this.decorationCache.size > this.config.maxCachedChunks) {
      const oldestKey = this.decorationCache.keys().next().value;
      this.decorationCache.delete(oldestKey);
    }

    return decorations;
  }

  generateChunkDecorations(chunkX, chunkY) {
    const rand = mulberry32(hashTile(chunkX, chunkY) ^ 0x9e3779b9);
    const count = Math.floor(rand() * 6) + 4;
    const decorations = [];
    const chunkWorldX = chunkX * this.chunkSize;
    const chunkWorldY = chunkY * this.chunkSize;

    for (let i = 0; i < count; i += 1) {
      if (rand() > this.config.decorationDensity) {
        continue;
      }

      const type = DECORATION_TYPES[Math.floor(rand() * DECORATION_TYPES.length)];
      decorations.push({
        type,
        x: chunkWorldX + rand() * this.chunkSize,
        y: chunkWorldY + rand() * this.chunkSize,
        variant: Math.floor(rand() * 1000),
        scale: 0.85 + rand() * 0.35,
      });
    }

    return decorations;
  }

  drawDecorations(ctx, camera) {
    const padding = this.config.decorationDrawPadding ?? 96;
    const startChunkX = Math.floor((camera.position.x - padding) / this.chunkSize);
    const endChunkX = Math.floor((camera.position.x + camera.width + padding) / this.chunkSize);
    const startChunkY = Math.floor((camera.position.y - padding) / this.chunkSize);
    const endChunkY = Math.floor((camera.position.y + camera.height + padding) / this.chunkSize);

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY += 1) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX += 1) {
        for (const decoration of this.getChunkDecorations(chunkX, chunkY)) {
          const screenX = decoration.x - camera.position.x;
          const screenY = decoration.y - camera.position.y;

          if (
            screenX < -padding ||
            screenX > camera.width + padding ||
            screenY < -padding ||
            screenY > camera.height + padding
          ) {
            continue;
          }

          this.drawDecoration(ctx, decoration, screenX, screenY);
        }
      }
    }
  }

  drawDecoration(ctx, decoration, x, y) {
    if (
      this.usesEverRogueTiles() &&
      this.tileset.drawDecoration(ctx, decoration.type, decoration.variant, x, y, decoration.scale)
    ) {
      return;
    }

    const scale = decoration.scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (decoration.type === "rock") {
      drawRock(ctx, decoration.variant);
    } else if (decoration.type === "bone") {
      drawBone(ctx, decoration.variant);
    } else if (decoration.type === "grassPatch") {
      drawGrassPatch(ctx, decoration.variant);
    } else if (decoration.type === "candle") {
      drawCandle(ctx, decoration.variant);
    } else if (decoration.type === "ruin") {
      drawRuin(ctx, decoration.variant);
    }

    ctx.restore();
  }

  drawEdgeFade(ctx, camera) {
    const bounds = this.bounds;
    const fadeSize = this.config.edgeFadeSize ?? 420;
    const playerWorldX = camera.position.x + camera.width / 2;
    const playerWorldY = camera.position.y + camera.height / 2;

    const leftDist = playerWorldX - bounds.minX;
    const rightDist = bounds.maxX - playerWorldX;
    const topDist = playerWorldY - bounds.minY;
    const bottomDist = bounds.maxY - playerWorldY;
    const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

    if (minDist >= fadeSize) {
      return;
    }

    const alpha = (1 - minDist / fadeSize) * 0.28;
    ctx.fillStyle = `rgba(8, 10, 14, ${alpha})`;
    ctx.fillRect(0, 0, camera.width, camera.height);
  }
}

function drawRock(ctx, variant) {
  const shade = variant % 2 === 0 ? "#5f666f" : "#545b64";
  ctx.fillStyle = "rgba(10, 12, 16, 0.25)";
  ctx.beginPath();
  ctx.ellipse(2, 10, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-8, -10);
  ctx.lineTo(6, -12);
  ctx.lineTo(16, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.fill();
}

function drawBone(ctx, variant) {
  ctx.strokeStyle = "#d8cbb8";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-14, variant % 2 === 0 ? 4 : -2);
  ctx.lineTo(14, variant % 2 === 0 ? -4 : 2);
  ctx.stroke();

  ctx.fillStyle = "#ece2d0";
  ctx.beginPath();
  ctx.arc(-14, variant % 2 === 0 ? 4 : -2, 5, 0, Math.PI * 2);
  ctx.arc(14, variant % 2 === 0 ? -4 : 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrassPatch(ctx, variant) {
  const count = 4 + (variant % 3);

  for (let i = 0; i < count; i += 1) {
    const x = -10 + i * 5;
    const height = 10 + ((variant + i) % 4) * 2;
    ctx.strokeStyle = i % 2 === 0 ? "#56784f" : "#6a8d61";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.quadraticCurveTo(x + (i % 2 === 0 ? 2 : -2), -height / 2, x + (i % 2), -height);
    ctx.stroke();
  }
}

function drawCandle(ctx, variant) {
  ctx.fillStyle = "rgba(10, 12, 16, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c8b090";
  ctx.fillRect(-3, -2, 6, 14);

  ctx.fillStyle = variant % 2 === 0 ? "#ffd27e" : "#ffb86a";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.quadraticCurveTo(4, -14, 0, -18);
  ctx.quadraticCurveTo(-4, -14, 0, -8);
  ctx.fill();
}

function drawRuin(ctx, variant) {
  ctx.fillStyle = "#4f555e";
  ctx.fillRect(-16, 0, 10, 12);
  ctx.fillRect(-2, -4, 14, 16);
  ctx.fillStyle = "#686f78";
  ctx.fillRect(10, 4, 8, 8);

  ctx.strokeStyle = "rgba(18, 20, 24, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(18, -4);
  ctx.stroke();
}
