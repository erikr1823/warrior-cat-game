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

    this.spawnBoss(game);
    this.nextBossTime = game.survivalTime + GameConfig.bosses.spawnInterval;
  }

  spawnBoss(game) {
    const waveDirector = this.spawner.getWaveDirector();
    const world = waveDirector.getCurrentWorld(game.survivalTime);
    const healthMultiplier =
      waveDirector.getHealthMultiplier(game.survivalTime) *
      (1 + this.bossSpawnCount * GameConfig.bosses.healthScalePerSpawn);

    const spawnPosition = this.spawner.getSpawnPosition(game.player.position, game.camera);
    this.bossSpawnCount += 1;

    game.enemies.push(
      new Enemy(spawnPosition.x, spawnPosition.y, "boss", {
        healthMultiplier,
        bossIndex: this.bossSpawnCount,
        enemyPack: world.enemyPack,
        worldId: world.id,
      }),
    );

    const bossNames = GameConfig.bosses.names;
    const bossName = bossNames[(this.bossSpawnCount - 1) % bossNames.length];

    game.enemies.at(-1).name = bossName;

    this.announcement = {
      text: `${bossName.toUpperCase()} APPROACHES`,
      time: GameConfig.bosses.announcementDuration,
      alpha: 1,
    };
  }

  getAnnouncement() {
    if (!this.announcement) {
      return null;
    }

    const duration = GameConfig.bosses.announcementDuration;
    const progress = this.announcement.time / duration;

    return {
      text: this.announcement.text,
      alpha: Math.min(1, progress * 2.5),
    };
  }
}
