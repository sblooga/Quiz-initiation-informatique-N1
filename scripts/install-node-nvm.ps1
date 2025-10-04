<#
.SYNOPSIS
  Installe NVM pour Windows puis Node.js v22.20.0, avec tests.
#>

$ErrorActionPreference = "Stop"

function Test-CommandExists {
    param([string]$Name)
    return (Get-Command $Name -ErrorAction SilentlyContinue) -ne $null
}

Write-Host "🔍 Vérification de NVM..." -ForegroundColor Cyan
if (-not (Test-CommandExists "nvm")) {
    Write-Host "📦 Installation de NVM for Windows..." -ForegroundColor Cyan
    $url = "https://github.com/coreybutler/nvm-windows/releases/download/1.1.10/nvm-setup.exe"
    $exe = Join-Path $env:TEMP "nvm-setup.exe"
    Invoke-WebRequest -Uri $url -OutFile $exe -UseBasicParsing
    Start-Process -FilePath $exe -ArgumentList "/S" -Wait -NoNewWindow
    Write-Host "✅ NVM installé. Ouvre une nouvelle console si besoin."
}

Write-Host "⚙️ Installation de Node.js via NVM..." -ForegroundColor Cyan
nvm install 22.20.0
nvm use 22.20.0

Write-Host "✅ Vérification de l'installation..." -ForegroundColor Green
$nodeVer = node --version
$npmVer = npm --version
Write-Host "Node.js version : $nodeVer"
Write-Host "npm version : $npmVer"

if ($nodeVer -match "v22.20.0") {
    Write-Host "✅ Node.js (via NVM) installé avec succès."
    exit 0
} else {
    Write-Error "❌ Erreur pendant l'installation."
    exit 1
}

