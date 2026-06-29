export const META_UPGRADE_DEFINITIONS = [
  {
    id: "maxHealth",
    name: "Threadbound Ledger",
    description: "Max HP +5 per level",
    baseCost: 40,
    costMultiplier: 1.5,
    maxLevel: 25,
  },
  {
    id: "damage",
    name: "Inked Quill",
    description: "Damage +5% per level",
    baseCost: 55,
    costMultiplier: 1.55,
    maxLevel: 20,
  },
  {
    id: "moveSpeed",
    name: "Softstep Slippers",
    description: "Move speed +3% per level",
    baseCost: 45,
    costMultiplier: 1.5,
    maxLevel: 20,
  },
  {
    id: "xpGain",
    name: "Studious Echo",
    description: "Memory shard gain +5% per level",
    baseCost: 50,
    costMultiplier: 1.52,
    maxLevel: 20,
  },
  {
    id: "pickupRange",
    name: "Recall Rune",
    description: "Pickup range +5% per level",
    baseCost: 35,
    costMultiplier: 1.48,
    maxLevel: 20,
  },
  {
    id: "startingCoins",
    name: "Memory Stipend",
    description: "Start each patrol with +10 memory coins per level",
    baseCost: 60,
    costMultiplier: 1.6,
    maxLevel: 10,
    optional: true,
  },
];

export function getMetaUpgradeDefinition(id) {
  return META_UPGRADE_DEFINITIONS.find((upgrade) => upgrade.id === id);
}

export function getMetaUpgradeCost(definition, currentLevel) {
  if (currentLevel >= definition.maxLevel) {
    return null;
  }

  return Math.floor(definition.baseCost * definition.costMultiplier ** currentLevel);
}
