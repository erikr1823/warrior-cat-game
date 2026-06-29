import { circlesOverlap } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { damageEnemy } from "./EnemyDamage.js";

export class CollisionSystem {
  constructor() {
    this.playerBumpCooldown = 0;
    this.playerBumpCooldownDuration = 0.32;
  }

  update(deltaTime, game) {
    this.playerBumpCooldown = Math.max(0, this.playerBumpCooldown - deltaTime);
    this.handleProjectileEnemyCollisions(game);
    this.handlePlayerEnemyCollisions(game);
    this.handleChestCollisions(game);
  }

  handleProjectileEnemyCollisions(game) {
    for (const projectile of game.projectiles) {
      if (projectile.isDead) {
        continue;
      }

      for (const enemy of game.enemies) {
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
    if (this.playerBumpCooldown > 0 || game.player.isDead) {
      return;
    }

    for (const enemy of game.enemies) {
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
