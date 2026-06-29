import { GameConfig } from "./GameConfig.js";
import { getEvolutionByEvolvedId } from "./EvolutionDefinitions.js";

export const WEAPON_MAX_LEVEL = GameConfig.weapons.maxLevel;
export const STARTER_WEAPON_ID = GameConfig.weapons.starterWeapon;

export const WEAPON_DEFINITIONS = [
  {
    id: "arcaneBolt",
    name: "Ink Flick",
    role: "single-target",
    color: "#c4a0ff",
    description: "Flings condensed ink at the nearest Unwritten.",
    evolution: {
      id: "arcaneStorm",
      requiredPassiveId: "spellbook",
      requiredLevel: WEAPON_MAX_LEVEL,
      name: "Tempest Codex",
    },
  },
  {
    id: "orbitingBlade",
    name: "Margin Ring",
    role: "orbit",
    color: "#f0ead8",
    description: "Paper shards orbit you and slice nearby foes.",
    evolution: {
      id: "celestialBlades",
      requiredPassiveId: "powerStone",
      requiredLevel: WEAPON_MAX_LEVEL,
      name: "Living Margins",
    },
  },
  {
    id: "holyPulse",
    name: "Lantern Pulse",
    role: "area",
    color: "#ffc86a",
    description: "Your story-lantern flares, scorching nearby ink.",
    evolution: {
      id: "divineNova",
      requiredPassiveId: "ironHeart",
      requiredLevel: WEAPON_MAX_LEVEL,
      name: "Concord Dawn",
    },
  },
  {
    id: "lightningMark",
    name: "Quill Arc",
    role: "random-strike",
    color: "#7ec8ff",
    description: "A copper quill marks random targets with ink lightning.",
    evolution: {
      id: "thunderCrown",
      requiredPassiveId: "cloverCoin",
      requiredLevel: WEAPON_MAX_LEVEL,
      name: "Storm Glossary",
    },
  },
];

export function getWeaponDefinition(id) {
  const baseDefinition = WEAPON_DEFINITIONS.find((weapon) => weapon.id === id);

  if (baseDefinition) {
    return baseDefinition;
  }

  const evolution = getEvolutionByEvolvedId(id);

  if (!evolution) {
    return null;
  }

  return {
    id: evolution.evolvedWeaponId,
    name: evolution.evolvedName,
    color: evolution.color,
    description: evolution.description,
    isEvolution: true,
    evolvesFrom: evolution.baseWeaponId,
  };
}

export function getWeaponConfig(id) {
  return GameConfig.weapons[id];
}

export function getAllWeaponIds() {
  return WEAPON_DEFINITIONS.map((weapon) => weapon.id);
}

export function getLevelUpWeaponIds() {
  return getAllWeaponIds();
}
