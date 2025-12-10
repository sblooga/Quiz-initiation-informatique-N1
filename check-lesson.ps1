# Verification rapide du champ lesson
$data = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/questions"
Write-Host "Total questions: $($data.Count)" -ForegroundColor Green

$withLesson = $data | Where-Object { $_.meta.lesson -and $_.meta.lesson.Trim() -ne "" }
Write-Host "Questions avec lesson: $($withLesson.Count)" -ForegroundColor Cyan

if ($withLesson.Count -gt 0) {
    Write-Host "`nExemples:" -ForegroundColor Yellow
    $withLesson | Select-Object -First 3 | ForEach-Object {
        Write-Host "  ID: $($_.id) - Lesson: $($_.meta.lesson) - Page: $($_.meta.pdfPage)"
    }
}

$withoutLesson = $data | Where-Object { -not $_.meta.lesson -or $_.meta.lesson.Trim() -eq "" }
Write-Host "`nQuestions SANS lesson: $($withoutLesson.Count)" -ForegroundColor Yellow

if ($withoutLesson.Count -gt 0 -and $withoutLesson.Count -lt 10) {
    Write-Host "IDs sans lesson:" -ForegroundColor Gray
    $withoutLesson | ForEach-Object { Write-Host "  $($_.id)" -ForegroundColor Gray }
}
