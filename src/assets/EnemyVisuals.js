import { GameConfig } from "../config/GameConfig.js";
import {
  getEnemyArtPack,
  getEnemySheetMeta,
  getEnemySheetPath,
  getEnemySpritePath,
} from "../config/EnemyArtDefinitions.js";
import { getEnemyFrames as getProceduralEnemyFrames } from "./ProceduralSprites.js";

const imageCache = new Map();
const frameCache = new Map();

function cacheKey(packId, enemyType) {
  return `${packId}:${enemyType}`;
}

function loadImage(src) {
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }

  const image = new Image();
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

function buildSheetSet(packId, sheet, meta) {
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

function resolveImageSet(enemyType, packId) {
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
  for (const packId of ["pixelCrawler", "tinyMonsters", "darkFantasy", "cursedSpirits"]) {
    for (const enemyType of ["slime", "bat", "brute", "crawler", "elite", "boss"]) {
      loadImage(getEnemySheetPath(packId, enemyType));
      loadImage(getEnemySpritePath(packId, enemyType));
    }
  }
}

export function getEnemyVisualSet(enemyType, packId = "ink") {
  const key = cacheKey(packId, enemyType);
  const cached = frameCache.get(key);

  if (cached && !isProceduralSet(cached)) {
    return cached;
  }

  const resolved = resolveImageSet(enemyType, packId);
  frameCache.set(key, resolved);
  return resolved;
}

export function getEnemyRenderSize(enemyType, packId) {
  const config = GameConfig.enemies[enemyType] ?? GameConfig.enemies.slime;

  if (packId === "ink") {
    return config.renderSize;
  }

  const pack = getEnemyArtPack(packId);
  const visualSet = getEnemyVisualSet(enemyType, packId);

  return Math.round(visualSet.sourceSize * pack.renderScale);
}

export function refreshEnemyVisualCache() {
  frameCache.clear();
}
