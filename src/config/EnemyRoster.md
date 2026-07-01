# Enemy spawn roster

This file documents which enemies are allowed in live spawns vs kept in config only.
See `EnemyRotationDefinitions.js` (spawn type rotation) and `GameConfig.bosses` (boss timer).

## SPAWN ROTATION (normal enemies)

Only **one enemy type** spawns at a time. The active type rotates through the full roster:

- **0:00–4:00** — new enemy every **1 minute**
- **4:00+** — new enemy every **2 minutes**

Rotation order: all **64x Tiny Monsters** (static sprites) plus **7 animated imports** (directional walk sheets), interleaved. See `EnemyRotationDefinitions.js`.

### Tiny Monsters (64)

Imported from `Tiny Dungeon Monsters` → `src/assets/imported/enemies/tinyMonsters/*.png`  
Run `npm run setup:enemies` after updating the download folder.

### Animated imports (7)

| ID | Notes |
|----|-------|
| `zombie` | Directional walk sheet |
| `brainZombie` | Directional walk sheet |
| `vikingUndead` | Directional walk sheet |
| `skeletonUndead` | Directional walk sheet |
| `popstarUndead` | Directional walk sheet |
| `knightUndead` | Directional walk sheet |
| `greenDragon` | Single sprite (flip for left) |

## BOSS

| ID | Role | Notes |
|----|------|-------|
| `skeletonCaptain` | Timed boss | Enlarged slime visual. Every 120s from 2:00. |

## LEGACY / DO NOT SPAWN

Old procedural types remain in `GameConfig.enemies` for future use only:

- `slime`, `bat`, `brute`, `crawler`, `elite`, `boss` (legacy packs)
- `polarDogBoss`, `spottedDogBoss`, `reaperBoss`
- `wolfPouncer`, `skeletonArcher`, `shieldBrute`, `goblinRunner`, `necromancer`, `fireImp`, `iceWraith`, `castleKnight`
