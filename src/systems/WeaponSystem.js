import { circlesOverlap, directionBetween, distanceBetween, normalizeVector } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import {
  STARTER_WEAPON_ID,
  WEAPON_MAX_LEVEL,
  getWeaponDefinition,
  getLevelUpWeaponIds,
} from "../config/WeaponDefinitions.js";
import { getAllEvolutions } from "../config/EvolutionDefinitions.js";
import { damageEnemy } from "./EnemyDamage.js";

export class WeaponSystem {
  constructor() {
    this.weapons = new Map();
    this.visualEffects = [];
    this.bladeScratch = [];
    this.enemyScratch = [];
    this.manualShotCooldown = 0;
    this.behaviors = {
      arcaneBolt: (weapon, deltaTime, game) => this.updateArcaneBolt(weapon, game),
      orbitingBlade: (weapon, deltaTime, game) => this.updateOrbitingBlade(weapon, deltaTime, game),
      holyPulse: (weapon, deltaTime, game) => this.updateHolyPulse(weapon, game),
      lightningMark: (weapon, deltaTime, game) => this.updateLightningMark(weapon, game),
    };

    this.addWeapon(STARTER_WEAPON_ID);
  }

  update(deltaTime, game) {
    this.manualShotCooldown = Math.max(0, this.manualShotCooldown - deltaTime);
    this.updateVisualEffects(deltaTime);

    for (const weapon of this.weapons.values()) {
      weapon.timer -= deltaTime;
      const behaviorId = weapon.behavior ?? weapon.id;
      this.behaviors[behaviorId]?.(weapon, deltaTime, game);
    }
  }

  /** Manual Ink Flick — separate from auto-fire weapons; left click / touch action. */
  fireManualInkFlick(game, direction) {
    if (this.manualShotCooldown > 0) {
      return false;
    }

    const shotConfig = GameConfig.player.manualShot;
    const aimDirection = normalizeVector(direction);

    if (aimDirection.x === 0 && aimDirection.y === 0) {
      return false;
    }

    this.manualShotCooldown = shotConfig.cooldown;
    game.feedback.onShoot();

    game.projectiles.push(
      game.projectilePool.acquire(game.player.position.x, game.player.position.y, aimDirection, {
        damage: shotConfig.damage,
        speed: shotConfig.speed,
        radius: shotConfig.radius,
        maxDistance: shotConfig.maxDistance,
        pierce: 0,
        visualStyle: "arcane",
      }),
    );

    return true;
  }

  getManualShotCooldownProgress() {
    const cooldown = GameConfig.player.manualShot.cooldown;

    if (this.manualShotCooldown <= 0) {
      return 1;
    }

    return 1 - this.manualShotCooldown / cooldown;
  }

  addWeapon(id) {
    if (this.weapons.has(id)) {
      return this.weapons.get(id);
    }

    const config = GameConfig.weapons[id];

    if (!config) {
      return null;
    }

    const weapon = {
      ...structuredClone(config),
      level: 1,
      timer: 0,
      angle: 0,
      hitTimers: new Map(),
    };

    this.weapons.set(id, weapon);
    return weapon;
  }

  levelUpWeapon(id) {
    const weapon = this.weapons.get(id) ?? this.addWeapon(id);

    if (!weapon || weapon.isEvolution || this.isMaxLevel(weapon)) {
      return weapon;
    }

    const upgrade = weapon.upgrades[weapon.level - 1];

    if (upgrade.multiplier !== undefined) {
      weapon[upgrade.stat] *= upgrade.multiplier;
    } else {
      weapon[upgrade.stat] += upgrade.amount;
    }

    weapon.level += 1;
    return weapon;
  }

