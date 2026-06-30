import { directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { getEnemyVisualSet, getEnemyRenderSize } from "../assets/EnemyVisuals.js";
import { updateEnemyModifier } from "../config/EnemyModifiers.js";

export class Enemy {
  constructor(x, y, type = "slime", modifiers = {}) {
    const config = GameConfig.enemies[type] ?? GameConfig.enemies.slime;
    const healthMultiplier = modifiers.healthMultiplier ?? 1;
    const speedMultiplier = modifiers.speedMultiplier ?? 1;
    const enemyPack = modifiers.enemyPack ?? "ink";
    const visualType = config.visualType ?? type;

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
    this.renderSize = config.renderSize ?? getEnemyRenderSize(visualType, enemyPack);
    this.collisionRadius = config.collisionRadius;
    this.radius = this.collisionRadius;
    this.animTime = Math.random() * 2;
    this.isDead = false;
    this.hitFlashTime = 0;
    this.knockbackVelocity = { x: 0, y: 0 };
    this.isElite = type === "elite";
    this.isBoss = Boolean(modifiers.isBoss ?? config.isBoss);
    this.bossIndex = modifiers.bossIndex ?? 1;
    this.spriteSet = getEnemyVisualSet(visualType, enemyPack);
    this.facing = "down";

    // Elite behavior modifier state (assigned by Spawner via applyEnemyModifier).
    this.modifier = null;
    this.isEliteModified = false;
    this.modifierColor = null;
    this.modifierState = null;
    this.damageTakenMultiplier = 1;
    this.isSplitChild = false;
    this.staticMark = 0;

    // Optional behavior function (deltaTime-driven). Used by bosses for
    // telegraphed attack patterns. Returns true if it set velocity itself.
    this.controller = null;
  }

  getCurrentSprite() {
    const spriteSet = this.spriteSet;

    if (spriteSet.directional) {
      const directionFrames = spriteSet.directions[this.facing] ?? spriteSet.directions.down;
      const frameIndex = Math.floor(this.animTime * 8) % directionFrames.length;
      return directionFrames[frameIndex];
    }

    const frameIndex = Math.floor(this.animTime * 6) % spriteSet.frameCount;
    return spriteSet.frames[frameIndex];
  }

  update(deltaTime, player, game = null) {
    let handledMovement = false;

    if (this.modifier && game) {
      handledMovement = updateEnemyModifier(this, deltaTime, player, game);
    }

    if (!handledMovement && this.controller && game) {
      handledMovement = this.controller(this, deltaTime, player, game);
    }

    if (handledMovement) {
      this.velocity.x += this.knockbackVelocity.x;
      this.velocity.y += this.knockbackVelocity.y;
    } else {
      const direction = directionBetween(this.position, player.position);
      this.velocity.x = direction.x * this.speed + this.knockbackVelocity.x;
      this.velocity.y = direction.y * this.speed + this.knockbackVelocity.y;

      if (Math.abs(direction.x) > 0.05 || Math.abs(direction.y) > 0.05) {
        this.updateFacing(direction);
      }
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.knockbackVelocity.x *= Math.max(0, 1 - GameConfig.enemies.knockbackFriction * deltaTime);
    this.knockbackVelocity.y *= Math.max(0, 1 - GameConfig.enemies.knockbackFriction * deltaTime);
    this.hitFlashTime = Math.max(0, this.hitFlashTime - deltaTime);
    this.animTime += deltaTime;

    if (this.staticMark > 0) {
      this.staticMark = Math.max(0, this.staticMark - deltaTime);
    }
  }

  updateFacing(movement) {
    if (Math.abs(movement.x) > Math.abs(movement.y)) {
      this.facing = movement.x > 0 ? "right" : "left";
      return;
    }

    this.facing = movement.y > 0 ? "down" : "up";
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
