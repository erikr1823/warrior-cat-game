export const DEFAULT_CHARACTER_ID = "puzas";

export const PLAYABLE_CHARACTERS = [
  {
    id: "puzas",
    name: "Puzas",
    title: "Greencloak Scout",
    description: "Orange tabby in a green cloak. Quick paws on the stacks.",
    accent: "#7fd47a",
    bonuses: {
      moveSpeedMultiplier: 1.08,
    },
  },
  {
    id: "kiki",
    name: "Kiki",
    title: "Ashfang Slayer",
    description: "Grey hunter with crimson war paint. Hits harder.",
    accent: "#ff7a7a",
    bonuses: {
      damageMultiplier: 1.08,
    },
  },
  {
    id: "pupse",
    name: "Pupse",
    title: "Sunplate Knight",
    description: "Armored ginger guardian. Built to endure.",
    accent: "#ffd27e",
    bonuses: {
      maxHealthBonus: 12,
    },
  },
];

export function getCharacterDefinition(id) {
  return PLAYABLE_CHARACTERS.find((character) => character.id === id) ?? PLAYABLE_CHARACTERS[0];
}

export function getAllCharacterIds() {
  return PLAYABLE_CHARACTERS.map((character) => character.id);
}

export function isValidCharacterId(id) {
  return PLAYABLE_CHARACTERS.some((character) => character.id === id);
}
