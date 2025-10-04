<#
.SYNOPSIS
  Installe Node.js v22.20.0 (x64) via MSI silencieux et vérifie l’installation.
#>

$ErrorActionPreference = "Stop"

$version = "22.20.0"
$msi = "node-v$version-x64.msi"
$url = "https://nodejs.org/dist/v$version/$msi"
$temp = Join-Path $env:TEMP $msi

Write-Host "📦 Téléchargement de Node.js v$version ..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing

Write-Host "⚙️  Installation silencieuse..." -ForegroundColor Cyan
Start-Process msiexec -ArgumentList "/i `"$temp`" /qn /norestart" -Wait -NoNewWindow

Write-Host "✅ Vérification de l'installation..." -ForegroundColor Green
$nodeVer = node --version
$npmVer = npm --version
Write-Host "Node.js version : $nodeVer"
Write-Host "npm version : $npmVer"

if ($nodeVer -match "v$version") {
    Write-Host "✅ Node.js installé correctement."
    exit 0
} else {
    Write-Error "❌ Échec de l'installation de Node.js"
    exit 1
}

