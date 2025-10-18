# D:\projet-quiz-seniors-n1-gemini-ai\Racine-Dev\quiz-app-seniors\start-dev-environment.ps1

# --- Configuration des chemins et ports ---
$ProjectRoot = Get-Item -Path $PSScriptRoot -ErrorAction Stop
# CORRECTION DÉFINITIVE DES NOMS DE DOSSIERS :
# Utilisant votre structure : backend, client
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "client" # Correction ici : 'client' au lieu de 'frontend'

$NocoDBPort = 8080
$BackendPort = 5000
$FrontendPort = 3001 # <--- CORRIGÉ : Le port réel de votre application React

Write-Host "--- Démarrage de l'environnement de développement Quiz Seniors N1 ---" -ForegroundColor Cyan

# --- Fonction pour vérifier et démarrer un service ---
function Start-ServiceIfStopped {
    param (
        [string]$ServiceName,
        [int]$Port,
        [string]$Command,
        [string]$WorkingDirectory
    )

    Write-Host "`nVérification de $ServiceName sur le port $Port... (dans: $WorkingDirectory)" -ForegroundColor Yellow # Ajout du chemin pour le debug

    # Tente de trouver un processus qui écoute sur le port spécifié
    $ListeningProcesses = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"

    if ($ListeningProcesses) {
        # Extrait l'ID du processus (le dernier nombre de la ligne)
        $processLine = $ListeningProcesses[0]
        $processId = $processLine -split '\s+' | Select-Object -Last 1

        $processName = (Get-Process -Id $processId -ErrorAction SilentlyContinue).ProcessName
        Write-Host "$ServiceName est déjà en cours d'exécution (PID: $processId, Process: $processName)." -ForegroundColor Green
    } else {
        Write-Host "$ServiceName n'est pas en cours d'exécution. Démarrage..." -ForegroundColor Yellow

        # Lance dans une nouvelle fenêtre pour voir les logs (essentiel pour le debug)
        # On utilise Set-Location dans la commande pour garantir que 'npm' est appelé au bon endroit.
        $FullCommand = "Set-Location -Path '$WorkingDirectory'; $Command"
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command $FullCommand"

        Write-Host "$ServiceName démarré. Vérifiez la nouvelle fenêtre de terminal." -ForegroundColor Green
    }
}

# --- Démarrage des services ---

# 1. NocoDB (Lancé depuis la racine)
Start-ServiceIfStopped -ServiceName "NocoDB" -Port $NocoDBPort `
    -Command ".\Noco-win-x64.exe" `
    -WorkingDirectory $ProjectRoot

Start-Sleep -Seconds 5

# 2. Backend Node.js
# NOTE: Le npm start ici fonctionne si le package.json du backend est bien configuré.
Start-ServiceIfStopped -ServiceName "Backend Node.js" -Port $BackendPort `
    -Command "npm start" `
    -WorkingDirectory $BackendPath

# 3. Frontend React (Vite)
# NOTE: Le changement de 'npm run dev' à 'npm start' a été fait.
Start-ServiceIfStopped -ServiceName "Frontend React (Vite)" -Port $FrontendPort `
    -Command "npm start" `
    -WorkingDirectory $FrontendPath

Write-Host "`n--- Vérification complète ---" -ForegroundColor Cyan
Write-Host "Vérifiez vos navigateurs :" -ForegroundColor White
Write-Host "  NocoDB: http://localhost:$NocoDBPort" -ForegroundColor DarkGray
Write-Host "  Backend API: http://localhost:$BackendPort/api/questions (pour test)" -ForegroundColor DarkGray
Write-Host "  Frontend React: http://localhost:$FrontendPort" -ForegroundColor DarkGray
Write-Host "`nAppuyez sur n'importe quelle touche pour quitter ce script de démarrage." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp")
