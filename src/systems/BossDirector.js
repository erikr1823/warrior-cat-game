import { GameConfig } from "../config/GameConfig.js";
import { Enemy } from "../entities/Enemy.js";

export class BossDirector {
  constructor(spawner) {
    this.spawner = spawner;
    this.bossSpawnCount = 0;
    this.nextBossTime = GameConfig.bosses.firstSpawnTime;
    this.announcement = null;
  }

  reset() {
    this.bossSpawnCount = 0;
    this.nextBossTime = GameConfig.bosses.firstSpawnTime;
    this.announcement = null;
  }

  update(deltaTime, game) {
    if (this.announcement) {
      this.announcement.time -= deltaTime;

      if (this.announcement.time <= 0) {
        this.announcement = null;
      }
    }

    if (game.survivalTime < this.nextBossTime) {
      return;
    }

    if (game.enemies.some((enemy) => enemy.isBoss && !enemy.isDead)) {
      return;
    }

    if (Math.random() > (GameConfig.bosses.spawnChance ?? 1)) {
      this.nextBossTime = game.survivalTime + GameConfig.bosses.spawnInterval;
      return;
    }

    this.spawnBoss(game);
    this.nextBossTime = game.survivalTime + GameConfig.bosses.spawnInterval;
  }

  spawnBoss(game) {
    const waveDirector = this.spawner.getWaveDirector();
    const world = waveDirector.getCurrentWorld(game.survivalTime);
    const healthMultiplier =
      waveDirector.getHealthMultiplier(game.survivalTime, game.bossDefeatedCount) *
      (1 + this.bossSpawnCount * GameConfig.bosses.healthScalePerSpawn);
    const bossTypes = GameConfig.bosses.types ?? ["skeletonCaptain"];
    const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    const bossConfig = GameConfig.enemies[bossType] ?? GameConfig.enemies.skeletonCaptain;

    const spawnPosition = this.spawner.getSpawnPosition(game.player.position, game.camera);
    this.bossSpawnCount += 1;

    game.enemies.push(
      new Enemy(spawnPosition.x, spawnPosition.y, bossType, {
        healthMultiplier,
        bossIndex: this.bossSpawnCount,
        enemyPack: world.enemyPack,
        worldId: world.id,
        isBoss: true,
      }),
    );

    game.enemies.at(-1).name = bossConfig.name;

    this.announcement = {
      text: `${bossConfig.name.toUpperCase()} APPROACHES`,
      time: GameConfig.bosses.announcementDuration,
      alpha: 1,
    };
  }

  onBossDefeated(enemy) {
    this.announcement = {
      text: "BOSS DEFEATED",
      subtitle: enemy.name,
      time: GameConfig.bosses.defeatAnnouncementDuration ?? 2.4,
      alpha: 1,
    };
  }

  getAnnouncement() {
    if (!this.announcement) {
      return null;
    }

    const duration =
      this.announcement.text === "BOSS DEFEATED"
        ? GameConfig.bosses.defeatAnnouncementDuration ?? 2.4
        : GameConfig.bosses.announcementDuration;
    const progress = this.announcement.time / duration;

    return {
      text: this.announcement.text,
      subtitle: this.announcement.subtitle,
      alpha: Math.min(1, progress * 2.5),
    };
  }
}
