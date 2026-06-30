import { GameConfig } from "../config/GameConfig.js";
import { Enemy } from "../entities/Enemy.js";
import { createBossController } from "./BossBehavior.js";

/** Boss type for live spawns — must match GameConfig.bosses.activeType and EnemyRoster.md */
const ACTIVE_BOSS_TYPE = GameConfig.bosses.activeType ?? "skeletonCaptain";

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

    // Timed spawn: first at 120s, then every 120s. Wait if a boss is still alive.
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
    const bossConfig = GameConfig.enemies[ACTIVE_BOSS_TYPE] ?? GameConfig.enemies.slime;

    const spawnPosition = this.spawner.getSpawnPosition(game.player.position, game.camera);
    this.bossSpawnCount += 1;

    game.enemies.push(
      new Enemy(spawnPosition.x, spawnPosition.y, ACTIVE_BOSS_TYPE, {
        healthMultiplier,
        bossIndex: this.bossSpawnCount,
        enemyPack: world.enemyPack,
        worldId: world.id,
        isBoss: true,
      }),
    );

    const boss = game.enemies.at(-1);
    boss.name = bossConfig.name;
    // Telegraphed attack pattern (charge / slam / spread / summon / enrage).
    boss.controller = createBossController();

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
