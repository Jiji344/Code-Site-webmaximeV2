# 🚀 Configuration : Fonction Netlify Upload Multiple

## 📋 Guide Complet de Configuration

Ce guide te montre **étape par étape** comment activer l'upload multiple de photos avec la fonction Netlify.

---

## ✅ Prérequis

Avant de commencer, assure-toi d'avoir :
- ✅ Un compte GitHub
- ✅ Un compte Netlify
- ✅ Ton site déployé sur Netlify
- ✅ Les fichiers suivants dans ton repo :
  - `netlify/functions/batch-upload.js`
  - `netlify.toml`
  - `package.json`
  - `admin/batch-upload.html` (modifié)

---

## 🔑 Étape 1 : Créer un GitHub Personal Access Token

### **1️⃣ Aller sur GitHub**
1. Va sur [github.com](https://github.com)
2. Connecte-toi à ton compte

### **2️⃣ Accéder aux Settings**
1. Clique sur ton **avatar** (en haut à droite)
2. Clique sur **Settings**

### **3️⃣ Developer Settings**
1. Dans le menu de gauche, scroll tout en bas
2. Clique sur **Developer settings**

### **4️⃣ Personal Access Tokens**
1. Clique sur **Personal access tokens**
2. Clique sur **Tokens (classic)**
3. Clique sur **Generate new token**
4. Choisis **Generate new token (classic)**

### **5️⃣ Configurer le Token**
Remplis le formulaire :

#### **Note (description) :**
```
Netlify Upload Multiple - Site Maxime
```

#### **Expiration :**
```
No expiration (ou 1 an si tu préfères)
```

#### **Scopes (permissions) - IMPORTANT !** ⚠️
Coche **UNIQUEMENT** ces cases :
- ✅ **repo** (accès complet aux repos)
  - ✅ repo:status
  - ✅ repo_deployment
  - ✅ public_repo
  - ✅ repo:invite
  - ✅ security_events

**NE COCHE PAS** les autres permissions pour la sécurité !

### **6️⃣ Générer et Copier**
1. Scroll en bas
2. Clique sur **Generate token**
3. ⚠️ **COPIE IMMÉDIATEMENT le token** (tu ne pourras plus le voir après !)
4. Il ressemble à : `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx`

💾 **Sauvegarde-le temporairement** dans un fichier texte (tu vas l'utiliser dans l'étape suivante)

---

## 🌐 Étape 2 : Configurer Netlify

### **1️⃣ Aller sur le Dashboard Netlify**
1. Va sur [app.netlify.com](https://app.netlify.com)
2. Connecte-toi
3. Sélectionne ton site

### **2️⃣ Accéder aux Variables d'Environnement**
1. Clique sur **Site settings**
2. Dans le menu de gauche, clique sur **Environment variables**
3. Clique sur **Add a variable**

### **3️⃣ Ajouter le GitHub Token**
Remplis :

#### **Key (nom) :**
```
GITHUB_TOKEN
```

#### **Values (valeur) :**
Colle le token que tu as copié à l'étape 1 :
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **Scopes :**
Sélectionne :
- ✅ **All**
- ✅ **Functions**
- ✅ **Builds**

### **4️⃣ Sauvegarder**
1. Clique sur **Create variable**
2. ✅ Le token est maintenant configuré !

---

## 📦 Étape 3 : Installer les Dépendances

### **Option A : Avec npm (si tu as Node.js)**
```bash
npm install
```

### **Option B : Netlify installe automatiquement**
Si tu n'as pas Node.js localement, **Netlify installera automatiquement** les dépendances lors du déploiement grâce au `package.json`.

---

## 🚀 Étape 4 : Déployer sur Netlify

### **Méthode 1 : Git Push (Recommandé)**
```bash
git add .
git commit -m "✨ Ajout fonction upload multiple"
git push origin main
```

Netlify détecte automatiquement les changements et redéploie ! 🎉

### **Méthode 2 : Netlify CLI**
Si tu as installé `netlify-cli` :
```bash
netlify deploy --prod
```

---

## 🧪 Étape 5 : Tester l'Upload Multiple

### **1️⃣ Aller sur le CMS**
```
https://ton-site.netlify.app/admin/
```

### **2️⃣ Cliquer sur "📸 Upload Multiple"**
(Bouton en bas à droite)

### **3️⃣ Tester avec 2-3 Photos**
1. Titre : `Test Upload`
2. Catégorie : `Portrait`
3. Sélectionne 2-3 photos
4. Clique sur **"🚀 Uploader les photos"**

### **4️⃣ Vérifier**
- La barre de progression doit avancer
- Message de succès : `✅ 3 photos uploadées avec succès !`
- Redirection vers le CMS

### **5️⃣ Vérifier sur GitHub**
1. Va sur ton repo GitHub
2. Regarde dans `content/portfolio/portrait/test-upload/`
3. Tu devrais voir :
   - `test-upload-1.md`
   - `test-upload-2.md`
   - `test-upload-3.md`
4. Et dans `static/img/portrait/test-upload/` :
   - Les 3 images

✅ **Si tu vois tout ça, c'est fonctionnel !** 🎉

---

## ⚠️ Dépannage

### **Problème 1 : "Configuration serveur manquante"**

**Erreur dans la console :**
```
Error: Le token GitHub n'est pas configuré
```

**Solution :**
1. Vérifie que tu as bien créé la variable `GITHUB_TOKEN` dans Netlify
2. Vérifie qu'elle s'appelle **exactement** `GITHUB_TOKEN` (sensible à la casse)
3. Redéploie le site (Netlify doit redémarrer pour lire les nouvelles variables)

---

### **Problème 2 : "Erreur lors de l'upload"**

**Erreur dans la console :**
```
Error: Upload image échoué: Not Found
```

**Causes possibles :**
1. Le token GitHub n'a pas les bonnes permissions
2. Le nom du repo est incorrect dans la fonction

**Solution :**
1. Vérifie les permissions du token (voir Étape 1)
2. Ouvre `netlify/functions/batch-upload.js`
3. Vérifie les lignes :
   ```javascript
   const owner = 'Jiji344';  // Ton username GitHub
   const repo = 'Code-Site-webmaximeV2';  // Ton repo
   ```
4. Change si nécessaire

---

### **Problème 3 : "Function not found"**

**Erreur 404 sur `/.netlify/functions/batch-upload`**

**Solution :**
1. Vérifie que le fichier `netlify.toml` existe à la racine
2. Vérifie que le dossier `netlify/functions/` existe
3. Redéploie complètement :
   ```bash
   git add .
   git commit -m "Fix functions"
   git push
   ```

---

### **Problème 4 : Photos trop lourdes**

**Erreur : Timeout ou Upload échoué**

**Solution :**
Compresse tes photos avant upload :
- **Taille max recommandée : 5 MB par photo**
- **Résolution recommandée : 3000x2000 px max**

Outils de compression :
- [TinyPNG](https://tinypng.com)
- [Squoosh](https://squoosh.app)
- Photoshop : "Enregistrer pour le web"

---

### **Problème 5 : Timeout après 10 photos**

**Erreur : Function timeout**

**Cause :** Les fonctions Netlify ont un timeout de 10 secondes (plan gratuit) ou 26 secondes (plan payant).

**Solution :**
Upload par lots :
- **Plan gratuit** : Max 5-8 photos par upload
- **Plan Pro** : Max 15-20 photos par upload

Ou upgrade vers Netlify Pro pour plus de temps.

---

## 🔒 Sécurité

### **Le Token est-il Sécurisé ?**

✅ **OUI**, car :
1. Il est stocké dans les **variables d'environnement Netlify** (chiffrées)
2. Il n'est **jamais visible** dans le code source public
3. Il est **uniquement accessible** par la fonction serveur (backend)
4. Il n'est **pas exposé** au navigateur

### **Dois-je Partager mon Token ?**

❌ **NON, JAMAIS !**
- Ne le commits pas dans Git
- Ne le partages pas publiquement
- Ne l'envoies pas par email/Slack

### **Que Faire si j'ai Exposé mon Token ?**

1. Va sur GitHub → Settings → Developer settings
2. Trouve le token dans la liste
3. Clique sur **Delete**
4. Génère un nouveau token
5. Remets-le dans Netlify

---

## 📊 Limites et Quotas

### **Netlify Free Plan :**
- ⏱️ **Timeout fonction** : 10 secondes
- 📦 **Bande passante** : 100 GB/mois
- 🔢 **Builds** : 300 minutes/mois
- 📸 **Photos par upload** : ~5-8 (selon taille)

### **Netlify Pro Plan (19$/mois) :**
- ⏱️ **Timeout fonction** : 26 secondes
- 📦 **Bande passante** : 400 GB/mois
- 🔢 **Builds** : 1000 minutes/mois
- 📸 **Photos par upload** : ~15-20

### **GitHub :**
- 📁 **Fichier max** : 100 MB
- 📂 **Repo total** : 1 GB recommandé

---

## ✅ Checklist Complète

- [ ] **Étape 1** : GitHub Token créé
- [ ] Scopes : `repo` complet ✅
- [ ] Token copié et sauvegardé ✅
- [ ] **Étape 2** : Variable Netlify ajoutée
- [ ] Nom : `GITHUB_TOKEN` ✅
- [ ] Valeur : Token GitHub ✅
- [ ] Scopes : All, Functions, Builds ✅
- [ ] **Étape 3** : Dépendances installées
- [ ] `package.json` présent ✅
- [ ] `node-fetch` dans les dépendances ✅
- [ ] **Étape 4** : Site déployé
- [ ] `git push` effectué ✅
- [ ] Build Netlify réussi ✅
- [ ] Pas d'erreurs dans les logs ✅
- [ ] **Étape 5** : Test effectué
- [ ] Upload de 2-3 photos ✅
- [ ] Photos visibles sur GitHub ✅
- [ ] Photos visibles sur le site ✅

---

## 🎉 Résultat Final

Une fois configuré, tu peux :
1. **Aller sur** : `https://ton-site.netlify.app/admin/batch-upload.html`
2. **Sélectionner** 10-20 photos
3. **Cliquer** sur "Uploader"
4. **Attendre** 30 secondes
5. **✅ 20 photos en ligne !**

**Temps total : 30 secondes au lieu de 5-6 minutes !** 🚀

---

## 📞 Support

### **Problème Non Résolu ?**

1. **Vérifie les logs Netlify** :
   - Dashboard Netlify → Functions → batch-upload
   - Regarde les dernières invocations
   - Cherche les erreurs

2. **Vérifie la console navigateur** :
   - F12 → Console
   - Regarde les erreurs JavaScript

3. **Teste la fonction directement** :
   ```bash
   curl -X POST https://ton-site.netlify.app/.netlify/functions/batch-upload \
     -H "Content-Type: application/json" \
     -d '{"albumTitle":"Test","category":"portrait","files":[]}'
   ```

---

## 🚀 Prochaines Étapes

Une fois que tout fonctionne :
1. ✅ Utilise-le pour tes vrais shootings
2. ✅ Partage le lien avec tes clients (s'ils uploadent eux-mêmes)
3. ✅ Profite du gain de temps !

**Bon upload ! 📸✨**

