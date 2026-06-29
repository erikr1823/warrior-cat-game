$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$importedRoot = Join-Path $root "src/assets/imported"
$externalRoot = Join-Path $root "external-assets"

$packFolders = @(
  "anokolisa-topdown",
  "dungeon-tileset-ii-0x72",
  "summer-forest-seliel",
  "moon-graveyard-anokolisa"
)

foreach ($folder in $packFolders) {
  New-Item -ItemType Directory -Force -Path (Join-Path $externalRoot $folder) | Out-Null
}

foreach ($subdir in @("tilesets/dungeon", "tilesets/forest", "tilesets/graveyard", "tilesets/castle", "props", "enemies", "ui")) {
  New-Item -ItemType Directory -Force -Path (Join-Path $importedRoot $subdir) | Out-Null
}

$manifest = @{
  version = 1
  generatedAt = (Get-Date).ToString("o")
  sourcePacks = @()
  tilesets = @{
    castle = @{ grass = @(); stone = @(); moss = @() }
    dungeon = @{ grass = @(); stone = @(); moss = @() }
    forest = @{ grass = @(); stone = @(); moss = @() }
    graveyard = @{ grass = @(); stone = @(); moss = @() }
  }
  props = @{}
  enemies = @{}
  ui = @{}
}

$foundPacks = @()
foreach ($folder in $packFolders) {
  $path = Join-Path $externalRoot $folder
  $pngCount = (Get-ChildItem -Path $path -Recurse -File -Filter "*.png" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '__MACOSX|\._' }).Count
  if ($pngCount -gt 0) {
    $foundPacks += $folder
  }
}

if ($foundPacks.Count -eq 0) {
  Write-Host "No PNGs found under external-assets/. Floors stay procedural."
  Write-Host "Place free packs in external-assets/ subfolders, then re-run npm run setup:assets."
} else {
  Write-Host "Found packs: $($foundPacks -join ', ')"
  Write-Host "Automatic tile slicing is disabled until packs are inspected manually."
  Write-Host "Gameplay uses procedural biome floors and decorations for now."
}

$manifestPath = Join-Path $importedRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "Manifest: $manifestPath"
