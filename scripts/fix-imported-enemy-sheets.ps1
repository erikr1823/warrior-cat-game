$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$convert = Join-Path $PSScriptRoot "convert-enemy-sheet.ps1"
$scanRoots = @(
  (Join-Path $root "src/assets/imported/enemies"),
  (Join-Path $root "src/assets/imported/bosses")
)

function Test-NeedsConversion {
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

  if ($width -le 128 -and $height -le 128) {
    return $false
  }

  if ($height -le 128 -and $width -gt $height) {
    return $false
  }

  return -not ($width -eq 832 -and $height -eq 1344)
}

foreach ($scanRoot in $scanRoots) {
  if (-not (Test-Path $scanRoot)) {
    continue
  }

  Get-ChildItem $scanRoot -Directory | ForEach-Object {
    $png = Get-ChildItem $_.FullName -Filter *.png | Select-Object -First 1
    if (-not $png) {
      Write-Warning "No PNG in $($_.Name)"
      return
    }

    if (-not (Test-NeedsConversion -Path $png.FullName)) {
      Write-Output "Skipping $($png.FullName) (already 832x1344 PNG or 64x64 icon)"
      return
    }

    $tempPath = "$($png.FullName).tmp.png"
    & $convert -InputPath $png.FullName -OutputPath $tempPath
    Move-Item -Force $tempPath $png.FullName
  }
}

Write-Output "Imported enemy sheets checked and converted where needed."
