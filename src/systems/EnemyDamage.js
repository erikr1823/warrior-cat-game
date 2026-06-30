import { directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { getGodModeDamage, isGodMode } from "../debug/GodMode.js";
import { DamageNumber } from "../entities/DamageNumber.js";
import { XPGem } from "../entities/XPGem.js";
import { Chest } from "../entities/Chest.js";
import { CoinPickup } from "../entities/CoinPickup.js";
import { onEnemyModifierDeath } from "../config/EnemyModifiers.js";

export function damageEnemy(game, enemy, damage, direction = null) {
  if (enemy.isDead) {
    return false;
  }

  const hitDirection = direction ?? directionBetween(game.player.position, enemy.position);
  const runMultiplier = game.runModifiers?.damageMultiplier ?? 1;
  const traitMultiplier = game.traitSystem?.getCombatDamageMultiplier(game, enemy) ?? 1;
  const synergyMultiplier = game.synergySystem?.getDamageMultiplier() ?? 1;
  const resistance = enemy.damageTakenMultiplier ?? 1;
  const baseDamage = Math.max(
    1,
    Math.round(damage * runMultiplier * traitMultiplier * synergyMultiplier * resistance),
  );
  const finalDamage = isGodMode(game) ? getGodModeDamage(game, baseDamage, enemy) : baseDamage;

  // Feed Arcane Overflow (trait) hit counter; suppressed during its own burst.
  game.traitSystem?.registerWeaponHit();

  enemy.takeDamage(finalDamage, hitDirection);
  game.damageNumbers.push(
    new DamageNumber(
      enemy.position.x,
      enemy.position.y - enemy.renderSize * GameConfig.feedback.damageNumberEnemyYOffsetRatio,
      finalDamage,
    ),
  );

  if (!enemy.isDead) {
    game.feedback.onEnemyHit(enemy);
    return false;
  }

  game.killCount += 1;
  game.feedback.onEnemyDeath(enemy);

  if (enemy.isBoss) {
    awardBossRewards(game, enemy);
    return true;
  }

  // Death effects for elite modifiers (Splitter spawns, Exploder hazard).
  onEnemyModifierDeath(enemy, game);

  if (enemy.isEliteModified) {
    // Elites drop a larger gem plus a guaranteed coin.
    const eliteTier = GameConfig.eliteModifiers?.xpReward ?? "green";
    game.xpGems.push(new XPGem(enemy.position.x, enemy.position.y, eliteTier));
    game.coinPickups.push(new CoinPickup(enemy.position.x + 12, enemy.position.y, GameConfig.coins.enemyDropMax));
    return true;
  }

  game.xpGems.push(new XPGem(enemy.position.x, enemy.position.y, chooseGemTier()));
  maybeDropCoin(game, enemy.position.x, enemy.position.y);
  return true;
}

function awardBossRewards(game, enemy) {
  game.bossDefeatedCount += 1;
  game.spawner.getBossDirector().onBossDefeated(enemy);
  game.chests.push(new Chest(enemy.position.x, enemy.position.y));

  // Bonus XP burst: a ring of orbs so the kill clearly accelerates leveling.
  const bonusOrbs = GameConfig.bosses?.bonusXpOrbs ?? 6;

  for (let index = 0; index < bonusOrbs; index += 1) {
    const angle = (Math.PI * 2 * index) / bonusOrbs;
    const tier = index % 2 === 0 ? "red" : "green";
    game.xpGems.push(
      new XPGem(
        enemy.position.x + Math.cos(angle) * 30,
        enemy.position.y + Math.sin(angle) * 30,
        tier,
      ),
    );
  }

  game.coinPickups.push(
    new CoinPickup(enemy.position.x + 18, enemy.position.y + 12, GameConfig.coins.bossDropAmount),
  );

  // First boss kill of the run guarantees an extra chest (strong reward).
  if (game.bossDefeatedCount === 1 && GameConfig.bosses?.firstKillGuaranteedChest) {
    game.chests.push(new Chest(enemy.position.x - 40, enemy.position.y + 8));
  }

  game.startScreenShake(
    GameConfig.feedback.screenShakeBossAmount,
    GameConfig.feedback.screenShakeBossDuration,
  );
}

function maybeDropCoin(game, x, y) {
  // Gem Hunger trait: trades coin drops for faster leveling.
  const coinChance = game.traitSystem?.has("gemHunger")
    ? GameConfig.coins.enemyDropChance * 0.55
    : GameConfig.coins.enemyDropChance;

  if (Math.random() >= coinChance) {
    return;
  }

  const amount =
    GameConfig.coins.enemyDropMin +
    Math.floor(Math.random() * (GameConfig.coins.enemyDropMax - GameConfig.coins.enemyDropMin + 1));

  game.coinPickups.push(new CoinPickup(x, y, amount));
}

function chooseGemTier() {
  const roll = Math.random();
  const chances = GameConfig.xpGems.dropChances;

  if (roll < chances.red) {
    return "red";
  }

  if (roll < chances.red + chances.green) {
    return "green";
  }

  return "small";
}
