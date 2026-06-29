import { directionBetween } from "../core/MathUtils.js";
import { GameConfig } from "../config/GameConfig.js";
import { DamageNumber } from "../entities/DamageNumber.js";
import { XPGem } from "../entities/XPGem.js";
import { Chest } from "../entities/Chest.js";
import { CoinPickup } from "../entities/CoinPickup.js";

export function damageEnemy(game, enemy, damage, direction = null) {
  if (enemy.isDead) {
    return false;
  }

  const hitDirection = direction ?? directionBetween(game.player.position, enemy.position);
  const finalDamage = Math.round(damage * (game.runModifiers?.damageMultiplier ?? 1));

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
    game.bossDefeatedCount += 1;
    game.chests.push(new Chest(enemy.position.x, enemy.position.y));
    game.xpGems.push(new XPGem(enemy.position.x, enemy.position.y - 24, "red"));
    game.coinPickups.push(
      new CoinPickup(enemy.position.x + 18, enemy.position.y + 12, GameConfig.coins.bossDropAmount),
    );
    game.startScreenShake(
      GameConfig.feedback.screenShakeBossAmount,
      GameConfig.feedback.screenShakeBossDuration,
    );
    return true;
  }

  game.xpGems.push(new XPGem(enemy.position.x, enemy.position.y, chooseGemTier()));
  maybeDropCoin(game, enemy.position.x, enemy.position.y);
  return true;
}

function maybeDropCoin(game, x, y) {
  if (Math.random() >= GameConfig.coins.enemyDropChance) {
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
