<# =====================================================================
Script	 : Backup-Quiz-Versioned.ps1
Auteur   : Richard Szuszkiewicz
Objet 	 : Sauvegarde versionnée du projet Quiz React/Node.js et ajout d'un fichier LisezMoi versionné
Date  	 : (Get-Date) s'inscrit automatiquement
Terminal :
Version  : 1.4 (Mise à jour pour contourner les problèmes de "here-string")
Execution dans le Terminal :
Set-ExecutionPolicy Bypass -Scope Process -Force
& "D:\projet-quiz-seniors-n1-gemini-ai\Racine-Dev\quiz-seniors-app\Backup-Quiz-Versioned.ps1"
===================================================================== #>

# --- PARAMÈTRES CONFIGURABLES ---
$ProjectPath = "D:\projet-quiz-seniors-n1-gemini-ai\Racine-Dev"
$BackupPath = "D:\BACKUP-QUIZ\projet-quiz-seniors-n1-gemini-ai"
$ReadmeFileName = "LisezMoi" # Nom de base du fichier LisezMoi
$ScriptVersion = "1.4" # Version du script de sauvegarde autonome

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

$NextVersion = "{0:N1}" -f ($Base + ($Minor + 0.1) / 10)
$NextVersion = $NextVersion.Replace(",", ".")  # format FR -> EN

# --- CRÉATION DU DOSSIER DE SAUVEGARDE ---
$DateStamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$BackupFolderName = "Quiz_Backup_V$CurrentVersion`_$DateStamp"
$BackupFullPath = Join-Path $BackupPath $BackupFolderName

Write-Host "🗂️  Sauvegarde du projet version $CurrentVersion en cours..."
Copy-Item -Path $ProjectPath -Destination $BackupFullPath -Recurse -Force -ErrorAction Stop

