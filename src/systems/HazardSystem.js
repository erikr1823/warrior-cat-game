import { distanceBetween, normalizeVector } from "../core/MathUtils.js";

// Lightweight, capped system for telegraphed ground hazards (delayed explosions)
// and slow enemy projectiles. Both deal damage to the player only and are drawn
// by the Renderer. Caps keep performance safe even in a busy late-game run.
const MAX_HAZARDS = 40;
const MAX_PROJECTILES = 120;

function hurtPlayer(game, amount, sourcePosition) {
  const tookDamage = game.player.takeDamage(amount, sourcePosition);

  if (tookDamage) {
    game.feedback.onPlayerDamage();
    game.traitSystem?.onPlayerDamaged(game);

    if (game.player.isDead) {
      game.endRun();
    }
  }
}

export class HazardSystem {
  constructor() {
    this.hazards = [];
    this.projectiles = [];
  }

  reset() {
    this.hazards.length = 0;
    this.projectiles.length = 0;
  }

  // A circle that telegraphs (grows) for `warnTime`, then detonates once.
  spawnExplosion(x, y, { radius = 90, damage = 16, warnTime = 0.7, color = "#ff8a4a" } = {}) {
    if (this.hazards.length >= MAX_HAZARDS) {
      return;
    }

    this.hazards.push({
      x,
      y,
      radius,
      damage,
      warnTime,
      warnMax: warnTime,
      flashTime: 0,
      exploded: false,
      color,
    });
  }

  spawnProjectile(x, y, direction, { speed = 200, damage = 12, radius = 9, life = 4, color = "#b06cff" } = {}) {
    if (this.projectiles.length >= MAX_PROJECTILES) {
      return;
    }

    const dir = normalizeVector(direction);

    this.projectiles.push({
      x,
      y,
      vx: dir.x * speed,
      vy: dir.y * speed,
      radius,
      damage,
      life,
      color,
    });
  }

  update(deltaTime, game) {
    this.updateHazards(deltaTime, game);
    this.updateProjectiles(deltaTime, game);
  }

  updateHazards(deltaTime, game) {
    let writeIndex = 0;

    for (const hazard of this.hazards) {
      if (!hazard.exploded) {
        hazard.warnTime -= deltaTime;

        if (hazard.warnTime <= 0) {
          hazard.exploded = true;
          hazard.flashTime = 0.18;

          if (distanceBetween(game.player.position, hazard) <= hazard.radius + game.player.radius) {
            hurtPlayer(game, hazard.damage, hazard);
          }
        }
      } else {
        hazard.flashTime -= deltaTime;
      }

      if (hazard.exploded && hazard.flashTime <= 0) {
        continue;
      }

      this.hazards[writeIndex] = hazard;
      writeIndex += 1;
    }

    this.hazards.length = writeIndex;
  }

  updateProjectiles(deltaTime, game) {
    let writeIndex = 0;

    for (const projectile of this.projectiles) {
      projectile.x += projectile.vx * deltaTime;
      projectile.y += projectile.vy * deltaTime;
      projectile.life -= deltaTime;

      let alive = projectile.life > 0;

      if (alive && distanceBetween(game.player.position, projectile) <= projectile.radius + game.player.radius) {
        hurtPlayer(game, projectile.damage, projectile);
        alive = false;
      }

      if (alive) {
        this.projectiles[writeIndex] = projectile;
        writeIndex += 1;
      }
    }

    this.projectiles.length = writeIndex;
  }
}
