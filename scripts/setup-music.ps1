$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$dest = Join-Path $root "src\assets\audio\menu-theme.mp3"
$fallback = Join-Path $root "src\assets\audio\menu-theme-fallback.mp3"
$downloads = Join-Path $env:USERPROFILE "Downloads"
$kingsFeastUrl = "https://opengameart.org/sites/default/files/Kings_Feast.mp3"

$preferredTracks = @(
  "Kings_Feast.mp3",
  "King's Feast.mp3",
  "Awakening.mp3",
  "Merchants fair.mp3"
)

Write-Host "Warrior Cat Game Test - music setup"
Write-Host "Destination: $dest"
Write-Host ""

function Copy-Track($source, $label) {
  New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
  Copy-Item -Force $source $dest
  Write-Host "Using $label"
  Write-Host "  from $source"
}

foreach ($name in $preferredTracks) {
  $direct = Get-ChildItem -Path $downloads -Filter $name -Recurse -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($direct) {
    Copy-Track $direct.FullName $name
    exit 0
  }
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
  Write-Host "Trying itch.io download (kmontesdev - Awakening CC0)..."
  try {
    & $python.Source (Join-Path $PSScriptRoot "download-itch-music.py")
    if (Test-Path $dest) {
      exit 0
    }
  } catch {
    Write-Host "  itch.io download failed: $_"
  }
}

if (Test-Path $fallback) {
  Copy-Track $fallback "bundled CC0 fallback (King's Feast)"
  exit 0
}

Write-Host "Downloading King's Feast (CC0, upbeat medieval) from OpenGameArt..."
New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
curl.exe -L $kingsFeastUrl -o $dest --fail --silent --show-error
Copy-Item -Force $dest $fallback
Write-Host "Installed King's Feast by RandomMind"
exit 0
