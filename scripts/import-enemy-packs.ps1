param(
  [string]$PixelCrawler = "c:\Users\erikr\Downloads\Pixel Crawler - Free Pack 2.1\Pixel Crawler - Free Pack",
  [string]$TinyMonsters = "c:\Users\erikr\Downloads\Tiny Dungeon Monsters\Tiny Dungeon Monsters",
  [string]$DarkFantasy = "c:\Users\erikr\Downloads\DarkFantasyEnemies_FREE\DarkFantasyEnemies_FREE",
  [string]$CursedSpirits = "c:\Users\erikr\Downloads\Free Fantasy Enemy Pack 1\Free Fantasy Enemy Pack 1"
)

$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$destRoot = Join-Path $root "src\assets\sprites\enemies"

function Copy-EnemyAsset($packId, $enemyType, $sourceFile, [switch]$AsSheet) {
  if (-not $sourceFile -or -not (Test-Path $sourceFile)) {
    Write-Host "  skip $packId/$enemyType (missing: $sourceFile)"
    return
  }

  if ($AsSheet) {
    $destDir = Join-Path $destRoot "$packId\$enemyType"
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    $dest = Join-Path $destDir "sheet.png"
  } else {
    $destDir = Join-Path $destRoot $packId
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    $dest = Join-Path $destDir "$enemyType.png"
  }

  Copy-Item -Force $sourceFile $dest
  Write-Host "  $packId/$enemyType <= $(Split-Path $sourceFile -Leaf)"
}

function Join-Source($base, $relative) {
  Join-Path $base ($relative -replace "/", "\")
}

Write-Host "Warrior Cat Game Test - enemy pack importer"
Write-Host "Destination: $destRoot"
Write-Host ""

$mobs = Join-Source $PixelCrawler "Entities/Mobs"

$pixelCrawlerMap = @{
  slime   = @{ File = Join-Source $mobs "Skeleton Crew/Skeleton - Base/Idle/Idle-Sheet.png"; Sheet = $true }
  bat     = @{ File = Join-Source $mobs "Skeleton Crew/Skeleton - Rogue/Idle/Idle-Sheet.png"; Sheet = $true }
  brute   = @{ File = Join-Source $mobs "Orc Crew/Orc - Warrior/Idle/Idle-Sheet.png"; Sheet = $true }
  crawler = @{ File = Join-Source $mobs "Orc Crew/Orc/Idle/Idle-Sheet.png"; Sheet = $true }
  elite   = @{ File = Join-Source $mobs "Skeleton Crew/Skeleton - Mage/Idle/Idle-Sheet.png"; Sheet = $true }
  boss    = @{ File = Join-Source $mobs "Orc Crew/Orc - Shaman/Idle/Idle-Sheet.png"; Sheet = $true }
}

$tinyMonstersMap = @{
  slime   = @{ File = Join-Source $TinyMonsters "green-slime.png"; Sheet = $false }
  bat     = @{ File = Join-Source $TinyMonsters "cave-bat.png"; Sheet = $false }
  brute   = @{ File = Join-Source $TinyMonsters "stone-golem.png"; Sheet = $false }
  crawler = @{ File = Join-Source $TinyMonsters "cave-spider.png"; Sheet = $false }
  elite   = @{ File = Join-Source $TinyMonsters "floating-eye.png"; Sheet = $false }
  boss    = @{ File = Join-Source $TinyMonsters "tiny-lich.png"; Sheet = $false }
}

$tinyMonstersImportDir = Join-Path $root "src\assets\imported\enemies\tinyMonsters"

$darkFantasyMap = @{
  bat = @{ File = Join-Source $DarkFantasy "Bat/Bat without VFX/Bat-IdleFly.png"; Sheet = $true }
}

$cursedSpiritsMap = @{
  slime   = @{ File = Join-Source $CursedSpirits "No Outlines/CloudMonster.png"; Sheet = $true }
  bat     = @{ File = Join-Source $CursedSpirits "No Outlines/CloudMonster.png"; Sheet = $true }
  brute   = @{ File = Join-Source $CursedSpirits "No Outlines/Pumpkin.png"; Sheet = $true }
  crawler = @{ File = Join-Source $CursedSpirits "No Outlines/Pumpkin.png"; Sheet = $true }
  elite   = @{ File = Join-Source $CursedSpirits "No Outlines/CursedSpirit.png"; Sheet = $true }
  boss    = @{ File = Join-Source $CursedSpirits "No Outlines/CursedSpirit.png"; Sheet = $true }
}

$packMaps = @{
  pixelCrawler  = $pixelCrawlerMap
  tinyMonsters  = $tinyMonstersMap
  darkFantasy   = $darkFantasyMap
  cursedSpirits = $cursedSpiritsMap
}

foreach ($packId in $packMaps.Keys) {
  Write-Host "Pack: $packId"
  $map = $packMaps[$packId]

  foreach ($entry in $map.GetEnumerator()) {
    $type = $entry.Key
    $info = $entry.Value
    Copy-EnemyAsset $packId $type $info.File -AsSheet:([bool]$info.Sheet)
  }

  Write-Host ""
}

Write-Host "Importing full 64x Tiny Monsters roster..."
New-Item -ItemType Directory -Force -Path $tinyMonstersImportDir | Out-Null

Get-ChildItem -Path $TinyMonsters -Filter "*.png" -File | ForEach-Object {
  if ($_.Name -match '^(cover|Title)\.png$') {
    return
  }

  Copy-Item -Force $_.FullName (Join-Path $tinyMonstersImportDir $_.Name)
  Write-Host "  tinyMonsters/$($_.Name)"
}

Write-Host ""
Write-Host "Done. Hard refresh the game."
