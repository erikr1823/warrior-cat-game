// Weapon/passive Synergies — rare, build-defining upgrades that ONLY appear when
// the player owns specific combinations. They do not replace evolutions; they are
// extra cross-weapon effects. Effect hooks live in WeaponSystem / CollisionSystem,
// gated by game.synergySystem.has(id).
//
// requires:
//   weaponGroups: array of OR-groups; the player must own at least one id in EACH group.
//   passives:     list of passive ids the player must own (ALL).

export const SYNERGY_DEFINITIONS = [
  {
    id: "stormBlades",
    name: "Storm Blades",
    color: "#7ec8ff",
    description: "Orbiting blades occasionally call down a small lightning strike on what they hit.",
    requires: {
      weaponGroups: [
        ["orbitingBlade", "celestialBlades"],
        ["lightningMark", "thunderCrown"],
      ],
      passives: [],
    },
  },
  {
    id: "divineStatic",
    name: "Divine Static",
    color: "#ffd27e",
    description: "Lantern Pulse marks enemies. Marked enemies take bonus lightning damage.",
    requires: {
      weaponGroups: [
        ["holyPulse", "divineNova"],
        ["lightningMark", "thunderCrown"],
      ],
      passives: [],
    },
  },
  {
    id: "arcaneSerration",
    name: "Arcane Serration",
    color: "#c4a0ff",
    description: "Ink projectiles have a chance to split into blade shards on hit.",
    requires: {
      weaponGroups: [
        ["arcaneBolt", "arcaneStorm"],
        ["orbitingBlade", "celestialBlades"],
      ],
      passives: [],
    },
  },
  {
    id: "magnetizedPower",
    name: "Magnetized Power",
    color: "#61e37c",
    description: "Picking up memory shards briefly increases all weapon damage.",
    requires: {
      weaponGroups: [],
      passives: ["magnetCharm", "powerStone"],
    },
  },
  {
    id: "ironFaith",
    name: "Iron Faith",
    color: "#ffb86a",
    description: "Lantern Pulse grants a short protective shield if it hits enough enemies.",
    requires: {
      weaponGroups: [["holyPulse", "divineNova"]],
      passives: ["ironHeart"],
    },
  },
  {
    id: "luckyOvercharge",
    name: "Lucky Overcharge",
    color: "#a0ffd0",
    description: "Lightning strikes have an extra chance to chain to another enemy.",
    requires: {
      weaponGroups: [["lightningMark", "thunderCrown"]],
      passives: ["cloverCoin"],
    },
  },
];

export function getSynergyDefinition(id) {
  return SYNERGY_DEFINITIONS.find((synergy) => synergy.id === id);
}
