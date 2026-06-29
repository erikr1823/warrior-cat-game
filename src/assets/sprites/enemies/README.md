# Enemy art packs for Lanternfall

Each **wing** (minute of survival) uses a different world with its own floor palette and enemy art pack.

| Minute | Wing | Art pack | itch.io download |
|--------|------|----------|------------------|
| 0–1 | Dusty Stacks | **Pixel Crawler** | [Free Pixel Crawler pack](https://anokolisa.itch.io/free-pixel-art-asset-pack-topdown-tileset-rpg-16x16-sprites) |
| 1–2 | Fluttering Leaves | **Pixel Crawler** (moss palette) | same pack |
| 2–3 | Scurrying Margins | **64x Tiny Monsters** | [64x Tiny Monsters](https://jedimeisterx.itch.io/64-tiny-monsters-free-32x32-pixel-art) |
| 3–4 | Heavy Tomes | **Dark Fantasy** | [Dark Fantasy Enemies](https://monopixelart.itch.io/dark-fantasy-enemies-asset-pack) |
| 4–5 | Collapsing Shelves | **Cursed Spirits** | [Free Fantasy Enemy Pack 1](https://exclusiveolive.itch.io/free-fantasy-enemy-pack-1) |
| 5+ | Unwritten Tide | **Ink procedural** | built-in fallback |

## Install steps

1. Download the four packs from itch.io (free / name-your-price at $0).
2. Run the importer — it reads from your **Downloads** folder by default:

```bash
npm run setup:enemies
```

Or pass custom paths:

```powershell
powershell -File ./scripts/import-enemy-packs.ps1 `
  -PixelCrawler "C:\path\to\Pixel Crawler - Free Pack" `
  -TinyMonsters "C:\path\to\Tiny Dungeon Monsters" `
  -DarkFantasy "C:\path\to\DarkFantasyEnemies_FREE" `
  -CursedSpirits "C:\path\to\Free Fantasy Enemy Pack 1"
```

3. Hard refresh the game (`Ctrl+Shift+R`).

## Normalized sprite paths

Static PNGs:

```
src/assets/sprites/enemies/{packId}/{enemyType}.png
```

Animated sheets (Pixel Crawler, Dark Fantasy bat, Cursed Spirits):

```
src/assets/sprites/enemies/{packId}/{enemyType}/sheet.png
```

Types: `slime`, `bat`, `brute`, `crawler`, `elite`, `boss`

Until PNGs exist, each world uses **tinted procedural placeholders** matching that wing’s mood.

**Note:** The free Dark Fantasy pack only includes the bat — other enemy types in that wing use procedural art with a purple tint.

## Credits (include in your game credits)

- Anokolisa — Pixel Crawler Free Pack
- JedimeisterX — 64x Tiny Monsters
- MonoPixelArt — Dark Fantasy Enemies
- exclusiveOlive — Free Fantasy Enemy Pack 1
