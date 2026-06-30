import { circlesOverlap } from "../core/MathUtils.js";
import { SpatialGrid } from "../core/SpatialGrid.js";
import { GameConfig } from "../config/GameConfig.js";
import { isGodMode } from "../debug/GodMode.js";
import { damageEnemy } from "./EnemyDamage.js";

export class CollisionSystem {
  constructor() {
    this.playerBumpCooldown = 0;
    this.playerBumpCooldownDuration = 0.32;
    this.enemyGrid = new SpatialGrid(256);
    this.nearbyEnemies = [];
  }

  update(deltaTime, game) {
    this.playerBumpCooldown = Math.max(0, this.playerBumpCooldown - deltaTime);
    this.handleProjectileEnemyCollisions(game);
    this.handlePlayerEnemyCollisions(game);
    this.handleChestCollisions(game);
  }

  prepareFrame(enemies) {
    this.rebuildEnemyGrid(enemies);
  }

  rebuildEnemyGrid(enemies) {
    this.enemyGrid.clear();

    for (const enemy of enemies) {
      if (!enemy.isDead) {
        this.enemyGrid.insert(enemy);
      }
    }
  }

  handleProjectileEnemyCollisions(game) {
    for (const projectile of game.projectiles) {
      if (projectile.isDead) {
        continue;
      }

      const searchRadius = projectile.radius + 96;
      const nearby = this.enemyGrid.query(projectile.position, searchRadius, this.nearbyEnemies);

      for (const enemy of nearby) {
        if (enemy.isDead || projectile.hitEnemies.has(enemy)) {
          continue;
        }

        if (!circlesOverlap(projectile, enemy)) {
          continue;
        }

        damageEnemy(game, enemy, projectile.damage, projectile.direction);
        projectile.hitEnemies.add(enemy);
        this.maybeSplitIntoShards(game, projectile, enemy);

        if (projectile.pierce <= 0) {
          projectile.isDead = true;
          break;
        }

        projectile.pierce -= 1;
      }
    }
  }

  // Synergy: Arcane Serration — ink projectiles can split into short blade shards
  // on hit. Shards use the "blade" style so they cannot recursively split.
  maybeSplitIntoShards(game, projectile, enemy) {
    if (!game.synergySystem?.has("arcaneSerration")) {
      return;
    }

    const isArcane = projectile.visualStyle === "arcane" || projectile.visualStyle === "storm";

    if (!isArcane || Math.random() >= 0.25) {
      return;
    }

    const shardDamage = Math.max(2, Math.round(projectile.damage * 0.4));
    const angles = [-0.5, 0.5];

    for (const angle of angles) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const direction = {
        x: projectile.direction.x * cos - projectile.direction.y * sin,
        y: projectile.direction.x * sin + projectile.direction.y * cos,
      };

      game.projectiles.push(
        game.projectilePool.acquire(enemy.position.x, enemy.position.y, direction, {
          damage: shardDamage,
          speed: 620,
          radius: 8,
          maxDistance: 220,
          pierce: 0,
          visualStyle: "blade",
        }),
      );
    }
  }

  handlePlayerEnemyCollisions(game) {
    if (this.playerBumpCooldown > 0 || game.player.isDead || isGodMode(game)) {
      return;
    }

    const searchRadius = game.player.radius + 96;
    const nearby = this.enemyGrid.query(game.player.position, searchRadius, this.nearbyEnemies);

    for (const enemy of nearby) {
      if (enemy.isDead) {
        continue;
      }

      if (circlesOverlap(game.player, enemy)) {
        const tookDamage = game.player.takeDamage(enemy.damage, enemy.position);
        this.playerBumpCooldown = this.playerBumpCooldownDuration;

        if (tookDamage) {
          game.feedback.onPlayerDamage();
          game.traitSystem?.onPlayerDamaged(game);

          if (game.player.isDead) {
            game.endRun();
          }
        }

        return;
      }
    }
  }

  handleChestCollisions(game) {
    if (game.state !== "playing" || game.player.isDead) {
      return;
    }

    for (const chest of game.chests) {
      if (chest.isDead) {
        continue;
      }

      if (circlesOverlap(game.player, chest)) {
        game.openChest(chest);
        chest.isDead = true;
        return;
      }
    }
  }
}
