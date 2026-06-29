export class SpatialGrid {
  constructor(cellSize = 256) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.queryScratch = [];
  }

  clear() {
    this.cells.clear();
  }

  insert(entity) {
    const cellX = Math.floor(entity.position.x / this.cellSize);
    const cellY = Math.floor(entity.position.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    let bucket = this.cells.get(key);

    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }

    bucket.push(entity);
  }

  query(position, radius, out = this.queryScratch) {
    out.length = 0;

    const minCellX = Math.floor((position.x - radius) / this.cellSize);
    const maxCellX = Math.floor((position.x + radius) / this.cellSize);
    const minCellY = Math.floor((position.y - radius) / this.cellSize);
    const maxCellY = Math.floor((position.y + radius) / this.cellSize);

    for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
        const bucket = this.cells.get(`${cellX},${cellY}`);

        if (!bucket) {
          continue;
        }

        for (const entity of bucket) {
          out.push(entity);
        }
      }
    }

    return out;
  }
}
