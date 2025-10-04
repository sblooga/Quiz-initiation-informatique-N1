# COURS D’INITIATION INFORMATIQUE N1 – Quiz

Application de quiz destinée aux seniors. Elle fournit une interface accessible en français et deux modes de stockage : **backend SQLite** et **mode hors‑ligne IndexedDB**.

## Prérequis

- Node.js ≥ 18
- npm

## Installation

```bash
npm install
```

## Lancer en mode backend + SQLite

```bash
cp .env.example .env
npm run dev:backend      # démarre l'API Express sur le port 3000
npm run dev:frontend     # démarre le client React sur le port 5173
```

## Lancer en mode hors‑ligne (IndexedDB seulement)

```bash
VITE_STORAGE=indexeddb npm run dev:frontend
```

## Importer les questions

1. Ouvrir l'application sur `http://localhost:5173`.
2. Cliquer sur « Importer/Mettre à jour le CSV » et charger `tools/sample-questions.csv` ou votre propre fichier.

## Tests

```bash
npm test       # tests unitaires (Vitest)
npm run test:e2e  # tests Playwright (serveur frontend nécessaire)
```

## Structure

- `apps/frontend` : application React (Vite + Tailwind).
- `apps/backend` : serveur Express + SQLite.
- `tools/sample-questions.csv` : fichier d’exemple couvrant tous les types de questions.

Remplacez `apps/frontend/public/cours.pdf` par votre PDF de cours.

---

# 🧠 Commandes essentielles pour le développement

Ce résumé permet de redémarrer ou dépanner rapidement le projet localement (frontend + backend).

## ⚙️ Installation initiale (sur un nouveau PC)

```powershell
# Depuis la racine du projet
npm install
cd apps/backend
npm install
cd ../frontend
npm install
cd ../..
cp .env.example .env

```

# Vérifier que Node.js et npm sont installés et dans le PATH

node --version
npm --version

# Tester un petit script Node (exécution locale)

node -e "console.log('✅ Node opérationnel', process.version)"

# Vérifier que le backend répond

curl http://localhost:3001

# Vérifier que le frontend est accessible

curl http://localhost:5173

# Vérifier que le fichier .env est présent et complet

type .env

# Tester le script de validation Node complet (si présent)

Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\test-node-install.ps1

✅ Résultats attendus :
node --version affiche v22.20.0
npm --version affiche une version (≥10.x)
Le script Node affiche ✅ Node opérationnel
curl sur le backend renvoie une réponse HTTP valide (200)
curl sur le frontend affiche le code HTML du site
test-node-install.ps1 termine par 🎉 Tous les tests sont PASS — Node.js est prêt.
