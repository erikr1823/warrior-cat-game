# Asset Credits

Third-party assets are copied into `src/assets/imported/` only after manual review.
Run `npm run setup:assets` once packs are placed in `external-assets/`.

**Current status:** No itch.io tiles or sprites are active in-game. Floors and decorations use procedural art per biome. Enemy packs use the original sheet/static import path under `src/assets/sprites/enemies/`.

---

## Expected manual folders

Place downloaded free packs here before running `npm run setup:assets`:

| Folder | Pack |
|--------|------|
| `external-assets/anokolisa-topdown/` | Anokolisa Topdown Tileset |
| `external-assets/dungeon-tileset-ii-0x72/` | 0x72 DungeonTileset II |
| `external-assets/summer-forest-seliel/` | Seliel Summer Forest |
| `external-assets/moon-graveyard-anokolisa/` | Anokolisa Moon Graveyard |

The setup script inspects these folders and copies only verified PNGs into `src/assets/imported/`. Until that runs successfully, nothing below applies.

---

## Imported files

_No third-party PNGs are currently used in gameplay._

When assets are imported, list them here with:

- asset pack name
- creator
- itch.io URL
- license note (confirm on pack page before shipping)
- filenames under `src/assets/imported/`

---

## In-project assets (not from external-assets/)

| Asset | Creator | Notes |
|-------|---------|-------|
| King's Feast (menu-theme.mp3) | RandomMind | CC0 — see `src/assets/audio/LICENSE.txt` |
| Procedural tiles, decorations, ink enemies | Lanternfall / Erik Rivera | Original procedural art |
