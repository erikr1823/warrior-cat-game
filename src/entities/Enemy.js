import { directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { getEnemyVisualSet, getEnemyRenderSize } from "../assets/EnemyVisuals.js";

export class Enemy {
  constructor(x, y, type = "slime", modifiers = {}) {
    const config = GameConfig.enemies[type] ?? GameConfig.enemies.slime;
    const healthMultiplier = modifiers.healthMultiplier ?? 1;
    const speedMultiplier = modifiers.speedMultiplier ?? 1;
    const enemyPack = modifiers.enemyPack ?? "ink";

    this.type = type;
    this.enemyPack = enemyPack;
    this.worldId = modifiers.worldId ?? "unwritten";
    this.name = config.name;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.maxHealth = Math.round(config.maxHealth * healthMultiplier);
    this.health = this.maxHealth;
    this.speed = config.speed * speedMultiplier;
    this.damage = config.damage;
    this.renderSize = getEnemyRenderSize(type, enemyPack);
    this.collisionRadius = config.collisionRadius;
    this.radius = this.collisionRadius;
    this.animTime = Math.random() * 2;
    this.isDead = false;
    this.hitFlashTime = 0;
    this.knockbackVelocity = { x: 0, y: 0 };
    this.isElite = type === "elite";
    this.isBoss = type === "boss";
    this.bossIndex = modifiers.bossIndex ?? 1;
  }

  getCurrentSprite() {
    const spriteSet = getEnemyVisualSet(this.type, this.enemyPack);
    const frameIndex = Math.floor(this.animTime * 6) % spriteSet.frameCount;
    return spriteSet.frames[frameIndex];
  }

  update(deltaTime, player) {
    const direction = directionBetween(this.position, player.position);

    this.velocity.x = direction.x * this.speed + this.knockbackVelocity.x;
    this.velocity.y = direction.y * this.speed + this.knockbackVelocity.y;
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.knockbackVelocity.x *= Math.max(0, 1 - GameConfig.enemies.knockbackFriction * deltaTime);
    this.knockbackVelocity.y *= Math.max(0, 1 - GameConfig.enemies.knockbackFriction * deltaTime);
    this.hitFlashTime = Math.max(0, this.hitFlashTime - deltaTime);
    this.animTime += deltaTime;
  }

  takeDamage(amount, direction) {
    this.health -= amount;
    this.hitFlashTime = GameConfig.enemies.hitFlashTime;
    this.applyKnockback(direction, GameConfig.enemies.knockbackForce);

    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  applyKnockback(direction, force) {
    this.knockbackVelocity.x += direction.x * force;
    this.knockbackVelocity.y += direction.y * force;
  }
}
