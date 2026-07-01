import { GameConfig } from "../config/GameConfig.js";
import {
  ENEMY_TYPES,
  IMPORTED_ENEMY_SHEETS,
  getEnemyArtPack,
  getImportedEnemySheet,
  getEnemySheetMeta,
  getEnemySheetPath,
  getEnemySpritePath,
} from "../config/EnemyArtDefinitions.js";
import { getTinyMonsterDefinition, getAllTinyMonsterIds } from "../config/TinyMonsterDefinitions.js";
import { getEnemyFrames as getProceduralEnemyFrames } from "./ProceduralSprites.js";

const imageCache = new Map();
const frameCache = new Map();

function cacheKey(packId, enemyType) {
  return `${packId}:${enemyType}`;
}

const SLIME_ART_PACK = "tinyMonsters";

function getArtPackForEnemy(enemyType, worldPackId) {
  if (enemyType === "slime" || getTinyMonsterDefinition(enemyType)) {
    return SLIME_ART_PACK;
  }

  return worldPackId;
}

function loadImage(src, onReady) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const image = new Image();
  image.onload = () => {
    if (onReady) {
      onReady();
    }
  };
  image.src = src;
  imageCache.set(src, image);
  return image;
}

function imageReady(image) {
  return Boolean(image?.complete && image.naturalWidth > 0);
}

