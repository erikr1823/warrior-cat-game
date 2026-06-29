# External asset packs (manual download)

Place **free** itch.io packs in the subfolders below, then run:

```bash
npm run setup:assets
```

## Folders

| Folder | Suggested pack |
|--------|----------------|
| `anokolisa-topdown/` | Anokolisa Topdown Tileset |
| `dungeon-tileset-ii-0x72/` | 0x72 DungeonTileset II |
| `summer-forest-seliel/` | Seliel Summer Forest sample |
| `moon-graveyard-anokolisa/` | Anokolisa Moon Graveyard |

The setup script only prepares folders and an empty manifest until each pack is inspected.
**Floors in-game use procedural palettes per biome** until verified tiles are copied into `src/assets/imported/`.

Enemy sprites use `npm run setup:enemies` from your Downloads copies of Pixel Crawler, Tiny Monsters, etc.