  evolveWeapon(evolution) {
    const baseWeapon = this.weapons.get(evolution.baseWeaponId);

    if (
      !baseWeapon ||
      baseWeapon.isEvolution ||
      !this.isMaxLevel(baseWeapon) ||
      this.weapons.has(evolution.evolvedWeaponId)
    ) {
      return null;
    }

    const config = GameConfig.weapons[evolution.evolvedWeaponId];

    if (!config) {
      return null;
    }

    this.weapons.delete(evolution.baseWeaponId);

    const evolvedWeapon = {
      ...structuredClone(config),
      level: WEAPON_MAX_LEVEL,
      timer: 0,
      angle: baseWeapon.angle ?? 0,
      hitTimers: new Map(),
      isEvolution: true,
    };

    this.weapons.set(evolution.evolvedWeaponId, evolvedWeapon);
    return evolvedWeapon;
  }

  getAvailableEvolutions(game) {
    return getAllEvolutions().filter((evolution) => this.canEvolve(evolution, game));
  }

  canEvolve(evolution, game) {
    if (this.weapons.has(evolution.evolvedWeaponId)) {
      return false;
    }

    const baseWeapon = this.weapons.get(evolution.baseWeaponId);

    if (!baseWeapon || baseWeapon.isEvolution || !this.isMaxLevel(baseWeapon)) {
      return false;
    }

    return game.passiveSystem.ownsPassive(evolution.requiredPassiveId);
  }

  isMaxLevel(weapon) {
    if (weapon.isEvolution) {
      return true;
    }

    return weapon.level >= WEAPON_MAX_LEVEL;
  }

  ownsWeapon(id) {
    return this.weapons.has(id);
  }

  getWeapon(id) {
    return this.weapons.get(id);
  }

  getOrbitingBladeWeapon() {
    return this.getWeapon("celestialBlades") ?? this.getWeapon("orbitingBlade");
  }

  getOwnedWeaponSummary() {
    return [...this.weapons.values()].map((weapon) => {
      const definition = getWeaponDefinition(weapon.id);

      return {
        id: weapon.id,
        name: weapon.name,
        level: weapon.level,
        maxLevel: WEAPON_MAX_LEVEL,
        color: definition?.color ?? (weapon.visualStyle === "celestial" ? "#ffe09a" : "#fff4dc"),
        isMaxLevel: this.isMaxLevel(weapon),
        isEvolved: Boolean(weapon.isEvolution),
        canEvolve: false,
      };
    });
  }

  getAvailableWeaponChoices() {
    return getLevelUpWeaponIds()
      .map((weaponId) => this.buildWeaponChoice(weaponId))
      .filter(Boolean);
  }

  buildWeaponChoice(weaponId) {
    const definition = getWeaponDefinition(weaponId);
    const ownedWeapon = this.weapons.get(weaponId);

    if (!ownedWeapon) {
      return {
        type: "newWeapon",
        weaponId,
        name: definition?.name ?? weaponId,
        description: definition?.description ?? "Adds a new automatic weapon",
        rank: 0,
        maxRank: WEAPON_MAX_LEVEL,
      };
    }

    if (this.isMaxLevel(ownedWeapon)) {
      return null;
    }

    const nextUpgrade = ownedWeapon.upgrades[ownedWeapon.level - 1];

    return {
      type: "weaponUpgrade",
      weaponId: ownedWeapon.id,
      name: `${ownedWeapon.name} Lv ${ownedWeapon.level + 1}`,
      description: nextUpgrade.label,
      rank: ownedWeapon.level,
      maxRank: WEAPON_MAX_LEVEL,
    };
  }

  updateArcaneBolt(weapon, game) {
    if (weapon.timer > 0) {
      return;
    }

    const volleyCount = weapon.volleyCount ?? 1;
    const targets = this.findNearestEnemies(
      game.player.position,
      game.enemies,
      weapon.range,
      volleyCount,
    );

    if (targets.length === 0) {
      return;
    }

    weapon.timer = weapon.cooldown;
    game.feedback.onShoot();

    for (const target of targets) {
      const direction = directionBetween(game.player.position, target.position);

      game.projectiles.push(
        game.projectilePool.acquire(game.player.position.x, game.player.position.y, direction, {
          damage: weapon.projectileDamage,
          speed: weapon.projectileSpeed,
          radius: weapon.projectileRadius,
          maxDistance: weapon.projectileMaxDistance,
          pierce: weapon.pierce,
          visualStyle: weapon.visualStyle ?? "arcane",
        }),
      );
    }
  }

