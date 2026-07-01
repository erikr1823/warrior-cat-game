import { GameConfig } from "../config/GameConfig.js";
import { getTraitDefinition, getAllTraitIds } from "../config/TraitDefinitions.js";
import { damageEnemy } from "./EnemyDamage.js";
import { distanceBetween } from "../core/MathUtils.js";
import { wrappedDistanceBetween } from "../core/WorldWrap.js";

// Owns the set of Run Traits the player has taken this run and applies their
// effects. Static effects run once on acquire; dynamic effects run via update()
// and the combat hooks called from EnemyDamage.
export class TraitSystem {
  constructor() {
    this.traits = new Set();
    this.momentumBonus = 0;
    this.weaponHitCount = 0;
    this.suppressHitCount = false;
  }

  has(id) {
    return this.traits.has(id);
  }

  count() {
    return this.traits.size;
  }

  canAcquireMore() {
    return this.traits.size < (GameConfig.traits?.maxTraits ?? 4);
  }

  acquireTrait(id, game) {
    if (this.traits.has(id) || !this.canAcquireMore()) {
      return;
    }

    this.traits.add(id);
    this.applyStaticEffect(id, game);
  }

  applyStaticEffect(id, game) {
    const player = game.player;
    const tuning = GameConfig.traits ?? {};

    if (id === "glassOath") {
      game.runModifiers.damageMultiplier *= 1.35;
      const reduced = Math.round(player.maxHealth * 0.8);
      player.maxHealth = Math.max(1, reduced);
      player.health = Math.min(player.health, player.maxHealth);
      return;
    }

    if (id === "heavyArmor") {
      player.maxHealth += 30;
      player.health += 30;
      player.speed *= 0.92;
      return;
    }

    if (id === "gemHunger") {
      player.magnetRadius = Math.round(player.magnetRadius * 1.9);
      player.pickupRadius = Math.round(player.pickupRadius * 1.5);
      return;
    }

    // lastStand, bossHunter, executionMark, bloodPrice, momentum,
    // arcaneOverflow, safeRecovery are all handled dynamically below.
  }

  // Multiplier applied on top of run damage for each hit. Reads enemy + player
  // state so Last Stand / Momentum / Boss Hunter / Execution Mark are dynamic.
  getCombatDamageMultiplier(game, enemy) {
    let multiplier = 1;
    const player = game.player;

    if (this.has("lastStand") && player.maxHealth > 0) {
      if (player.health / player.maxHealth < 0.3) {
        multiplier *= 1.3;
      }
    }

    if (this.has("momentum")) {
      multiplier *= 1 + this.momentumBonus;
    }

    if (this.has("bossHunter") && (enemy.isBoss || enemy.isElite || enemy.isEliteModified)) {
      multiplier *= 1.3;
    }

    if (this.has("executionMark") && enemy.maxHealth > 0) {
      if (enemy.health / enemy.maxHealth < 0.2) {
        multiplier *= 1.6;
      }
    }

    return multiplier;
  }

  // Called from EnemyDamage whenever a weapon deals damage (for Arcane Overflow).
  registerWeaponHit() {
    if (this.suppressHitCount || !this.has("arcaneOverflow")) {
      return;
    }

    this.weaponHitCount += 1;
  }

  // Called when the player takes damage (Safe Recovery).
  onPlayerDamaged(game) {
    if (!this.has("safeRecovery")) {
      return;
    }

    const player = game.player;
    player.invincibilityTime = Math.max(player.invincibilityTime, 0.7);
    player.traitSpeedBoostTime = 0.7;
  }

  update(deltaTime, game) {
    const player = game.player;

    // Momentum: build while moving, decay while still.
    if (this.has("momentum")) {
      if (player.isMoving) {
        this.momentumBonus = Math.min(0.25, this.momentumBonus + deltaTime * 0.18);
      } else {
        this.momentumBonus = Math.max(0, this.momentumBonus - deltaTime * 0.35);
      }
    }

    // Last Stand: speed up weapon cooldowns slightly while critically low.
    if (this.has("lastStand") && player.maxHealth > 0 && player.health / player.maxHealth < 0.3) {
      for (const weapon of game.weaponSystem.weapons.values()) {
        if (weapon.timer > 0) {
          weapon.timer = Math.max(0, weapon.timer - deltaTime * 0.3);
        }
      }
    }

    // Arcane Overflow: every N weapon hits, release a small burst.
    if (this.has("arcaneOverflow")) {
      const threshold = GameConfig.traits?.arcaneOverflowHits ?? 12;

      if (this.weaponHitCount >= threshold) {
        this.weaponHitCount = 0;
        this.emitOverflowBurst(game);
      }
    }
  }

  emitOverflowBurst(game) {
    const radius = GameConfig.traits?.arcaneOverflowRadius ?? 150;
    const damage = GameConfig.traits?.arcaneOverflowDamage ?? 14;
    const player = game.player;

    game.weaponSystem.visualEffects.push({
      type: "pulse",
      position: { ...player.position },
      radius,
      life: 0.32,
      maxLife: 0.32,
      visualStyle: "arcane",
    });

    // Suppress hit counting so the burst cannot feed back into itself.
    this.suppressHitCount = true;

    for (const enemy of game.enemies) {
      if (enemy.isDead) {
        continue;
      }

      const dist = GameConfig.world.wrapWorld
        ? wrappedDistanceBetween(player.position, enemy.position)
        : distanceBetween(player.position, enemy.position);

      if (dist <= radius + enemy.radius) {
        damageEnemy(game, enemy, damage, { x: 0, y: -1 });
      }
    }

    this.suppressHitCount = false;
  }

  // Returns true if the player has Blood Price (used by chest opening).
  hasBloodPrice() {
    return this.has("bloodPrice");
  }

  getOwnedTraitSummary() {
    return [...this.traits].map((id) => {
      const definition = getTraitDefinition(id);
      return {
        id,
        name: definition?.name ?? id,
        color: definition?.color ?? "#ffe09a",
      };
    });
  }

  getAvailableTraitChoices() {
    if (!this.canAcquireMore()) {
      return [];
    }

    return getAllTraitIds()
      .filter((id) => !this.traits.has(id))
      .map((id) => {
        const definition = getTraitDefinition(id);

        return {
          type: "trait",
          traitId: id,
          name: definition?.name ?? id,
          description: definition?.description ?? "",
          tradeoff: definition?.tradeoff ?? "",
          color: definition?.color ?? "#ffe09a",
          rank: 0,
          maxRank: 1,
        };
      });
  }
}
