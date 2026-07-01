/**
 * Per-biome environment tuning: decoration density, clusters, floor overlays.
 * Master density knob: GameConfig.world.decorationDensity
 */
export const BIOME_ENVIRONMENTS = {
  castleCourtyard: {
    decorationsPerChunk: [2, 4],
    densityMultiplier: 0.52,
    clusterChance: 0.1,
    clusters: ["pillarCluster", "ruinWallCluster"],
    floorOverlays: ["courtyardCrack", "dirtPatch", "stain", "weedSpeckle"],
    overlayChance: 0.14,
    preferEdgePlacement: 0.72,
  },
  moonlitForest: {
    decorationsPerChunk: [2, 5],
    densityMultiplier: 0.48,
    clusterChance: 0.1,
    clusters: ["deadTreeCluster", "moonlitRootCluster"],
    floorOverlays: ["leafScatter", "mossPatch", "stain", "moonlitSpeckle"],
    overlayChance: 0.16,
    preferEdgePlacement: 0.78,
  },
  graveyard: {
    decorationsPerChunk: [2, 5],
    densityMultiplier: 0.5,
    clusterChance: 0.12,
    clusters: ["graveCluster", "deadTreeCluster"],
    chapelChance: 0.015,
    floorOverlays: ["graveDirt", "fogPatch", "stain"],
    overlayChance: 0.13,
    preferEdgePlacement: 0.75,
  },
  royalArchive: {
    decorationsPerChunk: [2, 4],
    densityMultiplier: 0.46,
    clusterChance: 0.11,
    clusters: ["archiveShelfCluster"],
    floorOverlays: ["woodInlay", "arcaneRune", "paperDebris", "warmStain"],
    overlayChance: 0.12,
    preferEdgePlacement: 0.8,
  },
  frostBarrow: {
    decorationsPerChunk: [2, 5],
    densityMultiplier: 0.48,
    clusterChance: 0.11,
    clusters: ["frozenRuinCluster", "iceCrystalCluster"],
    floorOverlays: ["snowPatch", "iceCrack", "frostStain"],
    overlayChance: 0.15,
    preferEdgePlacement: 0.74,
  },
  summerForest: {
    decorationsPerChunk: [3, 7],
    densityMultiplier: 0.58,
    clusterChance: 0.08,
    clusters: ["deadTreeCluster"],
    floorOverlays: ["leafScatter", "dirtPatch", "stain"],
    overlayChance: 0.12,
    preferEdgePlacement: 0.55,
  },
  ancientCrypt: {
    decorationsPerChunk: [2, 5],
    densityMultiplier: 0.52,
    clusterChance: 0.09,
    clusters: ["graveCluster"],
    floorOverlays: ["stain", "dirtPatch"],
    overlayChance: 0.1,
    preferEdgePlacement: 0.6,
  },
  cursedRuins: {
    decorationsPerChunk: [3, 6],
    densityMultiplier: 0.58,
    clusterChance: 0.1,
    clusters: ["ruinWallCluster", "pillarCluster"],
    floorOverlays: ["courtyardCrack", "stain"],
    overlayChance: 0.12,
    preferEdgePlacement: 0.62,
  },
};

export const DEFAULT_BIOME_ENVIRONMENT = {
  decorationsPerChunk: [3, 6],
  densityMultiplier: 0.55,
  clusterChance: 0.08,
  clusters: ["ruinWallCluster"],
  floorOverlays: ["stain", "dirtPatch"],
  overlayChance: 0.1,
  preferEdgePlacement: 0.5,
};

export function getBiomeEnvironment(worldId) {
  return BIOME_ENVIRONMENTS[worldId] ?? DEFAULT_BIOME_ENVIRONMENT;
}
