const GOD_MODE_DAMAGE_MULTIPLIER = 99999;

export function isGodMode(game) {
  return Boolean(game?.godMode);
}

export function normalizeGodModeCommand(command) {
  return command.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getGodModeDamage(game, baseDamage, enemy) {
  const scaled = Math.round(baseDamage * GOD_MODE_DAMAGE_MULTIPLIER);
  return Math.max(scaled, enemy.health + enemy.maxHealth);
}

export function getGodModeStatusLabel(game) {
  if (!game?.godMode) {
    return "";
  }

  if (game.timeScale > 1) {
    return `GOD MODE x${game.timeScale}`;
  }

  return "GOD MODE";
}

export function applyGodModeToPlayer(game) {
  if (!isGodMode(game) || !game.player) {
    if (game?.player) {
      game.player.godMode = false;
    }
    return;
  }

  game.player.godMode = true;
  game.player.isDead = false;
  game.player.health = game.player.maxHealth;
  game.player.invincibilityTime = 0;
}
