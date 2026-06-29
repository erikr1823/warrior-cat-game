$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$convert = Join-Path $PSScriptRoot "convert-enemy-icon.ps1"
$bossesRoot = Join-Path $root "src/assets/imported/bosses"

function Test-NeedsIconConversion {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $false
  }

  $header = [System.IO.File]::ReadAllBytes($Path)
  if ($header.Length -lt 24) {
    return $true
  }

  $isPng = ($header[0] -eq 0x89 -and $header[1] -eq 0x50)
  if (-not $isPng) {
    return $true
  }

  $width = ($header[16] -shl 24) -bor ($header[17] -shl 16) -bor ($header[18] -shl 8) -bor $header[19]
  $height = ($header[20] -shl 24) -bor ($header[21] -shl 16) -bor ($header[22] -shl 8) -bor $header[23]
  return -not ($width -eq 64 -and $height -eq 64)
}

Get-ChildItem $bossesRoot -Directory | ForEach-Object {
  $png = Get-ChildItem $_.FullName -Filter *.png | Select-Object -First 1
  if (-not $png) {
    Write-Warning "No PNG in $($_.Name)"
    return
  }

  if (-not (Test-NeedsIconConversion -Path $png.FullName)) {
    Write-Output "Skipping $($png.FullName) (already 64x64 PNG)"
    return
  }

  $tempPath = "$($png.FullName).tmp.png"
  & $convert -InputPath $png.FullName -OutputPath $tempPath
  Move-Item -Force $tempPath $png.FullName
}

Write-Output "Imported boss icons checked and converted where needed."
