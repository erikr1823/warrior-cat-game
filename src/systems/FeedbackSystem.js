import { GameConfig } from "../config/GameConfig.js";
import { AudioSystem } from "./AudioSystem.js";
import { ParticleSystem } from "./ParticleSystem.js";

const DEATH_COLORS = {
  slime: "#9b7dff",
  bat: "#d8c4a0",
  brute: "#6a5040",
  crawler: "#8a78c8",
  elite: "#ffc86a",
  boss: "#ff6a58",
};

export class FeedbackSystem {
  constructor(game) {
    this.game = game;
    this.audio = new AudioSystem();
    this.particles = new ParticleSystem(GameConfig.feedback.maxParticles ?? 180);
    this.lowHealthPulse = 0;
    this.syncMuteFromSave();
  }

  syncMuteFromSave() {
    this.audio.setMuted(Boolean(this.game.saveData.settings?.muted));
  }

  toggleMute() {
    const muted = !this.audio.isMuted();
    this.audio.setMuted(muted);
    this.game.saveData.settings = {
      ...this.game.saveData.settings,
      muted,
    };
    this.game.saveSystem.save(this.game.saveData);
    return muted;
  }

  isMuted() {
    return this.audio.isMuted();
  }

  ensureAudio() {
    if (!this.audio.isMuted()) {
      this.audio.ensureContext();
    }
  }

  update(deltaTime) {
    this.audio.update(deltaTime);
    this.particles.update(deltaTime);

    const player = this.game.player;
    if (player && player.maxHealth > 0) {
      const healthRatio = player.health / player.maxHealth;

      if (healthRatio > 0 && healthRatio < 0.25) {
        this.lowHealthPulse += deltaTime * 4;
      } else {
        this.lowHealthPulse = 0;
      }
    }
  }

  clearRunEffects() {
    this.particles.clear();
  }

  onShoot() {
    this.audio.play("shoot");
  }

  onEnemyHit(enemy) {
    this.audio.play("enemyHit");
  }

  onEnemyDeath(enemy) {
    const color = DEATH_COLORS[enemy.type] ?? "#72db77";
    const count = enemy.isBoss ? 18 : enemy.isElite ? 12 : 8;

    this.particles.emitBurst(enemy.position.x, enemy.position.y, color, count, {
      speed: enemy.isBoss ? 190 : 150,
      size: enemy.isBoss ? 7 : 5,
      life: enemy.isBoss ? 0.55 : 0.42,
    });
    this.audio.play("enemyDeath");
  }

  onXPCollect(x, y, tier = "small") {
    const colors = {
      small: "#48a7ff",
      green: "#61e37c",
      red: "#ff5c5c",
    };

    this.particles.emitSparkles(x, y, colors[tier] ?? colors.small, tier === "red" ? 10 : 6);
    this.audio.play("xpPickup");
  }

  onPlayerDamage() {
    this.game.startScreenShake(
      GameConfig.feedback.screenShakeDamageAmount,
      GameConfig.feedback.screenShakeDamageDuration,
    );
    this.audio.play("playerDamage");
  }

  onLevelUp() {
    this.audio.play("levelUp");
  }

  onChestOpen() {
    this.game.startScreenShake(
      GameConfig.feedback.screenShakeChestAmount ?? 6,
      GameConfig.feedback.screenShakeChestDuration ?? 0.18,
    );
    this.audio.play("chestOpen");
  }

  onWeaponEvolution() {
    const player = this.game.player;
    this.particles.emitBurst(player.position.x, player.position.y, "#ffe09a", 20, {
      speed: 210,
      size: 6,
      life: 0.6,
      gravity: 80,
    });
    this.game.startScreenShake(
      GameConfig.feedback.screenShakeEvolutionAmount ?? 10,
      GameConfig.feedback.screenShakeEvolutionDuration ?? 0.32,
    );
    this.audio.play("evolution");
  }

  onGameOver() {
    this.audio.play("gameOver");
  }

  getLowHealthPulse() {
    return this.lowHealthPulse;
  }
}
