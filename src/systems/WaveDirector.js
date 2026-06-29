import { GameConfig } from "../config/GameConfig.js";
import { getWaveForTime, getWaveMinute } from "../config/WaveDefinitions.js";
import { getWorldForWave } from "../config/WorldDefinitions.js";

export class WaveDirector {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentWaveId = 1;
    this.currentWorldId = "castleCourtyard";
    this.announcementTitle = "";
    this.announcementSubtitle = "";
    this.announcementWorldName = "";
    this.announcementTime = 0;
  }

  update(survivalTime, deltaTime) {
    const wave = getWaveForTime(survivalTime);
    const world = getWorldForWave(wave);

    if (wave.id !== this.currentWaveId) {
      this.currentWaveId = wave.id;
      this.currentWorldId = world.id;
      this.announcementTitle = wave.announcement;
      this.announcementSubtitle = world.announcementSuffix ?? world.subtitle;
      this.announcementWorldName = world.name;
      this.announcementTime = GameConfig.waves.announcementDuration;
    }

    this.announcementTime = Math.max(0, this.announcementTime - deltaTime);
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

    if (bossDefeatedCount > 0) {
      interval *= Math.max(
        0.72,
        1 - bossDefeatedCount * (scaling.bossDefeatSpawnIntervalReduction ?? 0.04),
      );
    }

    return interval;
  }

  pickEnemyType(survivalTime) {
    const wave = getWaveForTime(survivalTime);
    const weights = { ...wave.spawnWeights };

    if (wave.eliteChance && !weights.elite) {
      weights.elite = wave.eliteChance;
    }

    return pickWeightedType(weights);
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

    if (bossDefeatedCount > 0) {
      multiplier *= 1 + bossDefeatedCount * (scaling.bossDefeatHealthBonus ?? 0.08);
    }

    return multiplier;
  }

  getSpeedMultiplier(survivalTime) {
    const scaling = GameConfig.waves.scaling;
    return Math.min(
      scaling.maxSpeedMultiplier,
      1 + survivalTime * scaling.speedGrowthPerSecond,
    );
  }

  getDisplayInfo(survivalTime) {
    const wave = getWaveForTime(survivalTime);
    const world = getWorldForWave(wave);

    return {
      waveId: wave.id,
      waveName: wave.name,
      worldName: world.name,
      worldSubtitle: world.subtitle,
      minute: getWaveMinute(survivalTime),
      survivalTime,
    };
  }

  getCurrentWorld(survivalTime) {
    return getWorldForWave(getWaveForTime(survivalTime));
  }

  getAnnouncement() {
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

function pickWeightedType(weights) {
  const entries = Object.entries(weights).filter(([, weight]) => weight > 0);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [type, weight] of entries) {
    roll -= weight;

    if (roll <= 0) {
      return type;
    }
  }

  return entries[0]?.[0] ?? "slime";
}
