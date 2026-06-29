$ErrorActionPreference = "Stop"

$port = 8765
$url = "http://localhost:$port"
$root = Split-Path $PSScriptRoot -Parent

function Test-PortResponds {
  param([int]$Port)

  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

$listeners = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
if ($listeners.Count -gt 0) {
  if (Test-PortResponds -Port $port) {
    Write-Host "Server already running at $url"
    Start-Process $url
    exit 0
  }

  Write-Host "Port $port is in use but not responding. Clearing stale process(es)..."
  $listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
}

Set-Location $root
Start-Process $url
Write-Host "Serving $root at $url"
python -m http.server $port
