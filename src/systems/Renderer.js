import { clamp } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { getEffectSprite, getPickupSprite, getProjectileSprite } from "../assets/SpriteCache.js";
import { getEnemyVisualSet } from "../assets/EnemyVisuals.js";

const SOURCE_SIZE = GameConfig.sprites.sourceSize;

export class Renderer {
  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  setShake(screenShake) {
    const ctx = this.context;
    const progress = screenShake.duration > 0 ? screenShake.time / screenShake.duration : 0;
    const amount = screenShake.amount * progress;
    const x = (Math.random() * 2 - 1) * amount;
    const y = (Math.random() * 2 - 1) * amount;

    ctx.save();
    ctx.translate(x, y);
  }

  resetTransform() {
    this.context.restore();
  }

  drawBackground(camera, worldMap) {
    const ctx = this.context;

    worldMap.draw(ctx, camera);
    this.drawAmbientVignette(ctx);
  }

  drawAmbientVignette(ctx) {
    const vignette = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.height * 0.18,
      this.width / 2,
      this.height / 2,
      this.height * 0.82,
    );
    vignette.addColorStop(0, "rgba(8, 10, 14, 0)");
    vignette.addColorStop(1, "rgba(8, 10, 14, 0.28)");

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawPlayer(player, camera) {
    const screenPosition = camera.worldToScreen(player.position);
    const sprite = player.getCurrentSprite();
    const width = player.renderWidth;
    const height = player.renderHeight;
    const halfWidth = width / 2;
    const footOffset = player.collisionRadius * 0.75;

    if (player.bumpTime > 0) {
      this.context.save();
      this.context.fillStyle = "rgba(255, 116, 95, 0.18)";
      this.context.beginPath();
      this.context.arc(screenPosition.x, screenPosition.y, player.collisionRadius + 18, 0, Math.PI * 2);
      this.context.fill();
      this.context.restore();
    }

    const shouldFlash = player.isInvincible() && Math.floor(player.invincibilityTime * 18) % 2 === 0;

    if (!shouldFlash) {
      this.context.save();
      this.context.imageSmoothingEnabled = false;

      const drawX = screenPosition.x - halfWidth;
      const drawY = screenPosition.y - height + footOffset;

      if (sprite.image && Number.isFinite(sprite.sx)) {
        this.context.drawImage(
          sprite.image,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          drawX,
          drawY,
          width,
          height,
        );
      } else {
        this.context.drawImage(sprite, drawX, drawY, width, height);
      }
      this.context.restore();
    }

    this.drawHealthBar({
      x: screenPosition.x - 52,
      y: screenPosition.y - height + footOffset - 22,
      width: 104,
      height: 10,
      current: player.health,
      max: player.maxHealth,
      fill: "#59d36f",
    });
  }

  drawEnemies(enemies, camera) {
    const margin = 120;

    for (const enemy of enemies) {
      const screenPosition = camera.worldToScreen(enemy.position);

      if (
        screenPosition.x < -margin ||
        screenPosition.x > camera.width + margin ||
        screenPosition.y < -margin ||
        screenPosition.y > camera.height + margin
      ) {
        continue;
      }

      const size = enemy.renderSize;
      const halfSize = size / 2;
      const sprite = enemy.getCurrentSprite();

      this.context.save();
      this.context.imageSmoothingEnabled = false;

      if (sprite?.image) {
        this.context.drawImage(
          sprite.image,
          sprite.sx,
          sprite.sy,
          sprite.sw,
          sprite.sh,
          screenPosition.x - halfSize,
          screenPosition.y - halfSize,
          size,
          size,
        );
      } else {
        const sourceSize = getEnemyVisualSet(enemy.type, enemy.enemyPack)?.sourceSize ?? size;
        this.context.drawImage(
          sprite,
          0,
          0,
          sourceSize,
          sourceSize,
          screenPosition.x - halfSize,
          screenPosition.y - halfSize,
          size,
          size,
        );
      }

      this.context.restore();

      if (!enemy.isBoss) {
        this.drawHealthBar({
          x: screenPosition.x - 38,
          y: screenPosition.y - halfSize - 18,
          width: 76,
          height: 7,
          current: enemy.health,
          max: enemy.maxHealth,
          fill: getEnemyHealthColor(enemy.type),
        });
      }

      if (enemy.hitFlashTime > 0) {
        const flashStrength = clamp(enemy.hitFlashTime / GameConfig.enemies.hitFlashTime, 0, 1);
        this.context.save();
        this.context.fillStyle = `rgba(255, 255, 255, ${0.22 + flashStrength * 0.42})`;
        this.context.beginPath();
        this.context.arc(screenPosition.x, screenPosition.y, enemy.collisionRadius + 10 + flashStrength * 6, 0, Math.PI * 2);
        this.context.fill();
        this.context.strokeStyle = `rgba(255, 244, 220, ${0.25 + flashStrength * 0.35})`;
        this.context.lineWidth = 2 + flashStrength * 2;
        this.context.stroke();
        this.context.restore();
      }
    }
  }

