import { distanceBetween, randomBetween, clamp } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { getWaveForTime } from "../config/WaveDefinitions.js";
import { getWorldForWave } from "../config/WorldDefinitions.js";
import { Enemy } from "../entities/Enemy.js";
import { WaveDirector } from "./WaveDirector.js";
import { BossDirector } from "./BossDirector.js";

export class Spawner {
  constructor(camera) {
    this.camera = camera;
    this.spawnTimer = 0;
    this.spawnPadding = GameConfig.spawn.padding;
    this.minSpawnDistance = GameConfig.spawn.minSpawnDistance;
    this.waveDirector = new WaveDirector();
    this.bossDirector = new BossDirector(this);
  }

  reset() {
    this.spawnTimer = 0;
    this.waveDirector.reset();
    this.bossDirector.reset();
  }

  update(deltaTime, game) {
    this.camera = game.camera;
    this.waveDirector.update(game.survivalTime, deltaTime);
    this.bossDirector.update(deltaTime, game);
    this.spawnTimer -= deltaTime;

    if (this.spawnTimer > 0) {
      return;
    }

    if (game.enemies.length >= GameConfig.spawn.maxEnemies) {
      this.spawnTimer = GameConfig.spawn.maxEnemyDelay;
      return;
    }

    this.spawnTimer = this.waveDirector.getSpawnInterval(game.survivalTime, game.bossDefeatedCount);
    this.spawnEnemy(game);
  }

  spawnEnemy(game) {
    const spawnPosition = this.getSpawnPosition(game.player.position, game.camera);
    const wave = getWaveForTime(game.survivalTime);
    const world = getWorldForWave(wave);
    const type = this.waveDirector.pickEnemyType(game.survivalTime);
    const healthMultiplier = this.waveDirector.getHealthMultiplier(
      game.survivalTime,
      game.bossDefeatedCount,
    );
    const speedMultiplier = this.waveDirector.getSpeedMultiplier(game.survivalTime);

    game.enemies.push(
      new Enemy(spawnPosition.x, spawnPosition.y, type, {
        healthMultiplier,
        speedMultiplier,
        enemyPack: world.enemyPack,
        worldId: world.id,
      }),
    );
  }

  getSpawnPosition(playerPosition, camera) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const position = this.getOffscreenSpawnPosition(playerPosition, camera);

      if (distanceBetween(position, playerPosition) >= this.minSpawnDistance) {
        return position;
      }
    }

    return this.getOffscreenSpawnPosition(playerPosition, camera);
  }

  getOffscreenSpawnPosition(playerPosition, camera) {
    const halfWidth = camera.width / 2;
    const halfHeight = camera.height / 2;
    const side = Math.floor(Math.random() * 4);
    let x = playerPosition.x;
    let y = playerPosition.y;

    if (side === 0) {
      x += randomBetween(-halfWidth, halfWidth);
      y -= halfHeight + this.spawnPadding;
    } else if (side === 1) {
      x += halfWidth + this.spawnPadding;
      y += randomBetween(-halfHeight, halfHeight);
    } else if (side === 2) {
      x += randomBetween(-halfWidth, halfWidth);
      y += halfHeight + this.spawnPadding;
    } else {
      x -= halfWidth + this.spawnPadding;
      y += randomBetween(-halfHeight, halfHeight);
    }

    return clampSpawnToWorld({ x, y });
  }

  getWaveDirector() {
    return this.waveDirector;
  }

  getBossDirector() {
    return this.bossDirector;
  }
}

function clampSpawnToWorld(position) {
  const bounds = GameConfig.world.bounds;
  const margin = 80;

  return {
    x: clamp(position.x, bounds.minX + margin, bounds.maxX - margin),
    y: clamp(position.y, bounds.minY + margin, bounds.maxY - margin),
  };
}
