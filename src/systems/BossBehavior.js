import { GameConfig } from "../config/GameConfig.js";
import { directionBetween } from "../core/MathUtils.js";
import { wrappedDirectionBetween } from "../core/WorldWrap.js";
import { Enemy } from "../entities/Enemy.js";

function directionToPlayer(from, player) {
  return GameConfig.world.wrapWorld
    ? wrappedDirectionBetween(from, player.position)
    : directionBetween(from, player.position);
}

// Returns a controller function (stored on a boss Enemy as `enemy.controller`)
// that drives a readable, telegraphed attack pattern:
//   - Charge: winds up with a warning ring, then lunges in a straight line.
//   - Ground Slam: places an expanding warning circle on the player, then erupts.
//   - Spread: fires a slow, dodgeable fan of projectiles.
//   - Summons reinforcements once at 50% HP, and enrages (faster) below 30% HP.
// After charge/slam the boss pauses briefly so the player can punish it.
//
// The controller returns true when it set the boss's velocity itself (so the
// default chase movement is skipped for that frame).
export function createBossController() {
  const state = {
    mode: "chase",
    timer: 3.5,
    dir: { x: 0, y: 1 },
    target: { x: 0, y: 0 },
    slamPlaced: false,
    fired: false,
    summoned: false,
  };

  return function update(boss, deltaTime, player, game) {
    state.timer -= deltaTime;

    const enrage = boss.health <= boss.maxHealth * 0.3 ? 1.4 : 1;

    if (!state.summoned && boss.health <= boss.maxHealth * 0.5) {
      state.summoned = true;
      summonMinions(boss, game, 3);
    }

    if (state.mode === "chase") {
      if (state.timer <= 0) {
        startAttack(boss, player, game, state);
      }

      return false;
    }

    if (state.mode === "windupCharge") {
      stop(boss);

      if (state.timer <= 0) {
        state.mode = "charge";
        state.timer = 0.4;
      }

      return true;
    }

    if (state.mode === "charge") {
      boss.velocity.x = state.dir.x * boss.speed * 5 * enrage;
      boss.velocity.y = state.dir.y * boss.speed * 5 * enrage;

      if (state.timer <= 0) {
        enterRecovery(state, 0.6);
      }

      return true;
    }

    if (state.mode === "windupSlam") {
      stop(boss);

      if (!state.slamPlaced) {
        state.slamPlaced = true;
        game.hazardSystem?.spawnExplosion(state.target.x, state.target.y, {
          radius: 150,
          damage: Math.max(12, boss.damage),
          warnTime: 0.7,
          color: "#ff8a4a",
        });
      }

      if (state.timer <= 0) {
        enterRecovery(state, 0.7);
      }

      return true;
    }

    if (state.mode === "spread") {
      stop(boss);

      if (!state.fired) {
        state.fired = true;
        fireSpread(boss, player, game);
      }

      if (state.timer <= 0) {
        state.mode = "chase";
        state.timer = 3.2 / enrage;
      }

      return true;
    }

    if (state.mode === "recover") {
      stop(boss);

      if (state.timer <= 0) {
        state.mode = "chase";
        state.timer = 3.2 / enrage;
      }

      return true;
    }

    return false;
  };
}

function stop(boss) {
  boss.velocity.x = 0;
  boss.velocity.y = 0;
}

function enterRecovery(state, time) {
  state.mode = "recover";
  state.timer = time;
}

function startAttack(boss, player, game, state) {
  const roll = Math.random();

  if (roll < 0.34) {
    state.mode = "windupCharge";
    state.timer = 0.7;
    state.dir = directionToPlayer(boss.position, player);
    boss.updateFacing(state.dir);

    // Non-damaging warning ring around the boss telegraphs the charge.
    game.hazardSystem?.spawnExplosion(boss.position.x, boss.position.y, {
      radius: boss.collisionRadius + 46,
      damage: 0,
      warnTime: 0.7,
      color: "#ff5a4a",
    });
    return;
  }

  if (roll < 0.67) {
    state.mode = "windupSlam";
    state.timer = 0.7;
    state.slamPlaced = false;
    state.target = { x: player.position.x, y: player.position.y };
    return;
  }

  state.mode = "spread";
  state.timer = 0.6;
  state.fired = false;
}

function fireSpread(boss, player, game) {
  const base = directionToPlayer(boss.position, player);
  const offsets = [-0.5, -0.25, 0, 0.25, 0.5];

  for (const offset of offsets) {
    const cos = Math.cos(offset);
    const sin = Math.sin(offset);
    const direction = {
      x: base.x * cos - base.y * sin,
      y: base.x * sin + base.y * cos,
    };

    game.hazardSystem?.spawnProjectile(boss.position.x, boss.position.y, direction, {
      speed: 240,
      damage: Math.max(10, Math.round(boss.damage * 0.8)),
      radius: 11,
      life: 4,
      color: "#ffae5a",
    });
  }
}

function summonMinions(boss, game, count) {
  for (let index = 0; index < count; index += 1) {
    if (game.enemies.length >= GameConfig.spawn.maxEnemies) {
      return;
    }

    const angle = (Math.PI * 2 * index) / count;
    const minion = new Enemy(
      boss.position.x + Math.cos(angle) * 70,
      boss.position.y + Math.sin(angle) * 70,
      "slime",
      {
        healthMultiplier: 0.8,
        enemyPack: boss.enemyPack,
        worldId: boss.worldId,
      },
    );

    game.enemies.push(minion);
  }
}
