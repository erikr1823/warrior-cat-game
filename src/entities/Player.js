import { normalizeVector } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { loadPlayerSpriteSet } from "../assets/PlayerSprites.js";

export class Player {
  constructor(x, y, characterId) {
    const config = GameConfig.player;
    const resolvedCharacterId =
      characterId ??
      config.defaultSpriteSet ??
      config.activeSpriteSet ??
      "puzas";
    const spriteConfig =
      GameConfig.player.spriteSets[resolvedCharacterId] ??
      GameConfig.player.spriteSets.puzas;

    this.characterId = resolvedCharacterId;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.speed = config.speed;
    this.spriteSet = loadPlayerSpriteSet(resolvedCharacterId);
    this.facing = "down";
    this.isMoving = false;
    this.animTime = 0;
    this.animFrame = 1;
    this.renderWidth = spriteConfig.frameWidth * 2;
    this.renderHeight = spriteConfig.frameHeight * 2;
    this.collisionRadius = config.collisionRadius;
    this.radius = this.collisionRadius;
    this.bumpTime = 0;
    this.maxHealth = config.maxHealth;
    this.health = this.maxHealth;
    this.level = config.level;
    this.xp = config.xp;
    this.xpToNextLevel = getXPRequirement(this.level);
    this.pickupRadius = config.pickupRadius;
    this.magnetRadius = config.magnetRadius;
    this.invincibilityTime = 0;
    this.invincibilityDuration = config.invincibilityDuration;
    this.isDead = false;
  }

  update(deltaTime, input) {
    const movement = normalizeVector(input.getMovementVector());
    this.velocity.x = movement.x * this.speed;
    this.velocity.y = movement.y * this.speed;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.bumpTime = Math.max(0, this.bumpTime - deltaTime);
    this.invincibilityTime = Math.max(0, this.invincibilityTime - deltaTime);
    this.isMoving = movement.x !== 0 || movement.y !== 0;

    if (this.isMoving) {
      this.updateFacing(movement);
      this.animTime += deltaTime;
      this.animFrame = Math.floor(this.animTime * 9) % this.spriteSet.frameCount;
    } else {
      this.animTime = 0;
      this.animFrame = 1;
    }
  }

  updateFacing(movement) {
    if (Math.abs(movement.x) > Math.abs(movement.y)) {
      this.facing = movement.x > 0 ? "right" : "left";
    } else {
      this.facing = movement.y > 0 ? "down" : "up";
    }
  }

  getCurrentSprite() {
    return this.spriteSet.getSprite(this.facing, this.animFrame);
  }

  registerBump(enemyPosition) {
    const away = normalizeVector({
      x: this.position.x - enemyPosition.x,
      y: this.position.y - enemyPosition.y,
    });

    this.position.x += away.x * GameConfig.player.bumpDistance;
    this.position.y += away.y * GameConfig.player.bumpDistance;
    this.bumpTime = GameConfig.player.bumpTime;
  }

  takeDamage(amount, enemyPosition) {
    if (this.invincibilityTime > 0 || this.isDead) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.invincibilityTime = this.invincibilityDuration;
    this.registerBump(enemyPosition);

    if (this.health <= 0) {
      this.isDead = true;
    }

    return true;
  }

  isInvincible() {
    return this.invincibilityTime > 0;
  }

  addXP(amount, game = null) {
    const multiplier = game?.runModifiers?.xpMultiplier ?? 1;
    this.xp += Math.max(1, Math.floor(amount * multiplier));
  }

  getXPProgress() {
    return this.xp / this.xpToNextLevel;
  }

  canLevelUp() {
    return this.xp >= this.xpToNextLevel;
  }

  levelUpOnce() {
    this.xp -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = getXPRequirement(this.level);
  }
}

export function getXPRequirement(level) {
  return Math.floor(GameConfig.player.xpBaseRequirement * GameConfig.player.xpGrowth ** (level - 1));
}
