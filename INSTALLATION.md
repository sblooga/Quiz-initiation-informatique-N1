# Guide d'Installation Rapide - Quiz Initiation Informatique N1

## 🚀 Installation sur un Nouveau PC

### 1. Installer Node.js

1. Aller sur https://nodejs.org/
2. Télécharger la version **LTS** (Long Term Support)
3. Lancer l'installateur et suivre les étapes
4. Vérifier l'installation :
   ```powershell
   node --version
   # Devrait afficher : v18.x.x ou supérieur
   
   npm --version
   # Devrait afficher : 9.x.x ou supérieur
   ```

### 2. Copier le Projet

Copier **tout le dossier** `Quiz-initiation-informatique-N1` sur le nouveau PC.

**Fichiers importants à ne pas oublier** :
- ✅ `data.sqlite` (base de données)
- ✅ `import_002_quiz_200_questions_fixed.csv` (questions)
- ✅ `apps/frontend/public/assets/cours-informatique-n1.pdf` (PDF)
- ✅ `apps/frontend/public/assets/richard-photo.jpg` (photo)
- ✅ `apps/frontend/public/assets/slider/` (images du slider)

### 3. Installer les Dépendances

Ouvrir **PowerShell** dans le dossier du projet :

```powershell
# Se placer dans le dossier
cd d:\chemin\vers\Quiz-initiation-informatique-N1

# Installer TOUTES les dépendances
npm install
```

⏱️ **Temps d'installation** : 5-10 minutes

### 4. Lancer l'Application

```powershell
npm start
```

**Résultat attendu** :
```
[backend] API OK → http://localhost:5000
[frontend] ➜  Local:   http://localhost:5173/
```

### 5. Ouvrir dans le Navigateur

Aller sur : **http://localhost:5173**

---

## ✅ Vérification

Si tout fonctionne, vous devriez voir :
- ✅ La page d'accueil avec le titre "COURS D'INITIATION INFORMATIQUE N1"
- ✅ Le slider d'images
- ✅ Le menu hamburger (☰) en haut à droite
- ✅ La section "Choisissez votre profil"

---

## 🛠️ En Cas de Problème

### Problème : "npm : Le terme 'npm' n'est pas reconnu"

**Solution** : Node.js n'est pas installé ou pas dans le PATH
1. Réinstaller Node.js
2. Redémarrer PowerShell
3. Vérifier : `node --version`

### Problème : Erreur lors de `npm install`

**Solution** :
```powershell
# Nettoyer et réinstaller
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### Problème : Port 5000 déjà utilisé

**Solution** : Modifier le port dans `.env`
```env
PORT=5001
```

### Problème : L'application ne démarre pas

**Solution** :
1. Vérifier que Node.js est installé : `node --version`
2. Vérifier que les dépendances sont installées : `ls node_modules`
3. Vérifier les logs d'erreur dans le terminal

---

## 📋 Checklist d'Installation

- [ ] Node.js installé (v18+)
- [ ] Projet copié sur le nouveau PC
- [ ] Fichier `data.sqlite` présent
- [ ] Fichier CSV présent
- [ ] PDF du cours présent
- [ ] `npm install` exécuté avec succès
- [ ] `npm start` lance l'application
- [ ] Application accessible sur http://localhost:5173

---

## 🎯 Commandes Essentielles

```powershell
# Démarrer l'application
npm start

# Arrêter l'application
Ctrl + C (dans le terminal)

# Redémarrer après modification
npm start

# Voir les logs
# Les logs s'affichent directement dans le terminal
```

---

## 📞 Aide

Si vous rencontrez un problème :
1. Vérifier les logs dans le terminal
2. Ouvrir la console du navigateur (F12)
3. Consulter `DOCUMENTATION_COMPLETE.md` pour plus de détails
