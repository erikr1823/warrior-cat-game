$ErrorActionPreference = "Stop"

$port = 8765
$url = "http://localhost:$port"
$root = Split-Path $PSScriptRoot -Parent

function Test-PortResponds {
  param([int]$Port)

  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/index.html" -UseBasicParsing -TimeoutSec 3
    return $response.StatusCode -eq 200 -and $response.Content -match "game-canvas"
  } catch {
    return $false
  }
}

function Stop-PortListeners {
  param([int]$Port)

  $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)

  if ($listeners.Count -eq 0) {
    return
  }

  Write-Host "Stopping $($listeners.Count) process(es) on port $Port..."
  $listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
}

$listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
$needsFreshServer = $listeners.Count -gt 1 -or -not (Test-PortResponds -Port $port)

if ($needsFreshServer) {
  if ($listeners.Count -gt 1) {
    Write-Host "Multiple servers detected on port $port. Restarting..."
  } elseif ($listeners.Count -eq 1) {
    Write-Host "Port $port is in use but not responding. Restarting..."
  }

  Stop-PortListeners -Port $port
} elseif ($listeners.Count -eq 1) {
  Write-Host "Server already running at $url"
  Start-Process $url
  exit 0
}

Set-Location $root
Start-Process $url
Write-Host "Serving $root at $url"
Write-Host "If the game looks broken, hard refresh the page (Ctrl+Shift+R)."
python -m http.server $port
