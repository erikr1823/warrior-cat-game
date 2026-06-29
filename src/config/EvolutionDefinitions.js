import { GameConfig } from "./GameConfig.js";

const WEAPON_MAX_LEVEL = GameConfig.weapons.maxLevel;

export const WEAPON_EVOLUTIONS = [
  {
    id: "arcaneStorm",
    baseWeaponId: "arcaneBolt",
    evolvedWeaponId: "arcaneStorm",
    requiredPassiveId: "spellbook",
    requiredLevel: WEAPON_MAX_LEVEL,
    evolvedName: "Tempest Codex",
    description: "A storm of ink volleys tears through whole shelves of Unwritten.",
    accent: "#b98cff",
    color: "#d4b4ff",
    icon: "📖",
  },
  {
    id: "celestialBlades",
    baseWeaponId: "orbitingBlade",
    evolvedWeaponId: "celestialBlades",
    requiredPassiveId: "powerStone",
    requiredLevel: WEAPON_MAX_LEVEL,
    evolvedName: "Living Margins",
    description: "Sentient page-edges whirl around you like razor bookmarks.",
    accent: "#fff4dc",
    color: "#ffe09a",
    icon: "📎",
  },
  {
    id: "divineNova",
    baseWeaponId: "holyPulse",
    evolvedWeaponId: "divineNova",
    requiredPassiveId: "ironHeart",
    requiredLevel: WEAPON_MAX_LEVEL,
    evolvedName: "Concord Dawn",
    description: "A dawn-bright lantern burst mends you with every scorch.",
    accent: "#ffd27e",
    color: "#fff0a8",
    icon: "🕯",
  },
  {
    id: "thunderCrown",
    baseWeaponId: "lightningMark",
    evolvedWeaponId: "thunderCrown",
    requiredPassiveId: "cloverCoin",
    requiredLevel: WEAPON_MAX_LEVEL,
    evolvedName: "Storm Glossary",
    description: "Ink lightning leaps between marked words across the wing.",
    accent: "#6ecbff",
    color: "#43a9ff",
    icon: "⚡",
  },
];

export function getAllEvolutions() {
  return WEAPON_EVOLUTIONS;
}

export function getEvolutionByEvolvedId(evolvedWeaponId) {
  return WEAPON_EVOLUTIONS.find((evolution) => evolution.evolvedWeaponId === evolvedWeaponId);
}

export function getEvolutionForBaseWeapon(baseWeaponId) {
  return WEAPON_EVOLUTIONS.find((evolution) => evolution.baseWeaponId === baseWeaponId);
}
