# D:\projet-quiz-seniors-n1-gemini-ai\Racine-Dev\quiz-app-seniors\stop-dev-environment.ps1

# --- Configuration des ports (Doit correspondre à start-dev-environment.ps1) ---
$NocoDBPort = 8080
$BackendPort = 5000
# CORRECTION : Le port du Frontend (Vite) est 5173
$FrontendPort = 5173

Write-Host "--- Arrêt de l'environnement de développement Quiz Seniors N1 ---" -ForegroundColor Red

# --- Fonction pour arrêter un service par son port ---
function Stop-ServiceByPort {
    param (
        [string]$ServiceName,
        [int]$Port
    )

    Write-Host "`nTentative d'arrêt de $ServiceName sur le port $Port..." -ForegroundColor Yellow

    # Trouver le PID du processus écoutant sur le port
    # Utilise la même logique robuste que le script de démarrage
    $ListeningProcesses = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"

    if ($ListeningProcesses) {
        # Extrait l'ID du processus (le dernier nombre de la ligne)
        $processLine = $ListeningProcesses[0]
        $processId = $processLine -split '\s+' | Select-Object -Last 1

        Write-Host "$ServiceName trouvé (PID: $processId). Arrêt..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "$ServiceName arrêté avec succès." -ForegroundColor Green
        } catch {
            Write-Host "Erreur lors de l'arrêt de $ServiceName (PID: $processId): $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "$ServiceName n'est pas en cours d'exécution sur le port $Port." -ForegroundColor DarkGray
    }
}

# --- Arrêt des services ---
# Arrêter dans l'ordre inverse pour plus de propreté (Frontend, puis Backend, puis DB)
Stop-ServiceByPort -ServiceName "Frontend React (Vite)" -Port $FrontendPort
Stop-ServiceByPort -ServiceName "Backend Node.js" -Port $BackendPort
Stop-ServiceByPort -ServiceName "NocoDB" -Port $NocoDBPort


Write-Host "`n--- Arrêt complet ---" -ForegroundColor Red
Write-Host "Tous les services connus ont été traités." -ForegroundColor White
Write-Host "`nAppuyez sur n'importe quelle touche pour quitter ce script d'arrêt." -ForegroundColor White
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp")
