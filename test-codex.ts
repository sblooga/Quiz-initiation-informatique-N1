// === Test Codex / GitHub Copilot ===
// Objectif : vérifier les suggestions automatiques dans VS Code

// Étape 1 : importe Express
app.get()
// (arrête-toi ici et regarde si Codex te propose une suggestion)
import express from 'express';

// Étape 2 : crée une application Express
const app = express();

// Étape 3 : ajoute une route GET simple
// Tape "app.get(" et observe la suggestion automatique
app.get('/', (req, res) => {
  res.send('✅ Codex fonctionne parfaitement !');
});

// Étape 4 : démarre le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur de test lancé sur http://localhost:${PORT}`);
});

// Create a route that returns the current time in JSON
