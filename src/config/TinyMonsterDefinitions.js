// 64x Tiny Monsters (Pixel-Deck) — static 32×32 sprites imported from
// src/assets/imported/enemies/tinyMonsters/{fileName}.png

const RENDER_SIZE = 112;
const COLLISION = 40;

const ARCHETYPES = {
  slime: { maxHealth: 28, speed: 98, damage: 7, renderSize: RENDER_SIZE, collisionRadius: COLLISION },
  rat: { maxHealth: 20, speed: 138, damage: 6, renderSize: 108, collisionRadius: 34 },
  bat: { maxHealth: 18, speed: 152, damage: 6, renderSize: 106, collisionRadius: 32 },
  spider: { maxHealth: 24, speed: 118, damage: 7, renderSize: 110, collisionRadius: 36 },
  worm: { maxHealth: 32, speed: 88, damage: 8, renderSize: 114, collisionRadius: 38 },
  ghost: { maxHealth: 30, speed: 104, damage: 7, renderSize: 112, collisionRadius: 38 },
  goblin: { maxHealth: 26, speed: 112, damage: 7, renderSize: 110, collisionRadius: 36 },
  imp: { maxHealth: 34, speed: 108, damage: 8, renderSize: 112, collisionRadius: 38 },
  eye: { maxHealth: 36, speed: 96, damage: 8, renderSize: 114, collisionRadius: 40 },
  skeleton: { maxHealth: 38, speed: 92, damage: 8, renderSize: 114, collisionRadius: 40 },
  golem: { maxHealth: 62, speed: 72, damage: 10, renderSize: 120, collisionRadius: 46 },
  mushroom: { maxHealth: 40, speed: 86, damage: 8, renderSize: 116, collisionRadius: 42 },
  mimic: { maxHealth: 44, speed: 94, damage: 9, renderSize: 116, collisionRadius: 42 },
  demon: { maxHealth: 48, speed: 100, damage: 9, renderSize: 118, collisionRadius: 42 },
  lich: { maxHealth: 54, speed: 88, damage: 10, renderSize: 118, collisionRadius: 44 },
};

function titleCase(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugToId(slug) {
  return slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/** Infer combat stats from the monster filename. */
function archetypeForSlug(slug) {
  if (slug.includes("slime")) return "slime";
  if (slug.includes("rat")) return "rat";
  if (slug.includes("bat")) return "bat";
  if (slug.includes("spider")) return "spider";
  if (slug.includes("worm")) return "worm";
  if (slug.includes("ghost") || slug.includes("spirit") || slug.includes("soul")) return "ghost";
  if (slug.includes("goblin")) return "goblin";
  if (slug.includes("imp") || slug.includes("demon")) return slug.includes("demon") ? "demon" : "imp";
  if (slug.includes("eye")) return "eye";
  if (slug.includes("skeleton") || slug.includes("bone")) return "skeleton";
  if (slug.includes("golem")) return "golem";
  if (slug.includes("mushroom") || slug.includes("fungus") || slug.includes("spore")) return "mushroom";
  if (slug.includes("mimic")) return "mimic";
  if (slug.includes("lich")) return "lich";
  return "slime";
}

const TINY_MONSTER_SLUGS = [
  "green-slime",
  "blue-slime",
  "red-slime",
  "poison-slime",
  "metal-slime",
  "sewer-rat",
  "plague-rat",
  "giant-rat",
  "armored-rat",
  "bone-rat",
  "cave-bat",
  "fire-bat",
  "ice-bat",
  "poison-bat",
  "vampire-bat",
  "cave-spider",
  "fire-spider",
  "ice-spider",
  "poison-spider",
  "crystal-spider",
  "bone-worm",
  "rot-worm",
  "sand-worm",
  "lava-worm",
  "giant-worm",
  "small-ghost",
  "shadow-ghost",
  "lantern-ghost",
  "lost-soul",
  "angry-spirit",
  "tiny-goblin",
  "goblin-thief",
  "goblin-archer",
  "goblin-bomber",
  "goblin-shaman",
  "mushroom-goblin",
  "fire-imp",
  "ice-imp",
  "poison-imp",
  "horned-imp",
  "tiny-demon",
  "floating-eye",
  "blood-eye",
  "fire-eye",
  "frost-eye",
  "shadow-eye",
  "baby-skeleton",
  "skeleton-head",
  "skeleton-crawler",
  "bone-pile-monster",
  "mini-golem",
  "mud-golem",
  "stone-golem",
  "scrap-golem",
  "crystal-golem",
  "mushroom-creature",
  "poison-mushroom",
  "walking-fungus",
  "spore-beast",
  "mimic-coin",
  "mimic-potion",
  "mimic-skull",
  "mimic-chest",
  "tiny-lich",
];

export const TINY_MONSTER_DEFINITIONS = Object.fromEntries(
  TINY_MONSTER_SLUGS.map((slug) => {
    const id = slugToId(slug);
    const archetype = archetypeForSlug(slug);
    const stats = ARCHETYPES[archetype];

    return [
      id,
      {
        id,
        slug,
        name: titleCase(slug),
        spritePath: `./src/assets/imported/enemies/tinyMonsters/${slug}.png`,
        artPack: "tinyMonsters",
        ...stats,
      },
    ];
  }),
);

export function getTinyMonsterDefinition(id) {
  return TINY_MONSTER_DEFINITIONS[id] ?? null;
}

export function getAllTinyMonsterIds() {
  return TINY_MONSTER_SLUGS.map(slugToId);
}

/** Weak → strong order for rotation scheduling. */
export const TINY_MONSTER_ROTATION_ORDER = [...getAllTinyMonsterIds()];
