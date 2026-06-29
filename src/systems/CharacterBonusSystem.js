import { getCharacterDefinition } from "../config/CharacterDefinitions.js";

export function applyCharacterToRun(game) {
  const character = getCharacterDefinition(game.saveData?.selectedCharacter ?? "puzas");
  const bonuses = character.bonuses ?? {};

  if (bonuses.moveSpeedMultiplier) {
    game.player.speed *= bonuses.moveSpeedMultiplier;
  }

  if (bonuses.damageMultiplier) {
    game.runModifiers.damageMultiplier *= bonuses.damageMultiplier;
  }

  if (bonuses.maxHealthBonus) {
    game.player.maxHealth += bonuses.maxHealthBonus;
    game.player.health = game.player.maxHealth;
  }
}