function tintCanvas(source, tintColor) {
  if (!tintColor) {
    return source;
  }

  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = tintColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(source, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  return canvas;
}

function buildProceduralSet(enemyType, packId) {
  const procedural = getProceduralEnemyFrames(enemyType);
  const pack = getEnemyArtPack(packId);

  if (!pack.proceduralTint) {
    return {
      frameCount: procedural.frameCount,
      sourceSize: procedural.frames[0]?.width ?? GameConfig.sprites.sourceSize,
      usesSheet: false,
      frames: procedural.frames,
    };
  }

  return {
    frameCount: procedural.frameCount,
    sourceSize: procedural.frames[0]?.width ?? GameConfig.sprites.sourceSize,
    usesSheet: false,
    frames: procedural.frames.map((frame) => tintCanvas(frame, pack.proceduralTint)),
  };
}

function buildImageSet(enemyType, packId, image) {
  const pack = getEnemyArtPack(packId);
  const sourceSize = Math.max(image.naturalWidth, image.naturalHeight, pack.sourceSize);

  return {
    frameCount: 2,
    sourceSize,
    usesSheet: false,
    frames: [image, image],
  };
}

// Builds a 4-direction walk cycle from a single 32×32 tiny monster PNG.
// Each direction gets bob/squash frames like the imported zombie sheets; left uses flip.
const TINY_WALK_FRAME_COUNT = 4;
const TINY_WALK_BOB = [0, 1, 0, -0.5];
const TINY_WALK_SQUASH = [1, 0.96, 1, 1.03];

function buildWalkFrameCanvases(image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const frames = [];

  for (let index = 0; index < TINY_WALK_FRAME_COUNT; index += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    const bob = TINY_WALK_BOB[index];
    const scaleY = TINY_WALK_SQUASH[index];

    ctx.save();
    ctx.translate(width / 2, height);
    ctx.scale(1, scaleY);
    ctx.drawImage(image, -width / 2, -height + bob, width, height);
    ctx.restore();

    frames.push({
      image: canvas,
      sx: 0,
      sy: 0,
      sw: width,
      sh: height,
    });
  }

  return frames;
}

function buildTinyMonsterWalkSet(image) {
  const walkFrames = buildWalkFrameCanvases(image);
  const directions = {};
  const facings = ["down", "right", "up", "left"];

  for (const facing of facings) {
    directions[facing] = walkFrames.map((frame) => ({
      ...frame,
      flipHorizontal: facing === "left",
    }));
  }

  return {
    frameCount: TINY_WALK_FRAME_COUNT,
    sourceSize: Math.max(image.naturalWidth, image.naturalHeight),
    usesSheet: true,
    directional: true,
    walkFps: 9,
    idleFps: 2.5,
    directions,
    frames: directions.down,
  };
}

function buildSheetSet(packId, sheet, meta) {
  if (meta.directionRows) {
    return buildDirectionalSheetSet(packId, sheet, meta);
  }

  const pack = getEnemyArtPack(packId);
  const frameWidth = meta.frameWidth ?? pack.sourceSize;
  const frameHeight = meta.frameHeight ?? pack.sourceSize;
  const frameCount = meta.frameCount ?? meta.frames ?? 2;
  const row = meta.row ?? 0;

  const frames = [];

  for (let index = 0; index < frameCount; index += 1) {
    frames.push({
      image: sheet,
      sx: index * frameWidth,
      sy: row * frameHeight,
      sw: frameWidth,
      sh: frameHeight,
    });
  }

  return {
    frameCount,
    sourceSize: Math.max(frameWidth, frameHeight),
    usesSheet: true,
    frames,
  };
}

function buildDirectionalSheetSet(packId, sheet, meta) {
  const pack = getEnemyArtPack(packId);
  const frameWidth = meta.frameWidth ?? pack.sourceSize;
  const frameHeight = meta.frameHeight ?? pack.sourceSize;
  const directions = {};
  let maxFrameCount = 1;

  for (const [facing, row] of Object.entries(meta.directionRows)) {
    const frameCount = meta.directionFrameCounts?.[facing] ?? meta.frameCount ?? 4;
    const frames = [];

    for (let index = 0; index < frameCount; index += 1) {
      frames.push({
        image: sheet,
        sx: index * frameWidth,
        sy: row * frameHeight,
        sw: frameWidth,
        sh: frameHeight,
        flipHorizontal: meta.flipDirections?.[facing] ?? false,
      });
    }

    directions[facing] = frames;
    maxFrameCount = Math.max(maxFrameCount, frameCount);
  }

  return {
    frameCount: maxFrameCount,
    sourceSize: Math.max(frameWidth, frameHeight),
    usesSheet: true,
    directional: true,
    directions,
    frames: directions.down ?? directions[Object.keys(directions)[0]],
  };
}

function resolveImageSet(enemyType, packId) {
  const tiny = getTinyMonsterDefinition(enemyType);

  if (tiny) {
    const image = loadImage(tiny.spritePath, refreshEnemyVisualCache);

    if (imageReady(image)) {
      return buildTinyMonsterWalkSet(image);
    }
  }

  const imported = getImportedEnemySheet(enemyType);

  if (imported) {
    const sheet = loadImage(imported.path, refreshEnemyVisualCache);

    if (imageReady(sheet)) {
      return buildSheetSet(packId, sheet, imported);
    }
  }

  const sheetMeta = getEnemySheetMeta(packId, enemyType);
  const sheetSrc = getEnemySheetPath(packId, enemyType);
  const sheet = loadImage(sheetSrc);

  if (sheetMeta && imageReady(sheet)) {
    return buildSheetSet(packId, sheet, sheetMeta);
  }

  const src = getEnemySpritePath(packId, enemyType);
  const image = loadImage(src);

  if (imageReady(image)) {
    if (sheetMeta) {
      return buildSheetSet(packId, image, sheetMeta);
    }

    return buildImageSet(enemyType, packId, image);
  }

  return buildProceduralSet(enemyType, packId);
}

function isProceduralSet(visualSet) {
  return visualSet?.usesSheet === false && visualSet?.frames?.[0] instanceof HTMLCanvasElement;
}

export function preloadEnemyArt() {
  for (const id of getAllTinyMonsterIds()) {
    const tiny = getTinyMonsterDefinition(id);

    if (tiny?.spritePath) {
      loadImage(tiny.spritePath, refreshEnemyVisualCache);
    }
  }

  for (const imported of Object.values(IMPORTED_ENEMY_SHEETS)) {
    loadImage(imported.path, refreshEnemyVisualCache);
  }

  for (const packId of ["pixelCrawler", "tinyMonsters", "darkFantasy", "cursedSpirits"]) {
    for (const enemyType of ENEMY_TYPES) {
      loadImage(getEnemySheetPath(packId, enemyType));
      loadImage(getEnemySpritePath(packId, enemyType));
    }
  }
}

export function getEnemyVisualSet(enemyType, packId = "ink") {
  const artPack = getArtPackForEnemy(enemyType, packId);
  const key = cacheKey(artPack, enemyType);
  const cached = frameCache.get(key);

  if (cached && !isProceduralSet(cached)) {
    return cached;
  }

  const resolved = resolveImageSet(enemyType, artPack);
  frameCache.set(key, resolved);
  return resolved;
}

export function getEnemyRenderSize(enemyType, packId) {
  const tiny = getTinyMonsterDefinition(enemyType);

  if (tiny) {
    return tiny.renderSize;
  }

  const imported = getImportedEnemySheet(enemyType);

  if (imported) {
    return Math.round(imported.sourceSize * imported.renderScale);
  }

  const artPack = getArtPackForEnemy(enemyType, packId);
  const config = GameConfig.enemies[enemyType] ?? GameConfig.enemies.slime;

  if (artPack === "ink") {
    return config.renderSize;
  }

  const pack = getEnemyArtPack(artPack);
  const visualSet = getEnemyVisualSet(enemyType, packId);

  return Math.round(visualSet.sourceSize * pack.renderScale);
}

export function refreshEnemyVisualCache() {
  frameCache.clear();
}
