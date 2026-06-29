import { hashTile, mulberry32 } from "./WorldTiles.js";

/** Reserved for future prop imports. Floors use procedural palettes only. */
export async function loadImportedManifest() {
  return { tilesets: {}, props: {}, enemies: {}, ui: {} };
}

export class ImportedAssets {
  constructor() {
    this.ready = true;
  }

  async load() {
    await loadImportedManifest();
  }

  drawFloorTile() {
    return false;
  }

  drawProp() {
    return false;
  }
}

export function getImportedManifest() {
  return null;
}

export function getImportedEnemyPath() {
  return null;
}

export { hashTile, mulberry32 };
