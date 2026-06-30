// Run Traits — build-defining upgrades that change HOW you play, not just stats.
//
// Each trait is data-driven. The "apply" hook (static one-time effects) and the
// runtime hooks live in src/systems/TraitSystem.js, keyed by trait id. Traits
// appear in level-up choices less often than normal upgrades and are capped so
// the player cannot stack too many. See GameConfig.traits for tuning + caps.

export const TRAIT_DEFINITIONS = [
  {
    id: "glassOath",
    name: "Glass Oath",
    color: "#ff7a7a",
    description: "+35% weapon damage, but -20% max HP. High risk, high reward.",
    tradeoff: "Fragile but deadly.",
  },
  {
    id: "heavyArmor",
    name: "Heavy Armor",
    color: "#9fb4c8",
    description: "+30 max HP, but -8% movement speed.",
    tradeoff: "Tankier, slower.",
  },
  {
    id: "lastStand",
    name: "Last Stand",
    color: "#ffb86a",
    description: "Below 30% HP: +30% damage and faster weapon cooldowns.",
    tradeoff: "Strongest at the edge of death.",
  },
  {
    id: "gemHunger",
    name: "Gem Hunger",
    color: "#61e37c",
    description: "Greatly increased XP pickup range, but enemies drop fewer coins.",
    tradeoff: "Levels fast, earns less.",
  },
  {
    id: "bossHunter",
    name: "Boss Hunter",
    color: "#ff9a5a",
    description: "+30% damage to bosses and elite enemies.",
    tradeoff: "Specialist against big threats.",
  },
  {
    id: "executionMark",
    name: "Execution Mark",
    color: "#e85a8a",
    description: "Enemies below 20% HP take +60% bonus damage.",
    tradeoff: "Finishes weakened foes fast.",
  },
  {
    id: "bloodPrice",
    name: "Blood Price",
    color: "#d4504a",
    description: "Chests give stronger rewards, but cost some HP to open (unless low HP).",
    tradeoff: "Pay in blood for better loot.",
  },
  {
    id: "momentum",
    name: "Momentum",
    color: "#7ec8ff",
    description: "Moving builds up to +25% damage. Standing still lets it decay.",
    tradeoff: "Reward for staying mobile.",
  },
  {
    id: "arcaneOverflow",
    name: "Arcane Overflow",
    color: "#b98cff",
    description: "Every few weapon hits, release a small arcane burst around you.",
    tradeoff: "Passive extra damage.",
  },
  {
    id: "safeRecovery",
    name: "Safe Recovery",
    color: "#7fd4ff",
    description: "After taking damage, gain a brief speed boost and longer invincibility.",
    tradeoff: "Easier to escape after a hit.",
  },
];

export function getTraitDefinition(id) {
  return TRAIT_DEFINITIONS.find((trait) => trait.id === id);
}

export function getAllTraitIds() {
  return TRAIT_DEFINITIONS.map((trait) => trait.id);
}
