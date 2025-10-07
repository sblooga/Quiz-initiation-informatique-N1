<# =====================================================================
Script	 : Backup-Quiz-Versioned.ps1
Auteur   : Richard Szuszkiewicz
Objet 	 : Sauvegarde versionnée du projet Quiz React/Node.js
Date  	 : (Get-Date) s'inscrit automatiquement
Terminal : 
Version  : 1.0
Execution dans le Terminal :
Set-ExecutionPolicy Bypass -Scope Process -Force
& "D:\Quiz-Initiation-Informatique-N1\Backup-Quiz-Versioned.ps1"
===================================================================== #>

# --- PARAMÈTRES CONFIGURABLES ---
$ProjectPath = "D:\Quiz-Initiation-Informatique-N1"
$BackupPath  = "D:\BACKUP-QUIZ"

# --- VÉRIFICATION DES DOSSIERS ---
if (!(Test-Path $ProjectPath)) {
    Write-Host "❌ Le dossier du projet n'existe pas : $ProjectPath" -ForegroundColor Red
    exit 1
}
if (!(Test-Path $BackupPath)) {
    Write-Host "📁 Création du dossier de sauvegarde : $BackupPath"
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

# --- GÉNÉRATION DU NUMÉRO DE VERSION ---
$VersionFile = Join-Path $BackupPath "backup_version.txt"
if (!(Test-Path $VersionFile)) {
    "1.0" | Out-File $VersionFile -Encoding UTF8
}
$CurrentVersion = Get-Content $VersionFile
$Base = [math]::Floor([double]$CurrentVersion)
$Minor = [math]::Round(([double]$CurrentVersion - $Base) * 10)

# Logique cyclique : on garde 5 versions par cycle
if ($Minor -ge 5) {
    $Base += 0.1
    $Minor = 0
}

$NextVersion = "{0:N1}" -f ($Base + ($Minor + 0.1)/10)
$NextVersion = $NextVersion.Replace(",", ".")  # format FR -> EN

# --- CRÉATION DU DOSSIER DE SAUVEGARDE ---
$DateStamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$BackupFolderName = "Quiz_Backup_V$CurrentVersion`_$DateStamp"
$BackupFullPath = Join-Path $BackupPath $BackupFolderName

Write-Host "🗂️  Sauvegarde du projet version $CurrentVersion en cours..."
Copy-Item -Path $ProjectPath -Destination $BackupFullPath -Recurse -Force -ErrorAction Stop

# --- MISE À JOUR DU FICHIER DE VERSION ---
$NextMinor = $Minor + 1
if ($NextMinor -gt 5) { $NextMinor = 0 }
$NextVersion = "{0:N1}" -f ($Base + ($NextMinor / 10))
$NextVersion = $NextVersion.Replace(",", ".")
$NextVersion | Out-File $VersionFile -Encoding UTF8

# --- SUPPRESSION DES ANCIENNES SAUVEGARDES (au-delà de 5) ---
$Backups = Get-ChildItem -Path $BackupPath -Directory | Sort-Object CreationTime -Descending
if ($Backups.Count -gt 5) {
    $ToDelete = $Backups | Select-Object -Skip 5
    foreach ($Old in $ToDelete) {
        Write-Host "🧹 Suppression ancienne sauvegarde : $($Old.Name)"
        Remove-Item -Path $Old.FullName -Recurse -Force
    }
}

Write-Host "✅ Sauvegarde terminée : $BackupFullPath" -ForegroundColor Green
Write-Host "📦 Prochaine version prévue : V$NextVersion"
Write-Host "🕓 Date : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
