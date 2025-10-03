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
