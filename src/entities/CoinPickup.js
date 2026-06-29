import { distanceBetween, directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";

export class CoinPickup {
  constructor(x, y, amount = 1) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.amount = amount;
    this.radius = GameConfig.coins.pickupRadius;
    this.isDead = false;
    this.isMagnetized = false;
    this.bobPhase = Math.random() * Math.PI * 2;
  }

  update(deltaTime, player, game) {
    this.bobPhase += deltaTime * 4.2;
    const distance = distanceBetween(this.position, player.position);

    if (distance <= player.magnetRadius) {
      this.isMagnetized = true;
    }

    if (this.isMagnetized) {
      const direction = directionBetween(this.position, player.position);
      this.velocity.x = direction.x * GameConfig.coins.magnetSpeed;
      this.velocity.y = direction.y * GameConfig.coins.magnetSpeed;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    }

    if (distance <= player.pickupRadius) {
      game.coins += this.amount;
      this.isDead = true;
    }
  }
}
