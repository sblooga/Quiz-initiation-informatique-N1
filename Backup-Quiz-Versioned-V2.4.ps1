<# =====================================================================
Script   : Backup-Quiz-Versioned.ps1
Auteur   : Richard Szuszkiewicz
Objet    : Sauvegarde Robocopy + Guide Restauration (Version Blindée)
Version  : 2.4 (Correction syntaxe texte Lisez-Moi)
===================================================================== #>

# --- 1. PARAMÈTRES CONFIGURABLES ---
$ProjectPath = "D:\PROJET-NODEJS\projet-quiz-seniors-n1-gemini-ai\!RACINE-DEV"
$BackupPath = "D:\PROJET-NODEJS\BACKUP-QUIZ\projet-quiz-seniors-n1-gemini-ai"
$ReadmeFileName = "LisezMoi"
$MaxBackups = 5

# --- 2. VÉRIFICATIONS ---
if (!(Test-Path $ProjectPath)) {
    Write-Host "❌ ERREUR : Le dossier projet est introuvable : $ProjectPath" -ForegroundColor Red
    exit 1
}
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
}

# --- 3. VERSIONNING ---
$VersionFile = Join-Path $BackupPath "backup_version.txt"
if (!(Test-Path $VersionFile)) { "1.0" | Out-File $VersionFile -Encoding UTF8 }

$CurrentVersion = Get-Content $VersionFile
if ($CurrentVersion -match "(\d+)\.(\d+)") {
    [int]$Major = $matches[1]; [int]$Minor = $matches[2]
} else { $Major = 1; $Minor = 0; $CurrentVersion = "1.0" }

# --- 4. PRÉPARATION ---
$DateStamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$BackupFolderName = "Quiz_Backup_V$CurrentVersion`_$DateStamp"
$BackupFullPath = Join-Path $BackupPath $BackupFolderName
New-Item -ItemType Directory -Path $BackupFullPath | Out-Null

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "🚀 SAUVEGARDE V$CurrentVersion EN COURS..." -ForegroundColor Cyan
Write-Host "=============================================="

# --- 5. COPIE RAPIDE (Exclusion node_modules) ---
$LogArgs = @("/NFL", "/NDL", "/NJH", "/NJS", "/R:0", "/W:0")
robocopy $ProjectPath $BackupFullPath /E /XD "node_modules" ".git" ".vscode" "dist" "build" "coverage" @LogArgs

if ($LASTEXITCODE -ge 8) { Write-Host "❌ Erreur critique copie." -ForegroundColor Red }
else { Write-Host "✅ Fichiers copiés (Source propre)." -ForegroundColor Green }

# --- 6. ANALYSE DU PACKAGE.JSON ---
$PackageJsonPath = Join-Path $ProjectPath "package.json"
$DependenciesText = "*Non détecté*"

if (Test-Path $PackageJsonPath) {
    try {
        $JsonContent = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        $Deps = $JsonContent.dependencies
        if ($Deps) {
            $DependenciesText = ""
            $Deps.PSObject.Properties | ForEach-Object { $DependenciesText += "- **$($_.Name)** : $($_.Value)`n" }
        }
    } catch { $DependenciesText = "Erreur lecture package.json" }
}

# --- 7. GÉNÉRATION DU LISEZ-MOI (MÉTHODE SIMPLE) ---
# On construit le texte ligne par ligne (Impossible de faire des erreurs de syntaxe ici)
$Txt = ""
$Txt += "# 💾 SAUVEGARDE PROJET - VERSION v$CurrentVersion`r`n"
$Txt += "`r`n"
$Txt += "- **Date** : $(Get-Date -Format 'dd/MM/yyyy à HH:mm')`r`n"
$Txt += "- **Script** : Backup V2.4`r`n"
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "`r`n"
$Txt += "## 🆘 GUIDE DE RESTAURATION (À LIRE)`r`n"
$Txt += "`r`n"
$Txt += "Cette sauvegarde est légère (le dossier `node_modules` est exclu).`r`n"
$Txt += "Si vous restaurez cette version, l'application ne marchera pas tout de suite.`r`n"
$Txt += "`r`n"
$Txt += "### 👉 Procédure obligatoire :`r`n"
$Txt += "`r`n"
$Txt += "1. Ouvrez ce dossier dans **VScode**.`r`n"
$Txt += "2. Tapez la commande suivante :`r`n"
$Txt += "   ```Dans Powershell ou le Terminal de VScode`r`n"
$Txt += "   npm install`r`n"
$Txt += "   `r`n"
$Txt += "   *(Attendez 30 secondes)*`r`n"
$Txt += "   `r`n"
$Txt += "3. Lancez votre site :`r`n"
$Txt += "   ```Dans Powershell ou le Terminal de VScode`r`n"
$Txt += "   npm run dev ou npm start`r`n"
$Txt += "   `r`n"
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "`r`n"
$Txt += "## 📦 Contenu technique`r`n"
$Txt += "Liste des dépendances qui seront réinstallées :`r`n"
$Txt += "`r`n"
$Txt += $DependenciesText
$Txt += "`r`n"
$Txt += "---`r`n"
$Txt += "*Généré automatiquement.*`r`n"

# Écriture du fichier
$ReadmeFullPath = Join-Path $BackupFullPath "$ReadmeFileName-v$CurrentVersion.md"
$Txt | Out-File $ReadmeFullPath -Encoding UTF8
Write-Host "📝 Guide de restauration inclus dans : $ReadmeFileName-v$CurrentVersion.md" -ForegroundColor Green

# --- 8. PROCHAINE VERSION & ROTATION ---
$NextMinor = $Minor + 1
$NextMajor = $Major
if ($NextMinor -ge 10) { $NextMajor++; $NextMinor = 0 }
"$NextMajor.$NextMinor" | Out-File $VersionFile -Encoding UTF8

$Backups = Get-ChildItem -Path $BackupPath -Directory | Where-Object { $_.Name -like "Quiz_Backup_V*" } | Sort-Object CreationTime
if ($Backups.Count -gt $MaxBackups) {
    $Oldest = $Backups | Select-Object -First ($Backups.Count - $MaxBackups)
    foreach ($Old in $Oldest) {
        Write-Host "⚠️ Limite atteinte. Ancien : $($Old.Name)" -ForegroundColor Yellow
        $Confirm = Read-Host "❓ Supprimer ? (O/N)"
        if ($Confirm -eq 'O') { Remove-Item $Old.FullName -Recurse -Force; Write-Host "🗑️ Supprimé." }
    }
}

Write-Host "✅ TERMINÉ AVEC SUCCÈS." -ForegroundColor Cyan