  updateOrbitingBlade(weapon, deltaTime, game) {
    weapon.angle += weapon.orbitSpeed * deltaTime;
    const blades = this.getOrbitingBladePositions(weapon, game.player.position);
    const grid = game.collisionSystem?.enemyGrid;

    for (const [enemy, timer] of weapon.hitTimers) {
      if (enemy.isDead) {
        weapon.hitTimers.delete(enemy);
        continue;
      }

      if (timer > 0) {
        weapon.hitTimers.set(enemy, timer - deltaTime);
      }
    }

    for (const blade of blades) {
      const nearby = grid
        ? grid.query(blade.position, blade.radius + 72, this.enemyScratch)
        : game.enemies;

      for (const enemy of nearby) {
        if (enemy.isDead || (weapon.hitTimers.get(enemy) ?? 0) > 0) {
          continue;
        }

        if (!circlesOverlap(blade, enemy)) {
          continue;
        }

        damageEnemy(game, enemy, weapon.damage, directionBetween(game.player.position, enemy.position));
        weapon.hitTimers.set(enemy, weapon.hitCooldown);

        // Synergy: Storm Blades — blades occasionally call a small lightning strike.
        if (game.synergySystem?.has("stormBlades") && Math.random() < 0.18) {
          damageEnemy(game, enemy, Math.round(weapon.damage * 0.7), { x: 0, y: 1 });
          this.visualEffects.push({
            type: "lightning",
            start: { x: enemy.position.x, y: enemy.position.y - 170 },
            end: { ...enemy.position },
            life: 0.18,
            maxLife: 0.18,
            visualStyle: "lightning",
          });
        }
      }
    }
  }

  updateHolyPulse(weapon, game) {
    if (weapon.timer > 0) {
      return;
    }

    weapon.timer = weapon.cooldown;
    this.visualEffects.push({
      type: "pulse",
      position: { ...game.player.position },
      radius: weapon.radius,
      life: weapon.pulseLife,
      maxLife: weapon.pulseLife,
      visualStyle: weapon.visualStyle ?? "holy",
    });

    let hits = 0;

    for (const enemy of game.enemies) {
      if (enemy.isDead) {
        continue;
      }

      if (distanceBetween(game.player.position, enemy.position) <= weapon.radius + enemy.radius) {
        damageEnemy(game, enemy, weapon.damage, directionBetween(game.player.position, enemy.position));
        hits += 1;

        // Synergy: Divine Static — Lantern Pulse marks enemies for bonus lightning.
        if (game.synergySystem?.has("divineStatic")) {
          enemy.staticMark = 3;
        }
      }
    }

    if (weapon.healOnHit && hits > 0) {
      game.player.health = Math.min(
        game.player.maxHealth,
        game.player.health + weapon.healOnHit * hits,
      );
    }

    // Synergy: Iron Faith — a Lantern Pulse that hits enough foes grants a shield.
    if (game.synergySystem?.has("ironFaith") && hits >= 4) {
      game.player.invincibilityTime = Math.max(game.player.invincibilityTime, 1.1);
    }
  }

  updateLightningMark(weapon, game) {
    if (weapon.timer > 0) {
      return;
    }

    const onScreenEnemies = this.enemyScratch;
    onScreenEnemies.length = 0;

    for (const enemy of game.enemies) {
      if (!enemy.isDead && isOnScreen(enemy, game.camera, game.width, game.height)) {
        onScreenEnemies.push(enemy);
      }
    }

    if (onScreenEnemies.length === 0) {
      return;
    }

    weapon.timer = weapon.cooldown;
    const targets = pickRandomItems(onScreenEnemies, weapon.strikes);
    const hitEnemies = new Set();

    for (const target of targets) {
      this.strikeWithLightning(game, weapon, target, hitEnemies);
    }
  }

