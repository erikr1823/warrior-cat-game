import { GameConfig } from "../config/GameConfig.js";
import { getSpriteCache } from "./ProceduralSprites.js";

function resolveSpriteSetKey(spriteSetKey) {
  const fallback =
    GameConfig.player.defaultSpriteSet ?? GameConfig.player.activeSpriteSet ?? "puzas";
  const key = spriteSetKey ?? fallback;

  if (GameConfig.player.spriteSets?.[key]) {
    return key;
  }

  return fallback;
}

function loadSheetSpriteSet(spriteSetKey, spriteConfig, procedural) {
  const sheet = new Image();
  sheet.src = spriteConfig.sheet;

  const preview = new Image();
  if (spriteConfig.preview) {
    preview.src = spriteConfig.preview;
  }

  function sheetReady() {
    return Boolean(sheet.complete && sheet.naturalWidth > 0);
  }

  function getFrameRect(facing, frameIndex = 0) {
    const row = spriteConfig.directionRows[facing] ?? spriteConfig.directionRows.down;
    const col = frameIndex % spriteConfig.framesPerDirection;

    return {
      image: sheet,
      sx: col * spriteConfig.frameWidth,
      sy: row * spriteConfig.frameHeight,
      sw: spriteConfig.frameWidth,
      sh: spriteConfig.frameHeight,
    };
  }

  return {
    key: spriteSetKey,
    name: spriteConfig.name,
    frameCount: spriteConfig.framesPerDirection,
    frameWidth: spriteConfig.frameWidth,
    frameHeight: spriteConfig.frameHeight,
    preview,
    usesImages() {
      return sheetReady();
    },
    getSprite(facing, frameIndex = 0) {
      if (sheetReady()) {
        return getFrameRect(facing, frameIndex);
      }

      const frames = procedural[facing] ?? procedural.down;
      return frames[frameIndex % frames.length];
    },
  };
}

function loadDirectionSpriteSet(spriteSetKey, spriteConfig, procedural) {
  const images = {};

  for (const [direction, source] of Object.entries(spriteConfig.directions)) {
    const image = new Image();
    image.src = source;
    images[direction] = image;
  }

  function getImage(facing) {
    return images[facing] ?? images.down;
  }

  function hasLoadedImage(facing) {
    const image = getImage(facing);
    return Boolean(image?.complete && image.naturalWidth > 0);
  }

  return {
    key: spriteSetKey,
    name: spriteConfig.name,
    frameCount: procedural.frameCount,
    frameWidth: spriteConfig.sourceWidth ?? spriteConfig.frameWidth ?? 48,
    frameHeight: spriteConfig.sourceHeight ?? spriteConfig.frameHeight ?? 72,
    usesImages() {
      return hasLoadedImage("down");
    },
    getSprite(facing, frameIndex = 0) {
      if (hasLoadedImage(facing)) {
        return getImage(facing);
      }

      const frames = procedural[facing] ?? procedural.down;
      return frames[frameIndex % frames.length];
    },
  };
}

export function loadPlayerSpriteSet(spriteSetKey) {
  const resolvedKey = resolveSpriteSetKey(spriteSetKey);
  const spriteConfig = GameConfig.player.spriteSets[resolvedKey];
  const procedural = getSpriteCache().player;

  if (!spriteConfig) {
    throw new Error(`Missing player sprite set: ${resolvedKey}`);
  }

  if (spriteConfig.sheet) {
    return loadSheetSpriteSet(resolvedKey, spriteConfig, procedural);
  }

  if (spriteConfig.directions) {
    return loadDirectionSpriteSet(resolvedKey, spriteConfig, procedural);
  }

  throw new Error(`Sprite set "${resolvedKey}" has no sheet or directions config`);
}
