export class Projectile {
  constructor(x, y, direction, overrides = {}) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.direction = { x: 0, y: 1 };
    this.hitEnemies = new Set();
    this.reset(x, y, direction, overrides);
  }

  reset(x, y, direction, overrides = {}) {
    const speed = overrides.speed ?? 860;

    this.position.x = x;
    this.position.y = y;
    this.velocity.x = direction.x * speed;
    this.velocity.y = direction.y * speed;
    this.direction = direction;
    this.speed = speed;
    this.damage = overrides.damage ?? 18;
    this.collisionRadius = overrides.radius ?? 12;
    this.radius = this.collisionRadius;
    this.renderRadius = overrides.radius ?? 12;
    this.maxDistance = overrides.maxDistance ?? 1300;
    this.pierce = overrides.pierce ?? 0;
    this.distanceTraveled = 0;
    this.isDead = false;
    this.visualStyle = overrides.visualStyle ?? "arcane";
    this.hitEnemies.clear();
  }

  update(deltaTime) {
    const distance = this.speed * deltaTime;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.distanceTraveled += distance;

    if (this.distanceTraveled >= this.maxDistance) {
      this.isDead = true;
    }
  }
}