# --- CRÉATION DU FICHIER LISEZMOI VERSIONNÉ ---
$ReadmeContent = ""
$ReadmeContent += "# Sauvegarde du projet Quiz React/Node.js`n`n"
$ReadmeContent += "## Version du projet : v$CurrentVersion`n"
$ReadmeContent += "## Version du script de sauvegarde autonome : v$ScriptVersion`n"
$ReadmeContent += "## Date de la sauvegarde : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$ReadmeContent += "Ce dossier contient une sauvegarde complète du projet Quiz.`n`n"
$ReadmeContent += "---`n`n"
$ReadmeContent += "## Structure de l'application (Racine du projet)`n`n"
$ReadmeContent += "````n"
$ReadmeContent += ".`n"
$ReadmeContent += "├── node_modules/           # Dépendances Node.js`n"
$ReadmeContent += "├── public/                 # Fichiers statiques (index.html, icônes, etc.)`n"
$ReadmeContent += "├── src/                    # Code source de l'application React`n"
$ReadmeContent += "│   ├── components/         # Composants React réutilisables`n"
$ReadmeContent += "│   ├── pages/              # Pages de l'application (vues)`n"
$ReadmeContent += "│   ├── services/           # Logique pour les appels API, etc.`n"
$ReadmeContent += "│   ├── App.js              # Composant racine de l'application`n"
$ReadmeContent += "│   ├── index.js            # Point d'entrée React`n"
$ReadmeContent += "│   └── ...`n"
$ReadmeContent += "├── server/                 # Dossier du backend Node.js (API)`n"
$ReadmeContent += "│   ├── controllers/        # Logique métier des routes`n"
$ReadmeContent += "│   ├── models/             # Modèles de données (si un ORM/ODM est utilisé)`n"
$ReadmeContent += "│   ├── routes/             # Définition des routes API`n"
$ReadmeContent += "│   ├── middleware/         # Middlewares (ex: authentification JWT)`n"
$ReadmeContent += "│   ├── app.js              # Point d'entrée du serveur Node.js`n"
$ReadmeContent += "│   └── package.json        # Dépendances du serveur Node.js`n"
$ReadmeContent += "├── .env                    # Variables d'environnement`n"
$ReadmeContent += "├── .gitignore              # Fichiers/dossiers à ignorer par Git`n"
$ReadmeContent += "├── package.json            # Dépendances du frontend React`n"
$ReadmeContent += "├── README.md               # Documentation générale du projet`n"
$ReadmeContent += "└── ...`n"
$ReadmeContent += "````n`n"
$ReadmeContent += "---`n`n"
$ReadmeContent += "## Principaux composants installés et technologies`n`n"
$ReadmeContent += "*   **Frontend :**`n"
$ReadmeContent += "    *   **React.js** : Bibliothèque JavaScript pour la construction de l'interface utilisateur.`n"
$ReadmeContent += "    *   **React Router DOM** : Pour la navigation au sein de l'application.`n"
$ReadmeContent += "    *   **Axios** : Client HTTP pour effectuer des requêtes API.`n"
$ReadmeContent += "    *   **Autres (ex):** Redux/Context API pour la gestion d'état, Tailwind CSS/Material-UI pour le style.`n"
$ReadmeContent += "*   **Backend (API) :**`n"
$ReadmeContent += "    *   **Node.js** : Environnement d'exécution JavaScript côté serveur.`n"
$ReadmeContent += "    *   **Express.js** : Framework web pour Node.js, pour construire l'API REST.`n"
$ReadmeContent += "    *   **JSON Web Token (JWT)** : Pour l'authentification basée sur les jetons.`n"
$ReadmeContent += "    *   **Bcryptjs** : Pour le hachage des mots de passe.`n"
$ReadmeContent += "    *   **Dotenv** : Pour charger les variables d'environnement depuis un fichier `.env`.`n"
$ReadmeContent += "    *   **CORS** : Middleware pour gérer les requêtes cross-origin.`n"
$ReadmeContent += "    *   **Autres (ex):** Express-validator pour la validation des données d'entrée.`n"
$ReadmeContent += "*   **Base de données / Interface :**`n"
$ReadmeContent += "    *   **NocoDB** : Base de données open source et interface de table intelligente, fonctionnant comme un tableur pour vos bases de données.`n`n"
$ReadmeContent += "---`n`n"
$ReadmeContent += "## Fichiers de configuration clés`n`n"
$ReadmeContent += "*   `package.json` (à la racine du frontend) : Liste les dépendances et scripts du projet React.`n"
$ReadmeContent += "*   `server/package.json` : Liste les dépendances et scripts du serveur Node.js.`n"
$ReadmeContent += "*   `.env` (à la racine) : Contient les variables d'environnement (ex: URL NocoDB, clés JWT, ports). **Attention : Ne doit pas être versionné directement dans Git pour la production.**`n"
$ReadmeContent += "*   `server/config/db.js` (ou similaire) : Configuration de la connexion à NocoDB (si via un client direct) ou à l'API NocoDB.`n"
$ReadmeContent += "*   `server/app.js` : Point d'entrée du serveur Express, configuration des middlewares et des routes.`n"
$ReadmeContent += "*   `src/index.js` : Point d'entrée de l'application React.`n"
$ReadmeContent += "*   `server/middleware/auth.js` (ou similaire) : Logique de vérification des jetons JWT.`n`n"
$ReadmeContent += "---`n"
$ReadmeContent += "**Informations supplémentaires :**`n"
$ReadmeContent += "*   Le numéro de version du projet suit un cycle de 5 sauvegardes mineures avant de passer à une version majeure suivante.`n"
$ReadmeContent += "*   Les anciennes sauvegardes (au-delà des 5 dernières) sont automatiquement supprimées.`n"


$ReadmeFullPath = Join-Path $BackupFullPath "$ReadmeFileName-v$CurrentVersion.md"
$ReadmeContent | Out-File $ReadmeFullPath -Encoding UTF8

Write-Host "📝 Fichier '$($ReadmeFileName)-v$CurrentVersion.md' créé dans la sauvegarde."

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
