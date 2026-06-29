param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [int]$TargetSize = 64
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Image]::FromFile($InputPath)
try {
  $target = New-Object System.Drawing.Bitmap($TargetSize, $TargetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $graphics.DrawImage($source, 0, 0, $TargetSize, $TargetSize)
  $graphics.Dispose()

  for ($y = 0; $y -lt $target.Height; $y += 1) {
    for ($x = 0; $x -lt $target.Width; $x += 1) {
      $color = $target.GetPixel($x, $y)
      if ($color.A -gt 0 -and $color.R -lt 24 -and $color.G -lt 24 -and $color.B -lt 24) {
        $target.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      }
    }
  }

  $directory = Split-Path -Parent $OutputPath
  if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
  }

  $target.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output "Wrote $OutputPath ($TargetSize x $TargetSize PNG)"
}
finally {
  $source.Dispose()
  if ($target) { $target.Dispose() }
}
