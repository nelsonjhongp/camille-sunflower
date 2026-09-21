$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $projectRoot "dist"
$resolvedRoot = [System.IO.Path]::GetFullPath($projectRoot).TrimEnd('\')
$resolvedDestination = [System.IO.Path]::GetFullPath($destination).TrimEnd('\')

if ([System.IO.Path]::GetDirectoryName($resolvedDestination) -ne $resolvedRoot) {
  throw "La carpeta de salida debe estar directamente dentro del proyecto."
}

if ([System.IO.Path]::GetFileName($resolvedDestination) -ne "dist") {
  throw "La carpeta de salida esperada es dist."
}

if (Test-Path -LiteralPath $destination) {
  Remove-Item -LiteralPath $destination -Recurse -Force
}

New-Item -ItemType Directory -Path $destination | Out-Null

foreach ($file in @("index.html", "styles.css", "script.js")) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $destination
}

Copy-Item -LiteralPath (Join-Path $projectRoot "assets") -Destination $destination -Recurse

Write-Output "dist generado correctamente."