  strikeWithLightning(game, weapon, enemy, hitEnemies) {
    if (!enemy || enemy.isDead || hitEnemies.has(enemy)) {
      return;
    }

    hitEnemies.add(enemy);

    // Synergy: Divine Static — marked enemies take bonus lightning damage.
    let strikeDamage = weapon.damage;

    if (game.synergySystem?.has("divineStatic") && enemy.staticMark > 0) {
      strikeDamage = Math.round(weapon.damage * 1.5);
    }

    damageEnemy(game, enemy, strikeDamage, { x: 0, y: 1 });
    this.visualEffects.push({
      type: "lightning",
      start: { x: enemy.position.x, y: enemy.position.y - 190 },
      end: { ...enemy.position },
      life: weapon.effectLife,
      maxLife: weapon.effectLife,
      visualStyle: weapon.visualStyle ?? "lightning",
    });

    // Synergy: Lucky Overcharge — extra chance for lightning to chain again.
    const baseChainChance = weapon.chainChance ?? 0;
    const bonusChainChance = game.synergySystem?.has("luckyOvercharge") ? 0.25 : 0;
    const chainChance = baseChainChance + bonusChainChance;

    if (chainChance <= 0 || Math.random() >= chainChance) {
      return;
    }

    const chainRadius = weapon.chainRadius ?? 220;
    const chainTarget = this.findChainTarget(enemy, game.enemies, chainRadius, hitEnemies);

    if (chainTarget) {
      this.strikeWithLightning(game, weapon, chainTarget, hitEnemies);
    }
  }

  findChainTarget(sourceEnemy, enemies, chainRadius, hitEnemies) {
    let nearestEnemy = null;
    let nearestDistance = chainRadius;

    for (const enemy of enemies) {
      if (enemy.isDead || hitEnemies.has(enemy) || enemy === sourceEnemy) {
        continue;
      }

      const distance = distanceBetween(sourceEnemy.position, enemy.position);

      if (distance <= nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    }

    return nearestEnemy;
  }

  updateVisualEffects(deltaTime) {
    let writeIndex = 0;

    for (const effect of this.visualEffects) {
      effect.life -= deltaTime;

      if (effect.life > 0) {
        this.visualEffects[writeIndex] = effect;
        writeIndex += 1;
      }
    }

    this.visualEffects.length = writeIndex;
  }

  getOrbitingBladePositions(weapon, playerPosition) {
    const blades = this.bladeScratch;
    blades.length = 0;

    for (let index = 0; index < weapon.bladeCount; index += 1) {
      const angle = weapon.angle + (Math.PI * 2 * index) / weapon.bladeCount;
      blades.push({
        position: {
          x: playerPosition.x + Math.cos(angle) * weapon.radius,
          y: playerPosition.y + Math.sin(angle) * weapon.radius,
        },
        radius: weapon.bladeRadius,
        visualStyle: weapon.visualStyle ?? "blade",
      });
    }

    return blades;
  }

  findNearestEnemies(playerPosition, enemies, range, count) {
    const candidates = [];

    for (const enemy of enemies) {
      if (enemy.isDead) {
        continue;
      }

      const distance = distanceBetween(playerPosition, enemy.position);

      if (distance <= range) {
        candidates.push({ enemy, distance });
      }
    }

    candidates.sort((left, right) => left.distance - right.distance);
    return candidates.slice(0, count).map((entry) => entry.enemy);
  }

  findNearestEnemy(playerPosition, enemies, range) {
    return this.findNearestEnemies(playerPosition, enemies, range, 1)[0] ?? null;
  }
}

function isOnScreen(enemy, camera, width, height) {
  const screenPosition = camera.worldToScreen(enemy.position);
  const padding = 120;

  return (
    screenPosition.x >= -padding &&
    screenPosition.x <= width + padding &&
    screenPosition.y >= -padding &&
    screenPosition.y <= height + padding
  );
}

function pickRandomItems(items, count) {
  const pool = [...items];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, count);
}
