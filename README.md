# Documentation Complète - Quiz Initiation Informatique N1

## 📋 Vue d'ensemble

Application web de quiz interactive pour l'enseignement de l'informatique aux seniors, développée avec React, TypeScript, et Node.js.

**Version**: 1.0.0  
**Auteur**: Richard Szuszkiewicz  
**Année**: 2025

---

## 🎯 Fonctionnalités Principales

### 1. Gestion des Profils Élèves
- Création de profils avec nom, photo et couleur personnalisée
- Modification et suppression de profils
- Stockage dans SQLite avec cascade delete
- Interface visuelle avec macarons colorés

### 2. Système de Quiz
- 200 questions importées depuis CSV
- 3 types de questions : QCM, Vrai/Faux, Compléter
- Sélection aléatoire de 10 questions par session
- Support de réponses multiples pour les QCM
- Feedback immédiat avec affichage de la bonne réponse
- Lien vers le PDF du cours pour révision

### 3. Visualisation PDF Intégrée
- Ouverture du PDF à la page exacte de la leçon
- Recherche automatique du texte dans le PDF
- Navigation fluide avec défilement continu

### 4. Suivi des Scores
- Enregistrement de toutes les sessions dans SQLite
- Graphiques de progression par élève
- Affichage du meilleur score et de la moyenne
- Slider horizontal pour l'historique des scores
- Suppression automatique des scores lors de la suppression d'un profil

### 5. Import de Questions
- Import CSV avec séparateur point-virgule (;)
- Parsing automatique des réponses multiples (séparées par |)
- Validation et nettoyage des données
- Support de 200 questions
- L'entête du fichier CSV :
	QuestionID;Type;Question;Choix;Réponse;Thème;RéférenceCours;MotCléRecherchePDF;Leçon;PagePDF;TexteRecherchePDF

### 6. Interface Utilisateur
- Design moderne avec Tailwind CSS
- Mode sombre avec dégradés
- Animations et transitions fluides
- Cases à cocher rondes pour les QCM
- Typographie optimisée avec césure automatique
- Responsive design

---

## 🏗️ Architecture Technique

### Stack Technologique

**Frontend**:
- React 18 (bibliothèque UI)
- TypeScript (typage statique)
- Vite (build tool ultra-rapide)
- React Router (navigation)
- Tailwind CSS (styling)
- Axios (requêtes HTTP)
- PDF.js (visualisation PDF)
- IDB (IndexedDB wrapper - legacy)

**Backend**:
- Node.js (runtime JavaScript)
- Express (framework web)
- TypeScript (typage statique)
- Better-SQLite3 (base de données)
- Multer (upload de fichiers)
- CSV-Parser (parsing CSV)
- CORS (gestion des origines)

### Choix de la Base de Données

**SQLite** a été choisi pour plusieurs raisons :

1. **Simplicité** : Pas de serveur séparé à gérer, fichier unique
2. **Performance** : Très rapide pour les opérations de lecture
3. **Portabilité** : Le fichier `.sqlite` peut être copié facilement
4. **Intégrité** : Support des contraintes de clé étrangère avec CASCADE
5. **Adapté au contexte** : Parfait pour une application locale avec peu d'utilisateurs concurrents

**Schéma de la base de données** :

```sql
-- Table des profils élèves
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  photo TEXT,
  color TEXT
);

-- Table des sessions de quiz
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profileId INTEGER NOT NULL,
  date INTEGER NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY(profileId) REFERENCES profiles(id) ON DELETE CASCADE
);
```

**Migration IndexedDB → SQLite** :
- Initialement, les scores étaient stockés dans IndexedDB (navigateur)
- Migré vers SQLite pour garantir la cohérence avec les profils
- Cascade delete : suppression automatique des scores lors de la suppression d'un profil

---

## 📁 Arborescence Détaillée

