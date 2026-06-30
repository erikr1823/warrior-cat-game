import { distanceBetween, directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";

export class XPGem {
  constructor(x, y, tier = "small") {
    const config = GameConfig.xpGems[tier] ?? GameConfig.xpGems.small;

    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.radius = config.radius;
    this.value = config.value;
    this.tier = tier;
    this.color = config.color;
    this.isDead = false;
    this.isMagnetized = false;
    this.animTime = Math.random() * 2;
  }

  update(deltaTime, player, game) {
    this.animTime += deltaTime * 5;
    const distance = distanceBetween(this.position, player.position);

    if (distance <= player.magnetRadius) {
      this.isMagnetized = true;
    }

    if (this.isMagnetized) {
      const direction = directionBetween(this.position, player.position);
      this.velocity.x = direction.x * GameConfig.xpGems.magnetSpeed;
      this.velocity.y = direction.y * GameConfig.xpGems.magnetSpeed;
      this.position.x += this.velocity.x * deltaTime;
      this.position.y += this.velocity.y * deltaTime;
    }

    if (distance <= player.pickupRadius) {
      player.addXP(this.value, game);
      game.feedback.onXPCollect(this.position.x, this.position.y, this.tier);
      game.synergySystem?.onXPCollected();
      this.isDead = true;
    }
  }
}
