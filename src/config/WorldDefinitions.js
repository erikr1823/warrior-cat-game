export const WORLD_DEFINITIONS = [
  {
    id: "pixelCrawler",
    name: "Dungeon Stacks",
    subtitle: "Pixel Crawler · stone halls",
    enemyPack: "pixelCrawler",
    tilePalette: "dungeon",
    announcementSuffix: "The stacks shift to ancient stone.",
  },
  {
    id: "pixelCrawlerDeep",
    name: "Deep Shelves",
    subtitle: "Pixel Crawler · moss vaults",
    enemyPack: "pixelCrawler",
    tilePalette: "dungeonMoss",
    announcementSuffix: "Moss creeps between the shelves.",
  },
  {
    id: "tinyMonsters",
    name: "Margin Crawl",
    subtitle: "Tiny Monsters · scurrying ink",
    enemyPack: "tinyMonsters",
    tilePalette: "margins",
    announcementSuffix: "Small horrors spill from the margins.",
  },
  {
    id: "darkFantasy",
    name: "Shadow Wing",
    subtitle: "Dark Fantasy · bat roosts",
    enemyPack: "darkFantasy",
    tilePalette: "shadow",
    announcementSuffix: "Shadows nest in the rafters.",
  },
  {
    id: "cursedSpirits",
    name: "Cursed Annex",
    subtitle: "Cursed Spirits · burning pages",
    enemyPack: "cursedSpirits",
    tilePalette: "cursed",
    announcementSuffix: "Cursed spirits wake in the annex.",
  },
  {
    id: "unwritten",
    name: "Unwritten Tide",
    subtitle: "Ink Procedural · the blank deep",
    enemyPack: "ink",
    tilePalette: "unwritten",
    announcementSuffix: "The Unwritten tide rises.",
  },
];

export function getWorldDefinition(id) {
  return WORLD_DEFINITIONS.find((world) => world.id === id) ?? WORLD_DEFINITIONS[0];
}

export function getWorldForWave(wave) {
  if (wave?.worldId) {
    return getWorldDefinition(wave.worldId);
  }

  return WORLD_DEFINITIONS[0];
}