```
Quiz-initiation-informatique-N1/
│
├── apps/
│   ├── backend/                    # Serveur Node.js/Express
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── profiles.ts     # API CRUD profils
│   │   │   │   ├── questions.ts    # API questions + import CSV
│   │   │   │   └── sessions.ts     # API sessions (scores)
│   │   │   ├── db.ts               # Configuration SQLite
│   │   │   └── index.ts            # Point d'entrée serveur
│   │   ├── sql/
│   │   │   └── schema.sql          # Schéma de la BDD
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # Application React
│       ├── public/
│       │   ├── assets/
│       │   │   ├── slider/         # Images du slider
│       │   │   │   ├── slide1.png
│       │   │   │   ├── slide2.png
│       │   │   │   ├── slide3.png
│       │   │   │   ├── slide4.png
│       │   │   │   └── slide5.png
│       │   │   ├── richard-photo.jpg
│       │   │   └── cours-informatique-n1.pdf
│       │   └── index.html
│       ├── src/
│       │   ├── components/
│       │   │   ├── Answer.tsx          # Affichage de la réponse
│       │   │   ├── ChoiceList.tsx      # Liste de choix QCM
│       │   │   ├── ImageSlider.tsx     # Slider d'images
│       │   │   ├── MatchPairs.tsx      # Questions d'association
│       │   │   ├── PDFLink.tsx         # Lien vers le PDF
│       │   │   ├── PDFViewer.tsx       # Visualiseur PDF
│       │   │   ├── ProfilePicker.tsx   # Sélection de profil
│       │   │   └── QuestionRenderer.tsx # Rendu des questions
│       │   ├── routes/
│       │   │   ├── About.tsx           # Page À propos
│       │   │   ├── Admin.tsx           # Page admin (import CSV)
│       │   │   ├── Enrollment.tsx      # Inscription élèves
│       │   │   ├── Home.tsx            # Page d'accueil
│       │   │   ├── Quiz.tsx            # Page du quiz
│       │   │   ├── Results.tsx         # Résultats du quiz
│       │   │   └── Scoreboard.tsx      # Tableau des scores
│       │   ├── services/
│       │   │   └── quizApiService.ts   # Appels API
│       │   ├── lib/
│       │   │   ├── db.indexeddb.ts     # IndexedDB (legacy)
│       │   │   ├── normalize.ts        # Normalisation de texte
│       │   │   ├── profiles.ts         # Hook profils
│       │   │   ├── random.ts           # Randomisation
│       │   │   ├── settings.ts         # Paramètres
│       │   │   └── types.ts            # Types TypeScript
│       │   ├── styles/
│       │   │   └── index.css           # Styles globaux
│       │   ├── App.tsx                 # Composant racine
│       │   └── main.tsx                # Point d'entrée
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
│
├── data.sqlite                     # Base de données SQLite
├── import_002_quiz_200_questions_fixed.csv  # Questions
├── package.json                    # Config workspace
├── .env                            # Variables d'environnement
└── README.md                       # Documentation
```

---

## 📦 Dépendances Complètes

### Frontend (`apps/frontend/package.json`)

**Production** :
```json
{
  "react": "^18.2.0",              // Bibliothèque UI
  "react-dom": "^18.2.0",          // Rendu DOM
  "react-router-dom": "^6.20.0",   // Navigation
  "axios": "^1.6.2",               // Requêtes HTTP
  "idb": "^7.1.1",                 // IndexedDB wrapper
  "pdfjs-dist": "^3.11.174"        // Visualisation PDF
}
```

**Développement** :
```json
{
  "@vitejs/plugin-react": "^5.0.4",
  "typescript": "^5.4.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Backend (`apps/backend/package.json`)

**Production** :
```json
{
  "express": "^4.21.2",            // Framework web
  "better-sqlite3": "^12.4.1",     // Base de données
  "cors": "^2.8.5",                // CORS
  "dotenv": "^17.2.3",             // Variables d'env
  "multer": "^2.0.2",              // Upload fichiers
  "csv-parse": "^5.5.0",           // Parsing CSV
  "csv-parser": "^3.2.0"           // Parsing CSV (alt)
}
```

**Développement** :
```json
{
  "@types/express": "^5.0.3",
  "@types/better-sqlite3": "^7.6.13",
  "@types/cors": "^2.8.19",
  "@types/multer": "^2.0.0",
  "typescript": "^5.9.3",
  "tsx": "^4.20.6",                // Exécution TypeScript
  "nodemon": "^3.1.10"             // Auto-reload
}
```

### Root (`package.json`)

**Développement** :
```json
{
  "concurrently": "^9.2.1",        // Exécution parallèle
  "playwright": "^1.39.0",         // Tests E2E
  "vitest": "^1.2.0"               // Tests unitaires
}
```

---

## 🚀 Procédure d'Installation sur un Nouveau PC

### Prérequis

1. **Node.js** (version 18 ou supérieure)
   - Télécharger : https://nodejs.org/
   - Vérifier : `node --version`

2. **Git** (optionnel, pour cloner le projet)
   - Télécharger : https://git-scm.com/

### Étape 1 : Copier le Projet

**Option A : Copie manuelle**
```powershell
# Copier tout le dossier Quiz-initiation-informatique-N1
# vers le nouveau PC
```

**Option B : Via Git** (si le projet est sur GitHub)
```powershell
git clone <url-du-repo>
cd Quiz-initiation-informatique-N1
```

### Étape 2 : Installation des Dépendances

```powershell
# Ouvrir PowerShell dans le dossier du projet
cd d:\chemin\vers\Quiz-initiation-informatique-N1

