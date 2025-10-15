# Configuration Netlify CMS pour Monsieur Crocodeal

## ✅ Fichiers créés

- ✅ `admin/index.html` - Interface admin (Decap CMS v3.0)
- ✅ `admin/config.yml` - Configuration complète
- ✅ `content/` - Dossiers de contenu
- ✅ `netlify.toml` - Configuration Netlify
- ✅ `_redirects` - Redirections

## 🚀 Étapes pour activer le CMS sur Netlify

### 1. Déployer sur Netlify

Si ce n'est pas déjà fait :
1. Va sur https://netlify.com
2. Connecte ton compte GitHub
3. New site from Git
4. Sélectionne ton repo
5. Deploy

### 2. Activer Identity & Authentication

1. **Dans ton dashboard Netlify**, va dans ton site
2. **Site settings** → **Identity**
3. Clique sur **"Enable Identity"**
4. Dans **Registration preferences** → Sélectionne **"Invite only"**
5. Clique sur **"Invite users"** et entre ton email

### 3. Activer Git Gateway

1. Toujours dans **Identity**
2. Va dans **Services** → **Git Gateway**
3. Clique sur **"Enable Git Gateway"**

### 4. Créer ton compte admin

1. Vérifie tes emails
2. Clique sur le lien d'invitation
3. Crée ton mot de passe

### 5. Accéder à l'admin

1. Va sur : `ton-site.netlify.app/admin`
2. Connecte-toi avec tes identifiants
3. L'interface CMS s'affiche ! 🎉

## 📸 Gestion du contenu

### Collections disponibles :

**Portfolio (6 catégories) :**
- Portrait
- Mariage
- Immobilier
- Paysage
- Macro
- Lifestyle

**Informations du site :**
- À Propos (photo + textes)
- Contact (téléphone, email, localisation)
- Hero (titre, sous-titre, description)

### Ajouter une photo au portfolio :

1. Dans l'admin, clique sur une catégorie (ex: "Portfolio - Portrait")
2. Clique sur "New Portfolio Portrait"
3. Upload ton image
4. Ajoute l'alt text
5. Définis l'ordre (0, 1, 2...)
6. Save → Publish

Les photos seront sauvegardées dans `content/portfolio/[categorie]/`

## 🔧 Prochaine étape

Pour que les modifications du CMS se reflètent sur le site, il faudra :
- Créer un script qui lit les fichiers YAML dans `content/`
- Générer dynamiquement les sections HTML
- Ou utiliser un générateur de site statique (11ty, Hugo, etc.)

## ⚠️ Erreur actuelle résolue

L'erreur "Cannot read properties of null" était due au manque de `<div id="nc-root"></div>`.
C'est maintenant corrigé !

