# Configuration Auth0 + Netlify pour Decap CMS

## ✅ Configuration CMS terminée

Le fichier `admin/config.yml` a été mis à jour avec :
- `auth0_domain: dev-j2cdt4oghbqmjsj1.us.auth0.com`
- `auth0_client_id: L2TYsr7qdKVBmqzmQA1eF6zbVyaRGEuN`

## 🔧 Variables d'environnement à ajouter sur Netlify

### 1. Va sur Netlify Dashboard
- **Site settings** → **Environment variables**

### 2. Ajoute ces variables :
```
AUTH0_DOMAIN = dev-j2cdt4oghbqmjsj1.us.auth0.com
AUTH0_CLIENT_ID = L2TYsr7qdKVBmqzmQA1eF6zbVyaRGEuN
AUTH0_CLIENT_SECRET = [copie depuis Auth0]
```

### 3. Pour obtenir le Client Secret :
- Va sur Auth0 → **Applications** → **Monsieur Crocodeal CMS** → **Settings**
- Copie le **Client Secret** (clique sur l'icône œil)

## 🔧 Configuration Auth0

### 1. Va sur Auth0 Dashboard
- **Applications** → **Monsieur Crocodeal CMS** → **Settings**

### 2. Configure ces URLs :
- **Allowed Callback URLs** : 
  ```
  https://photographemonsieurcrocodeal.netlify.app/admin
  ```
- **Allowed Logout URLs** : 
  ```
  https://photographemonsieurcrocodeal.netlify.app/admin
  ```
- **Allowed Web Origins** : 
  ```
  https://photographemonsieurcrocodeal.netlify.app
  ```

### 3. Sauvegarde les changements

## 🚀 Test final

1. **Déploie les changements** (commit + push)
2. **Va sur** : `https://photographemonsieurcrocodeal.netlify.app/admin`
3. **Connecte-toi** avec : `johan.darmon@gmail.com`

## 📋 Résumé des étapes

✅ **Config.yml** : Mis à jour avec Auth0
🔄 **Variables Netlify** : À ajouter manuellement
🔄 **Auth0 URLs** : À configurer manuellement
🔄 **Test** : À faire après déploiement
