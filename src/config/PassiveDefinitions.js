import { GameConfig } from "./GameConfig.js";

export const PASSIVE_MAX_LEVEL = GameConfig.passives.maxLevel;

export const PASSIVE_DEFINITIONS = [
  {
    id: "spellbook",
    name: "Codex of Haste",
    color: "#9b7dff",
    description: "Shorter intervals between archive tools.",
  },
  {
    id: "powerStone",
    name: "Inkstone",
    color: "#ff7a7a",
    description: "Sharper ink and brighter lantern burns.",
  },
  {
    id: "windBoots",
    name: "Softstep Slippers",
    color: "#7ee787",
    description: "Glide quietly between shelves.",
  },
  {
    id: "magnetCharm",
    name: "Recall Rune",
    color: "#43a9ff",
    description: "Memory shards drift toward your lantern.",
  },
  {
    id: "ironHeart",
    name: "Threadbound Heart",
    color: "#ffb86a",
    description: "Extra vitality stitched into your coat.",
  },
  {
    id: "cloverCoin",
    name: "Lucky Quill",
    color: "#61e37c",
    description: "Better odds inside catalog chests.",
  },
];

export function getPassiveDefinition(id) {
  return PASSIVE_DEFINITIONS.find((passive) => passive.id === id);
}

export function getPassiveConfig(id) {
  return GameConfig.passives[id];
}

export function getAllPassiveIds() {
  return PASSIVE_DEFINITIONS.map((passive) => passive.id);
}

export function getPassiveLevelLabel(id) {
  return GameConfig.passives[id]?.levelLabel ?? "Power up";
}
