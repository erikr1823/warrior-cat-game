import { GameConfig } from "../config/GameConfig.js";
import { getPickupSprite } from "../assets/SpriteCache.js";

export class Chest {
  constructor(x, y) {
    this.position = { x, y };
    this.radius = GameConfig.chests.pickupRadius;
    this.renderSize = GameConfig.chests.renderSize;
    this.isDead = false;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.spriteSourceSize = GameConfig.sprites.sourceSize;
    this.animTime = Math.random() * 2;
  }

  getCurrentSprite() {
    const frameIndex = Math.floor(this.animTime * 3) % 2;
    return getPickupSprite("chest", null, frameIndex);
  }

  update(deltaTime) {
    this.bobPhase += deltaTime * GameConfig.chests.bobSpeed;
    this.animTime += deltaTime;
  }
}
