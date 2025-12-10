#!/usr/bin/env pwsh
# Script de test pour l'import du CSV avec le champ Leçon

Write-Host "🚀 Démarrage du test d'import CSV..." -ForegroundColor Cyan

# 1. Vérifier que le fichier CSV existe
$csvPath = ".\import_002_quiz_200_questions.csv"
if (-not (Test-Path $csvPath)) {
    Write-Host "❌ Fichier CSV introuvable: $csvPath" -ForegroundColor Red
    exit 1
}

$lineCount = (Get-Content $csvPath | Measure-Object -Line).Lines
Write-Host "✅ Fichier CSV trouvé: $lineCount lignes" -ForegroundColor Green

# 2. Démarrer le backend en arrière-plan
Write-Host "`n📦 Démarrage du backend..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:backend
}

# Attendre que le backend soit prêt
Write-Host "⏳ Attente du démarrage du backend (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 3. Tester la connexion au backend
Write-Host "`n🔍 Test de connexion au backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/questions" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $_" -ForegroundColor Red
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

# 4. Importer le CSV
Write-Host "`n📥 Import du CSV..." -ForegroundColor Cyan
try {
    npx tsx trigger_import.ts
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Import réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec de l'import (code: $LASTEXITCODE)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'import: $_" -ForegroundColor Red
}

# 5. Vérifier les données importées
Write-Host "`n🔍 Vérification des données..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/questions" -Method GET
    $count = $response.Count
    Write-Host "✅ Nombre de questions importées: $count" -ForegroundColor Green
    
    # Vérifier qu'au moins une question a le champ lesson
    $withLesson = $response | Where-Object { $_.meta.lesson -ne $null -and $_.meta.lesson -ne "" }
    $lessonCount = ($withLesson | Measure-Object).Count
    Write-Host "✅ Questions avec champ 'lesson': $lessonCount" -ForegroundColor Green
    
    # Afficher un exemple
    if ($withLesson.Count -gt 0) {
        $example = $withLesson[0]
        Write-Host "`n📝 Exemple de question avec lesson:" -ForegroundColor Cyan
        Write-Host "  ID: $($example.id)" -ForegroundColor White
        Write-Host "  Question: $($example.label.Substring(0, [Math]::Min(60, $example.label.Length)))..." -ForegroundColor White
        Write-Host "  Lesson: $($example.meta.lesson)" -ForegroundColor Yellow
        Write-Host "  Page PDF: $($example.meta.pdfPage)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
}

# 6. Arrêter le backend
Write-Host "`n🛑 Arrêt du backend..." -ForegroundColor Cyan
Stop-Job $backendJob
Remove-Job $backendJob

Write-Host "`n✅ Test terminé!" -ForegroundColor Green
