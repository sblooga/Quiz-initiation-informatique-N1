# Définir la variable pour le chemin de base du projet (ajustez si nécessaire)
$projectDir = (Get-Location).Path

Write-Host "--- DÉMARRAGE DU REDÉMARRAGE DU QUIZ ---" -ForegroundColor Yellow

# 1. Tuer toutes les tâches Node en cours
Write-Host "1. Arrêt des processus Node en cours..." -ForegroundColor Cyan
try {
    # NOUVEAU: Ports ciblés 3000 (Frontend) et 3002 (Backend)
    $portsToKill = @(3000, 3002)
    foreach ($port in $portsToKill) {
        # Nouvelle approche : filtrer d'abord pour obtenir les PIDs, puis utiliser Select-Object -Unique
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

        # Vérifier si des connexions existent et extraire les PIDs uniques
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

            if ($pids) {
                Write-Host "   -> Arrêt du processus (PID: $($pids -join ', ')) utilisant le port $port." -ForegroundColor Green
                $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
            }
        } else {
            Write-Host "   -> Aucun processus trouvé sur le port $port." -ForegroundColor DarkYellow
        }
    }
} catch {
    Write-Host "   [ATTENTION] Erreur lors de l'arrêt des processus : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Arrêt terminé." -ForegroundColor Cyan
Write-Host ""

# 2. Démarrer le Backend (API)
Write-Host "2. Démarrage du Backend (apps\backend) sur le port 3002..." -ForegroundColor Yellow
cd "$projectDir\apps\backend"

# Démarrer le backend sans bloquer le script
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "$projectDir\apps\backend" -NoNewWindow
Write-Host "   -> Backend démarré (http://localhost:3002). Veuillez vérifier la console du Backend." -ForegroundColor Green
Write-Host ""

# 3. Démarrer le Frontend (React)
Write-Host "3. Démarrage du Frontend (apps\frontend) sur le port 3000..." -ForegroundColor Yellow
cd "$projectDir\apps\frontend"

# Démarrer le frontend sans bloquer le script
Start-Process powershell -ArgumentList "npm run dev" -WorkingDirectory "$projectDir\apps\frontend" -NoNewWindow
Write-Host "   -> Frontend démarré (http://localhost:3000). Veuillez vérifier la console du Frontend." -ForegroundColor Green
Write-Host ""

# Retourner au répertoire de base
cd $projectDir

# 4. Ouvrir la page du quiz (après un petit délai pour le démarrage)
Write-Host "4. Attente de quelques secondes pour le démarrage des serveurs..." -ForegroundColor Cyan
Start-Sleep -Seconds 5 # Attendre 5 secondes

Write-Host "Ouverture du Quiz dans le navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "--- REDÉMARRAGE DU QUIZ TERMINÉ ---" -ForegroundColor Yellow
Write-Host "Les deux serveurs sont en cours d'exécution dans des fenêtres séparées." -ForegroundColor Yellow
