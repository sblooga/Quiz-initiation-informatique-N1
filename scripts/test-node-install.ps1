<#
.SYNOPSIS
  Vérifie l'installation de Node.js et npm sur Windows 11.
  Teste également npm install et l'exécution d'un module JavaScript.
#>

$ErrorActionPreference = "Stop"

function Test-Command {
    param([string]$Cmd)
    return (Get-Command $Cmd -ErrorAction SilentlyContinue) -ne $null
}

Write-Host "🔍 Vérification de Node.js et npm..." -ForegroundColor Cyan

# Vérifier si Node est installé
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js non détecté dans le PATH." -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm non détecté dans le PATH." -ForegroundColor Red
    exit 2
}

# Versions
$nodeVer = node --version
$npmVer = npm --version
Write-Host "✅ Node.js version : $nodeVer" -ForegroundColor Green
Write-Host "✅ npm version : $npmVer" -ForegroundColor Green

# Vérifier l’exécution d’un script simple
try {
    $result = node -e "console.log('node quick test ok', process.version)"
    if ($result -match "node quick test ok") {
        Write-Host "✅ Test exécution Node réussi." -ForegroundColor Green
    } else {
        throw "Échec de l'exécution du script Node"
    }
}
catch {
    Write-Host "❌ Erreur pendant l’exécution de Node : $_" -ForegroundColor Red
    exit 3
}

# Test npm install
$temp = "C:\temp\node-test"
if (!(Test-Path $temp)) { New-Item -ItemType Directory -Force -Path $temp | Out-Null }
Push-Location $temp
try {
    npm init -y | Out-Null
    npm install is-odd --silent
    $npmTest = node -e "const isOdd=require('is-odd');console.log('is-odd =>',isOdd(3));"
    if ($npmTest -match "true") {
        Write-Host "✅ Test npm (is-odd) réussi." -ForegroundColor Green
    } else {
        throw "Le module npm ne s’est pas exécuté correctement."
    }
}
catch {
    Write-Host "❌ Échec du test npm : $_" -ForegroundColor Red
    Pop-Location
    exit 4
}
Pop-Location

Write-Host "--------------------------------------"
Write-Host "🎉 Tous les tests sont PASS — Node.js est prêt." -ForegroundColor Green
Write-Host "--------------------------------------"
exit 0

