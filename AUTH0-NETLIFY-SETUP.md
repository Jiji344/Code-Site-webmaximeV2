# Configuration Git Gateway + Netlify Identity pour Decap CMS

## ✅ Configuration CMS terminée

Le fichier `admin/config.yml` a été mis à jour avec :
- `backend: git-gateway`
- `branch: main`

## 🔧 Configuration Netlify Identity

### 1. Va sur Netlify Dashboard
- **Site settings** → **Identity**

### 2. Active Identity :
- Clique sur **"Enable Identity"** (si pas déjà fait)

### 3. Active Git Gateway :
- Va dans **"Git Gateway"** (sous Identity)
- Clique sur **"Enable Git Gateway"**
- Autorise l'accès à ton repository GitHub

### 4. Gère les utilisateurs :
- Va dans **"Users"** (sous Identity)
- Clique sur **"Invite users"** pour ajouter des utilisateurs
- Ou utilise l'utilisateur existant : `johan.darmon@gmail.com`

## 🚀 Test final

1. **Déploie les changements** (commit + push)
2. **Va sur** : `https://photographemonsieurcrocodeal.netlify.app/admin`
3. **Connecte-toi** avec : `johan.darmon@gmail.com`

## 📋 Résumé des étapes

✅ **Config.yml** : Mis à jour avec git-gateway
✅ **Utilisateur créé** : `johan.darmon@gmail.com`
🔄 **Git Gateway** : À activer sur Netlify
🔄 **Test** : À faire après déploiement
