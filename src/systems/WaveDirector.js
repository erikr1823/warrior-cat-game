import { GameConfig } from "../config/GameConfig.js";
import { getWaveForTime, getWaveMinute } from "../config/WaveDefinitions.js";
import { isLateGameTime } from "../config/LateGameBiomeDefinitions.js";
import { getWorldForWave } from "../config/WorldDefinitions.js";
import {
  getRotatingEnemyTypes,
  getEnemyRotationAnnouncement,
  getRotationSlotIndex,
  pickRotatingEnemyType,
} from "../config/EnemyRotationDefinitions.js";
import {
  getBiomeEnemyTheme,
  getBiomeThemedEnemyPair,
  getBiomeRotationAnnouncement,
  pickBiomeThemedEnemyFromPair,
} from "../config/BiomeEnemyThemes.js";
import {
  getLateGameEliteChanceBonus,
  getLateGameHealthMultiplier,
  getLateGameSpawnPressure,
  getLateGameSpeedMultiplier,
} from "../config/LateGameBiomeDefinitions.js";

export class WaveDirector {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentWaveId = 1;
    this.currentWorldId = "castleCourtyard";
    this.currentRotationSlot = -1;
    this.announcementTitle = "";
    this.announcementSubtitle = "";
    this.announcementWorldName = "";
    this.announcementTime = 0;
    this.enemyRotationTitle = "";
    this.enemyRotationSubtitle = "";
    this.enemyRotationTime = 0;
  }

  update(survivalTime, deltaTime) {
    const wave = getWaveForTime(survivalTime);
    const world = getWorldForWave(wave);
    const rotationSlot = getRotationSlotIndex(survivalTime);
    const lateGame = isLateGameTime(survivalTime);

    if (rotationSlot !== this.currentRotationSlot) {
      this.currentRotationSlot = rotationSlot;
      const rotationAnnouncement = lateGame
        ? getBiomeRotationAnnouncement(world.id, survivalTime)
        : getEnemyRotationAnnouncement(survivalTime);
      this.enemyRotationTitle = rotationAnnouncement.title;
      this.enemyRotationSubtitle = rotationAnnouncement.subtitle;
      this.enemyRotationTime = GameConfig.waves.announcementDuration;
    }

    if (wave.id !== this.currentWaveId) {
      this.currentWaveId = wave.id;
      this.currentWorldId = world.id;
      this.announcementTitle = wave.announcement;
      const theme = getBiomeEnemyTheme(world.id);

      if (lateGame && theme?.subtitle) {
        this.announcementSubtitle = `${world.announcementSuffix ?? world.subtitle} · ${theme.subtitle}`;
      } else {
        this.announcementSubtitle = world.announcementSuffix ?? world.subtitle;
      }

      this.announcementWorldName = world.name;
      this.announcementTime = GameConfig.waves.announcementDuration;
    }

    this.announcementTime = Math.max(0, this.announcementTime - deltaTime);
    this.enemyRotationTime = Math.max(0, this.enemyRotationTime - deltaTime);
  }

  getSpawnInterval(survivalTime, bossDefeatedCount = 0) {
    const wave = getWaveForTime(survivalTime);
    const scaling = GameConfig.waves.scaling;
    const waveMultiplier = wave.spawnIntervalMultiplier ?? 1;
    const timeMultiplier = Math.max(
      scaling.minSpawnInterval / GameConfig.spawn.baseInterval,
      1 - survivalTime * scaling.spawnIntervalDecayPerSecond,
    );

    let interval = Math.max(
      scaling.minSpawnInterval,
      GameConfig.spawn.baseInterval * waveMultiplier * timeMultiplier,
    );

    const warmupDuration = GameConfig.spawn.warmupDuration ?? 0;

    if (warmupDuration > 0 && survivalTime < warmupDuration) {
      const progress = survivalTime / warmupDuration;
      const warmupMultiplier = GameConfig.spawn.warmupIntervalMultiplier ?? 1;
      interval *= warmupMultiplier - (warmupMultiplier - 1) * progress;
    }

    const midGameBoostTime = scaling.midGameSpawnBoostTime ?? 60;

    if (survivalTime >= midGameBoostTime) {
      interval *= scaling.midGameSpawnIntervalMultiplier ?? 0.9;
    }

    if (isLateGameTime(survivalTime)) {
      interval /= getLateGameSpawnPressure(survivalTime);
    }

    if (bossDefeatedCount > 0) {
      interval *= Math.max(
        0.72,
        1 - bossDefeatedCount * (scaling.bossDefeatSpawnIntervalReduction ?? 0.04),
      );
    }

    return interval;
  }

  pickEnemyType(survivalTime) {
    const world = getWorldForWave(getWaveForTime(survivalTime));

    if (isLateGameTime(survivalTime)) {
      return pickBiomeThemedEnemyFromPair(world.id, survivalTime);
    }

    return pickRotatingEnemyType(survivalTime);
  }

  getActiveEnemyTypes(survivalTime) {
    const world = getWorldForWave(getWaveForTime(survivalTime));

    if (isLateGameTime(survivalTime)) {
      return getBiomeThemedEnemyPair(world.id, survivalTime);
    }

    return getRotatingEnemyTypes(survivalTime);
  }

  getHealthMultiplier(survivalTime, bossDefeatedCount = 0) {
    const scaling = GameConfig.waves.scaling;
    let multiplier = Math.min(
      scaling.maxHealthMultiplier,
      1 + survivalTime * scaling.healthGrowthPerSecond,
    );

    const rampDuration = scaling.earlyHealthRampDuration ?? 0;

    if (rampDuration > 0 && survivalTime < rampDuration) {
      const progress = survivalTime / rampDuration;
      const earlyMultiplier = scaling.earlyHealthMultiplier ?? 1;
      multiplier *= earlyMultiplier + (1 - earlyMultiplier) * progress;
    }

    if (isLateGameTime(survivalTime)) {
      multiplier *= getLateGameHealthMultiplier(survivalTime);
    }

    if (bossDefeatedCount > 0) {
      multiplier *= 1 + bossDefeatedCount * (scaling.bossDefeatHealthBonus ?? 0.08);
    }

    return multiplier;
  }

  getSpeedMultiplier(survivalTime) {
    const scaling = GameConfig.waves.scaling;
    let multiplier = Math.min(
      scaling.maxSpeedMultiplier,
      1 + survivalTime * scaling.speedGrowthPerSecond,
    );

    if (isLateGameTime(survivalTime)) {
      multiplier *= getLateGameSpeedMultiplier(survivalTime);
    }

    return multiplier;
  }

  getDisplayInfo(survivalTime) {
    const wave = getWaveForTime(survivalTime);
    const world = getWorldForWave(wave);
    const enemyTypes = this.getActiveEnemyTypes(survivalTime);

    return {
      waveId: wave.id,
      waveName: wave.name,
      worldName: world.name,
      worldSubtitle: world.subtitle,
      enemyType: enemyTypes[0],
      enemyTypes,
      minute: getWaveMinute(survivalTime),
      survivalTime,
      isLateGame: Boolean(wave.isLateGame),
      lateGameStage: wave.lateGameStage ?? null,
    };
  }

  getCurrentWorld(survivalTime) {
    return getWorldForWave(getWaveForTime(survivalTime));
  }

  getAnnouncement() {
    if (this.enemyRotationTime > 0) {
      const duration = GameConfig.waves.announcementDuration || 2.8;

      return {
        title: this.enemyRotationTitle,
        subtitle: this.enemyRotationSubtitle,
        worldName: "",
        text: `${this.enemyRotationTitle}  ·  ${this.enemyRotationSubtitle}`,
        alpha: Math.min(1, this.enemyRotationTime / 0.6),
        progress: Math.min(1, this.enemyRotationTime / duration),
      };
    }

    if (this.announcementTime <= 0) {
      return null;
    }

    return {
      title: this.announcementTitle,
      subtitle: this.announcementSubtitle,
      worldName: this.announcementWorldName,
      text: `${this.announcementTitle}  ·  ${this.announcementSubtitle}`,
      alpha: Math.min(1, this.announcementTime / 0.6),
      progress: Math.min(1, this.announcementTime / (GameConfig.waves.announcementDuration || 2.8)),
    };
  }
}
