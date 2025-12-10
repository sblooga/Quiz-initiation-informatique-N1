# Test import CSV avec lesson
Write-Host "Test d'import CSV..." -ForegroundColor Cyan

# Verifier le fichier CSV
$csvPath = ".\import_002_quiz_200_questions.csv"
if (Test-Path $csvPath) {
    $lines = (Get-Content $csvPath | Measure-Object -Line).Lines
    Write-Host "CSV trouve: $lines lignes" -ForegroundColor Green
}
else {
    Write-Host "CSV introuvable" -ForegroundColor Red
    exit 1
}

# Demarrer backend
Write-Host "Demarrage backend..." -ForegroundColor Cyan
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev:backend
}

Start-Sleep -Seconds 12

# Importer
Write-Host "Import..." -ForegroundColor Cyan
npx tsx trigger_import.ts

# Verifier
Write-Host "Verification..." -ForegroundColor Cyan
$data = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/questions"
Write-Host "Questions importees: $($data.Count)" -ForegroundColor Green

$withLesson = $data | Where-Object { $_.meta.lesson }
Write-Host "Avec lesson: $($withLesson.Count)" -ForegroundColor Green

if ($withLesson.Count -gt 0) {
    $ex = $withLesson[0]
    Write-Host "Exemple:" -ForegroundColor Yellow
    Write-Host "  Lesson: $($ex.meta.lesson)"
    Write-Host "  Page: $($ex.meta.pdfPage)"
}

# Arreter
Stop-Job $job
Remove-Job $job
Write-Host "Termine!" -ForegroundColor Green
