Fichier README.md
# Installation de Node.js v22.20.0 sur Windows 11

## 1️⃣ Installation via MSI (recommandée)
Ouvre **PowerShell en administrateur**, puis exécute :

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install-node-msi.ps1


✅ Vérifie ensuite :

node --version
npm --version
node -e "console.log('node test ok', process.version)"

2️⃣ Installation via NVM (option développeur)

Permet de gérer plusieurs versions de Node.js.

Set-ExecutionPolicy Bypass -Scope Process -Force
.\scripts\install-node-nvm.ps1


Puis rouvre ton terminal PowerShell :

nvm list
node --version
npm --version

3️⃣ Tests de validation (identiques pour les deux méthodes)
node --version
npm --version
where node
where npm
node -e "console.log('✅ Node opérationnel', process.version)"
mkdir C:\temp\node-test -Force
Push-Location C:\temp\node-test
npm init -y
npm install is-odd --silent
node -e "const isOdd=require('is-odd');console.log('Test is-odd =>',isOdd(3));"
Pop-Location


Résultat attendu :

✅ Node opérationnel v22.20.0
Test is-odd => true
4️⃣ Après installation

Ferme et rouvre VS Code

Vérifie dans le terminal intégré : node --version

Codex ou Copilot doivent maintenant détecter Node automatiquement

---

## 🧪 Vérifications manuelles rapides

Après exécution du script sur un PC :
```powershell
node --version
npm --version
node -e "console.log('Node fonctionne', process.version)"


Si toutes les commandes affichent une version et aucun message d’erreur → ✅ prêt pour Codex.
