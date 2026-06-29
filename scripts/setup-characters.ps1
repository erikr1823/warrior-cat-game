$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path $PSScriptRoot -Parent
$spriteRoot = Join-Path $root "src\assets\sprites\player"
$sourceRoot = Join-Path $root "assets\character-sources"

$characters = @{
  puzas = Join-Path $sourceRoot "puzas.png"
  kiki  = Join-Path $sourceRoot "kiki.png"
}

if (-not (Test-Path $sourceRoot)) {
  New-Item -ItemType Directory -Force -Path $sourceRoot | Out-Null
  Write-Host "Place source sprite sheets in: $sourceRoot"
  Write-Host "  puzas.png, kiki.png"
  Write-Host ""
  Write-Host "Character frames already in src/assets/sprites/player/ can be used without re-running."
  exit 0
}

foreach ($entry in $characters.GetEnumerator()) {
  $id = $entry.Key
  $source = $entry.Value
  $destDir = Join-Path $spriteRoot $id

  if (-not (Test-Path $source)) {
    Write-Host "skip $id (missing $source)"
    continue
  }

  New-Item -ItemType Directory -Force -Path $destDir | Out-Null

  $sheet = [System.Drawing.Image]::FromFile($source)
  $sheetWidth = $sheet.Width
  $sheetHeight = $sheet.Height
  Write-Host "$id sheet: ${sheetWidth}x${sheetHeight}"

  $cols = 3
  $rows = 4
  $frameWidth = [int][Math]::Floor($sheetWidth / $cols)
  $frameHeight = [int][Math]::Floor($sheetHeight / $rows)

  $directionRows = @{
    down  = 0
    left  = 1
    right = 2
    up    = 3
  }

  $sheetPath = Join-Path $destDir "sheet.png"
  Copy-Item -Force $source $sheetPath

  foreach ($dirEntry in $directionRows.GetEnumerator()) {
    $direction = $dirEntry.Key
    $row = $dirEntry.Value

    for ($frame = 0; $frame -lt $cols; $frame++) {
      $frameBitmap = New-Object System.Drawing.Bitmap $frameWidth, $frameHeight
      $graphics = [System.Drawing.Graphics]::FromImage($frameBitmap)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
      $srcRect = New-Object System.Drawing.Rectangle ($frame * $frameWidth), ($row * $frameHeight), $frameWidth, $frameHeight
      $destRect = New-Object System.Drawing.Rectangle 0, 0, $frameWidth, $frameHeight
      $graphics.DrawImage($sheet, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
      $graphics.Dispose()

      $framePath = Join-Path $destDir "$direction-$frame.png"
      $frameBitmap.Save($framePath, [System.Drawing.Imaging.ImageFormat]::Png)
      $frameBitmap.Dispose()
    }

    $previewPath = Join-Path $destDir "$direction.png"
    Copy-Item -Force (Join-Path $destDir "$direction-1.png") $previewPath
  }

  $meta = @{
    frameWidth = $frameWidth
    frameHeight = $frameHeight
    framesPerDirection = $cols
    directionRows = $directionRows
  } | ConvertTo-Json
  Set-Content -Path (Join-Path $destDir "meta.json") -Value $meta
  $sheet.Dispose()
}

Write-Host "Character sprites prepared."