# Installer toutes les dépendances (root + backend + frontend)
npm install

# Cela va installer :
# - Les dépendances du workspace racine
# - Les dépendances du backend (apps/backend)
# - Les dépendances du frontend (apps/frontend)
```

**Note** : L'installation peut prendre 5-10 minutes selon la connexion internet.

### Étape 3 : Configuration

1. **Vérifier le fichier `.env`** (à la racine) :
```env
PORT=5000
DATABASE_URL=./data.sqlite
SECURITY_CODE=00000
```

2. **Vérifier que les fichiers suivants existent** :
   - `data.sqlite` (base de données)
   - `import_002_quiz_200_questions_fixed.csv` (questions)
   - `apps/frontend/public/assets/cours-informatique-n1.pdf` (PDF du cours)

### Étape 4 : Lancement de l'Application

```powershell
# Démarrer le backend ET le frontend en même temps
npm start

# Ou séparément :
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Résultat attendu** :
```
API OK → http://localhost:5000
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Étape 5 : Accéder à l'Application

Ouvrir le navigateur et aller sur : **http://localhost:5173**

---

## 🛠️ Scripts Disponibles

```json
{
  "start": "npm run dev",                    // Démarre tout
  "dev": "concurrently backend + frontend",  // Mode développement
  "dev:backend": "Backend seul",
  "dev:frontend": "Frontend seul",
  "build:backend": "Compile le backend",
  "build:frontend": "Compile le frontend",
  "test": "Lance les tests",
  "test:e2e": "Tests end-to-end"
}
```

---

## 🔧 Résolution de Problèmes

### Problème : `npm install` échoue

**Solution** :
```powershell
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/backend/node_modules
Remove-Item -Recurse -Force apps/frontend/node_modules

# Réinstaller
npm install
```

### Problème : Port 5000 déjà utilisé

**Solution** :
```powershell
# Modifier le port dans .env
PORT=5001
```

### Problème : Base de données corrompue

**Solution** :
```powershell
# Supprimer data.sqlite
Remove-Item data.sqlite

# Redémarrer l'app (la BDD sera recréée)
npm start
```

### Problème : PDF ne s'affiche pas

**Solution** :
- Vérifier que `cours-informatique-n1.pdf` est dans `apps/frontend/public/assets/`
- Vérifier la console du navigateur pour les erreurs

---

## 📊 Flux de Données

```
┌─────────────┐
│  Navigateur │
└──────┬──────┘
       │
       │ HTTP Requests
       ▼
┌─────────────────┐
│  Frontend (React)│
│  Port: 5173     │
└──────┬──────────┘
       │
       │ API Calls (Axios)
       ▼
┌─────────────────┐
│  Backend (Express)│
│  Port: 5000     │
└──────┬──────────┘
       │
       │ SQL Queries
       ▼
┌─────────────────┐
│  SQLite DB      │
│  data.sqlite    │
└─────────────────┘
```

---

## 🎨 Choix de Design

### Palette de Couleurs
- **Fond** : Dégradé gris foncé (`from-gray-900 via-gray-800 to-black`)
- **Surfaces** : Gris semi-transparent avec backdrop blur
- **Accent** : Rouge/Rose (`#f43f5e`, `#e11d48`)
- **Texte** : Slate (`#e5e7eb`, `#cbd5e1`)

### Typographie
- **Police** : Poppins (Google Fonts)
- **Césure** : Automatique en français (`hyphens: auto`)
- **Espacement** : Letter-spacing augmenté pour les titres

### Animations
- Transitions fluides (150-200ms)
- Hover effects sur les boutons
- Micro-animations pour l'engagement

---

## 📝 Notes Importantes

1. **Sécurité** : Le code de sécurité admin est `00000` (à changer en production)
2. **Backup** : Sauvegarder régulièrement `data.sqlite`
3. **CSV** : Le séparateur doit être `;` et les réponses multiples séparées par `|`
4. **PDF** : Le fichier PDF doit être nommé exactement `cours-informatique-n1.pdf`
5. **Photos** : Les photos de profil sont encodées en base64 dans la BDD

---

## 🔄 Workflow de Développement

1. **Modification du code** → Sauvegarde automatique
2. **Vite/Nodemon** → Rechargement automatique
3. **Test dans le navigateur** → Vérification
4. **Commit Git** → Sauvegarde des changements

---

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs dans la console du navigateur (F12)
- Vérifier les logs du serveur dans le terminal
- Consulter cette documentation

---

**Fin de la documentation** - Quiz Initiation Informatique N1 v1.0.0
