# Warrior Cat Game Test

Standalone HTML5 canvas game — not part of ai-academy.

Survivor-style prototype built with vanilla JavaScript (ES modules), 1920×1080 resolution. Currently themed as **Lanternfall** in-game; menu art uses the original Warrior Cat branding.

## Run locally

```powershell
cd "C:\Users\erikr\Documents\warrior cat game test"
npm start
```

This opens your browser to http://localhost:8765 automatically. If the page looks stale, hard refresh (`Ctrl+Shift+R`).

## Setup scripts

| Command | Purpose |
|---------|---------|
| `npm run setup:enemies` | Import enemy art from itch.io packs in Downloads |
| `npm run setup:characters` | Re-slice character sprite sheets from `assets/character-sources/` |

## Project layout

```
index.html          Entry point
src/main.js         Boot
src/core/           Game loop, input, camera
src/systems/        Menu, combat, waves, shop, pause
src/entities/       Player, enemies, projectiles
src/config/         Weapons, waves, worlds, characters
src/assets/         Sprites, tiles, procedural art
scripts/            PowerShell asset importers
```

## Notes

- Save data is stored in `localStorage` under key `lanternfallSaveV1`.
- Enemy art credits are listed in `src/assets/sprites/enemies/README.md`.