  drawWeaponEffects(weaponSystem, player, camera) {
    const ctx = this.context;
    const bladeWeapon = weaponSystem.getOrbitingBladeWeapon();

    if (bladeWeapon) {
      const style = bladeWeapon.visualStyle === "celestial" ? "celestial" : "blade";
      const sprite = getEffectSprite(style);
      const isEvolved = Boolean(bladeWeapon.isEvolution);

      for (const blade of weaponSystem.getOrbitingBladePositions(bladeWeapon, player.position)) {
        const screenPosition = camera.worldToScreen(blade.position);
        const radius = blade.radius;
        const visualSize = radius * 3.6;

        if (isEvolved) {
          ctx.save();
          ctx.fillStyle = "rgba(255, 224, 154, 0.22)";
          ctx.beginPath();
          ctx.arc(screenPosition.x, screenPosition.y, visualSize * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        this.drawCenteredSprite(this.context, sprite, screenPosition.x, screenPosition.y, visualSize);
      }
    }

    for (const effect of weaponSystem.visualEffects) {
      const alpha = effect.maxLife > 0 ? effect.life / effect.maxLife : 1;

      if (effect.type === "pulse") {
        const screenPosition = camera.worldToScreen(effect.position);
        const style = effect.visualStyle === "divine" ? "divine" : "holy";
        const sprite = getEffectSprite(style);
        const visualSize = effect.radius * 2.4 * (1 + (1 - alpha) * 0.25);
        const isEvolved = effect.visualStyle === "divine";

        if (isEvolved) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.35;
          ctx.fillStyle = "rgba(255, 224, 154, 0.35)";
          ctx.beginPath();
          ctx.arc(screenPosition.x, screenPosition.y, visualSize * 0.62, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        this.context.save();
        this.context.globalAlpha = alpha;
        this.drawCenteredSprite(this.context, sprite, screenPosition.x, screenPosition.y, visualSize);
        this.context.restore();
      }

      if (effect.type === "lightning") {
        const end = camera.worldToScreen(effect.end);
        const style = effect.visualStyle === "thunder" ? "thunder" : "lightning";
        const sprite = getEffectSprite(style);
        const visualSize = effect.visualStyle === "thunder" ? 118 : 96;

        this.context.save();
        this.context.globalAlpha = alpha;
        this.drawCenteredSprite(this.context, sprite, end.x, end.y, visualSize);
        this.context.restore();
      }
    }
  }

  drawProjectiles(projectiles, camera) {
    const ctx = this.context;
    const margin = 80;

    for (const projectile of projectiles) {
      const screenPosition = camera.worldToScreen(projectile.position);

      if (
        screenPosition.x < -margin ||
        screenPosition.x > camera.width + margin ||
        screenPosition.y < -margin ||
        screenPosition.y > camera.height + margin
      ) {
        continue;
      }

      const style = projectile.visualStyle === "storm" ? "storm" : "arcane";
      const sprite = getProjectileSprite(style);
      const visualSize = projectile.renderRadius * 4.8;
      const isEvolved = projectile.visualStyle === "storm";

      if (isEvolved) {
        ctx.save();
        ctx.fillStyle = "rgba(184, 140, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(screenPosition.x, screenPosition.y, visualSize * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.95;
      this.drawCenteredSprite(ctx, sprite, screenPosition.x, screenPosition.y, visualSize);
      ctx.restore();
    }
  }

  drawXPGems(xpGems, camera) {
    for (const gem of xpGems) {
      const screenPosition = camera.worldToScreen(gem.position);
      const frameIndex = Math.floor(gem.animTime) % 2;
      const sprite = getPickupSprite("xpGem", gem.tier, frameIndex);
      const visualSize = gem.radius * 4.6;

      this.drawCenteredSprite(this.context, sprite, screenPosition.x, screenPosition.y, visualSize);
    }
  }

  drawDamageNumbers(damageNumbers, camera) {
    const ctx = this.context;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 24px 'Courier New', monospace";

    for (const damageNumber of damageNumbers) {
      const screenPosition = camera.worldToScreen(damageNumber.position);
      const alpha = damageNumber.getAlpha();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#1b1010";
      ctx.fillText(String(damageNumber.amount), screenPosition.x + 3, screenPosition.y + 3);
      ctx.fillStyle = "#ffeb9e";
      ctx.fillText(String(damageNumber.amount), screenPosition.x, screenPosition.y);
    }

    ctx.restore();
  }

  drawHealthBar({ x, y, width, height, current, max, fill }) {
    const ctx = this.context;
    const percent = clamp(current / max, 0, 1);

    ctx.fillStyle = "rgba(13, 12, 14, 0.82)";
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = "#3a2025";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, width * percent, height);
    ctx.fillStyle = "rgba(255, 246, 212, 0.28)";
    ctx.fillRect(x, y, width * percent, Math.max(2, Math.floor(height / 3)));
  }

  drawCoinPickups(coinPickups, camera) {
    for (const coin of coinPickups) {
      const screenPosition = camera.worldToScreen(coin.position);
      const bob = Math.sin(coin.bobPhase) * 3;
      const frameIndex = Math.floor(coin.bobPhase / Math.PI) % 2;
      const sprite = getPickupSprite("coin", null, frameIndex);
      const visualSize = coin.radius * 4.4;

      this.drawCenteredSprite(
        this.context,
        sprite,
        screenPosition.x,
        screenPosition.y + bob,
        visualSize,
      );
    }
  }

  drawChests(chests, camera) {
    for (const chest of chests) {
      const screenPosition = camera.worldToScreen(chest.position);
      const bob = Math.sin(chest.bobPhase) * 6;
      const size = chest.renderSize;
      const halfSize = size / 2;

      this.context.save();
      this.context.shadowColor = "rgba(255, 207, 115, 0.55)";
      this.context.shadowBlur = 18;
      this.context.drawImage(
        chest.getCurrentSprite(),
        0,
        0,
        chest.spriteSourceSize,
        chest.spriteSourceSize,
        screenPosition.x - halfSize,
        screenPosition.y - halfSize + bob,
        size,
        size,
      );
      this.context.restore();
    }
  }

  drawBossHealthBar(enemies, screenWidth) {
    const boss = enemies.find((enemy) => enemy.isBoss && !enemy.isDead);

    if (!boss) {
      return;
    }

    const ctx = this.context;
    const barWidth = 760;
    const barHeight = 22;
    const x = (screenWidth - barWidth) / 2;
    const y = 78;
    const percent = clamp(boss.health / boss.maxHealth, 0, 1);
    const bossName = boss.name === "Boss" ? `Boss #${boss.bossIndex}` : boss.name;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillStyle = "rgba(8, 9, 12, 0.82)";
    ctx.fillRect(x - 8, y - 34, barWidth + 16, barHeight + 48);
    ctx.strokeStyle = "rgba(255, 90, 72, 0.65)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 8, y - 34, barWidth + 16, barHeight + 48);

    ctx.font = "900 28px 'Courier New', monospace";
    ctx.fillStyle = "#180810";
    ctx.fillText(bossName.toUpperCase(), screenWidth / 2 + 2, y - 30);
    ctx.fillStyle = "#ff8a72";
    ctx.fillText(bossName.toUpperCase(), screenWidth / 2, y - 32);

    ctx.fillStyle = "#3a1018";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#ff4a3a";
    ctx.fillRect(x, y, barWidth * percent, barHeight);
    ctx.fillStyle = "rgba(255, 244, 220, 0.35)";
    ctx.fillRect(x, y, barWidth * percent, 8);

    ctx.font = "800 18px 'Courier New', monospace";
    ctx.fillStyle = "#fff4dc";
    ctx.fillText(`${Math.ceil(boss.health)} / ${boss.maxHealth}`, screenWidth / 2, y + 2);
    ctx.restore();
  }

  drawCenteredSprite(ctx, sprite, x, y, size) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, 0, 0, SOURCE_SIZE, SOURCE_SIZE, x - size / 2, y - size / 2, size, size);
  }

  drawParticles(particleSystem, camera) {
    particleSystem.draw(this.context, camera);
  }

  drawLowHealthOverlay(health, maxHealth, pulse) {
    if (maxHealth <= 0) {
      return;
    }

    const ratio = health / maxHealth;
    const threshold = GameConfig.feedback.lowHealthThreshold ?? 0.25;

    if (ratio <= 0 || ratio >= threshold) {
      return;
    }

    const ctx = this.context;
    const intensity = (1 - ratio / threshold) * (0.55 + Math.sin(pulse) * 0.12);

    ctx.save();
    ctx.fillStyle = `rgba(120, 18, 24, ${intensity * 0.28})`;
    ctx.fillRect(0, 0, this.width, this.height);

    const vignette = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.height * 0.2,
      this.width / 2,
      this.height / 2,
      this.height * 0.75,
    );
    vignette.addColorStop(0, "rgba(255, 60, 60, 0)");
    vignette.addColorStop(1, `rgba(120, 18, 24, ${intensity * 0.35})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}

function getEnemyHealthColor(type) {
  const colors = {
    slime: "#9b7dff",
    bat: "#d8c4a0",
    brute: "#8a6858",
    crawler: "#8a78c8",
    elite: "#ffc86a",
    boss: "#ff6a58",
  };

  return colors[type] ?? "#9b7dff";
}
