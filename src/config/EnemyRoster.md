# Enemy spawn roster

This file documents which enemies are allowed in live spawns vs kept in config only.
See also `WaveDefinitions.js` (regular waves) and `GameConfig.bosses` (boss timer).

## ACTIVE ENEMIES

These have working imported art and are allowed in `WaveDefinitions.spawnWeights`.

| ID | Role | Notes |
|----|------|-------|
| `slime` | Normal wave enemy | Skeleton/slime base visual (`tinyMonsters` pack). Spawns in every biome. |
| `zombie` | Normal wave enemy | Imported directional sheet. Biome II+. |
| `brainZombie` | Normal wave enemy | Imported directional sheet. Biome VIII+. |
| `vikingUndead` | Normal wave enemy | Imported directional sheet. Biome IX+. |
| `skeletonUndead` | Normal wave enemy | Imported directional sheet. Biome X+. |
| `popstarUndead` | Normal wave enemy | Imported directional sheet. Biome XI. |
| `knightUndead` | Normal wave enemy | Imported directional sheet. Biome XI. |
| `greenDragon` | Normal wave enemy | Imported directional sheet. Biome III. |
| `skeletonCaptain` | Timed boss | Enlarged slime visual (`visualType: "slime"`, ~1.8× scale). Spawned by `BossDirector` every 120s from 2:00. |

## DISABLED / DO NOT SPAWN YET

These types may remain in `GameConfig.enemies` for future use. Do **not** add them to `WaveDefinitions.spawnWeights` or `GameConfig.bosses.activeType` — they use old/ugly procedural art that was retired.

- `bat`
- `brute`
- `crawler`
- `elite`
- `boss` (legacy Archivore)
- `polarDogBoss`
- `spottedDogBoss`
- `reaperBoss`
- `wolfPouncer`
- `skeletonArcher`
- `shieldBrute`
- `goblinRunner`
- `necromancer`
- `fireImp`
- `iceWraith`
- `castleKnight`
- Any other old or non-matching enemy type not listed under ACTIVE ENEMIES above.
