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

        if (projectile.pierce <= 0) {
          projectile.isDead = true;
          break;
        }

        projectile.pierce -= 1;
      }
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
