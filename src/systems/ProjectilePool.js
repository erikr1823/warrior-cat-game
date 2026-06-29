import { Projectile } from "../entities/Projectile.js";

export class ProjectilePool {
  constructor(initialSize = 48) {
    this.pool = [];

    for (let i = 0; i < initialSize; i += 1) {
      this.pool.push(new Projectile(0, 0, { x: 0, y: 1 }));
    }
  }

  acquire(x, y, direction, overrides = {}) {
    const projectile = this.pool.pop() ?? new Projectile(x, y, direction, overrides);
    projectile.reset(x, y, direction, overrides);
    return projectile;
  }

  release(projectile) {
    if (this.pool.length < 256) {
      this.pool.push(projectile);
    }
  }

  clear() {
    this.pool.length = 0;
  }
}
