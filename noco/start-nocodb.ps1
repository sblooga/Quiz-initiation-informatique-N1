# Lancer NocoDB via NPX en SQLite local, port 8080
# Usage : powershell -ExecutionPolicy Bypass -File .\noco\start-nocodb.ps1

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $PSScriptRoot "data"
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

# Variables d'environnement
$env:NC_DB = "sqlite"
$env:NC_SQLITE_FILE = (Join-Path $DataDir "noco.sqlite")
$env:NC_PUBLIC_URL = "http://localhost:8080"

Write-Host "NC_SQLITE_FILE = $($env:NC_SQLITE_FILE)"
Write-Host "Démarrage de NocoDB (port 8080) ..."
npx --yes nocodb -p 8080
