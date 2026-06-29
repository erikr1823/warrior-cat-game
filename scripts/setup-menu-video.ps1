$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$menuDir = Join-Path $root "src\assets\menu"
$source = Join-Path $menuDir "warrior-cat-menu-loop-source.mp4"
$target = Join-Path $menuDir "warrior-cat-menu-loop.mp4"
$fade = 1.0
$main = 4.85
$offset = [math]::Round($main - $fade, 2)

function Find-Ffmpeg {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  $winget = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

  if ($winget) {
    return $winget
  }

  throw "ffmpeg not found. Install with: winget install Gyan.FFmpeg"
}

if (-not (Test-Path $source)) {
  if (-not (Test-Path $target)) {
    throw "Missing source video: $source"
  }

  Copy-Item -Force $target $source
}

$ffmpeg = Find-Ffmpeg
$filter = "[0:v]split=2[body][head];[body]trim=end=${main},setpts=PTS-STARTPTS[bodyt];[head]trim=duration=${fade},setpts=PTS-STARTPTS[headt];[bodyt][headt]xfade=transition=fade:duration=${fade}:offset=${offset}[vout]"

Write-Host "Building seamless menu loop..."
Write-Host "  source: $source"
Write-Host "  target: $target"

& $ffmpeg -y -i $source -filter_complex $filter -map "[vout]" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart $target

Write-Host "Done."
