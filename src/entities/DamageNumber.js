import { GameConfig } from "../config/GameConfig.js";

export class DamageNumber {
  constructor(x, y, amount) {
    const config = GameConfig.feedback;

    this.position = { x, y };
    this.radius = 0;
    this.amount = amount;
    this.life = config.damageNumberLife;
    this.maxLife = this.life;
    this.velocity = {
      x: Math.random() * config.damageNumberHorizontalJitter - config.damageNumberHorizontalJitter / 2,
      y: config.damageNumberVelocityY,
    };
    this.isDead = false;
  }

  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.y += GameConfig.feedback.damageNumberGravity * deltaTime;
    this.life -= deltaTime;

    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  getAlpha() {
    return Math.max(0, this.life / this.maxLife);
  }
}
