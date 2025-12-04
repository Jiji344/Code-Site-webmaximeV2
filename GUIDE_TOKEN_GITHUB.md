# 🔑 Guide : Configuration du Token GitHub sur Netlify

## Problème
Si vous rencontrez des erreurs lors de l'upload multiple de photos, c'est probablement parce que le token GitHub n'est pas configuré ou a expiré.

## Solution : Mettre à jour le Token GitHub dans Netlify

### Étape 1 : Créer un nouveau token GitHub

1. Allez sur GitHub : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donnez un nom au token (ex: "Netlify Upload Photos")
4. Sélectionnez les scopes nécessaires :
   - ✅ **`repo`** (accès complet aux dépôts) - **OBLIGATOIRE**
5. Cliquez sur **"Generate token"**
6. **⚠️ IMPORTANT** : Copiez le token immédiatement (il commence par `ghp_`). Vous ne pourrez plus le voir après !

### Étape 2 : Configurer le token dans Netlify

1. Allez sur votre site Netlify : https://app.netlify.com
2. Sélectionnez votre site
3. Allez dans **Site settings** (Paramètres du site)
4. Dans le menu de gauche, cliquez sur **Environment variables** (Variables d'environnement)
5. Cherchez la variable `GITHUB_TOKEN`
   - Si elle existe : Cliquez sur **"Edit"** et remplacez la valeur par votre nouveau token
   - Si elle n'existe pas : Cliquez sur **"Add a variable"** et créez :
     - **Key** : `GITHUB_TOKEN`
     - **Value** : Votre token (commence par `ghp_`)
6. Cliquez sur **"Save"**

### Étape 3 : Redéployer les fonctions (si nécessaire)

1. Dans Netlify, allez dans **Deploys** (Déploiements)
2. Cliquez sur **"Trigger deploy"** → **"Deploy site"**
3. Attendez que le déploiement soit terminé

### Étape 4 : Tester l'upload

1. Allez sur votre site : `/admin/batch-upload.html`
2. Essayez d'uploader une photo de test
3. Si ça fonctionne, c'est bon ! ✅

---

## Types de tokens GitHub

### Token classique (recommandé)
- Format : `ghp_xxxxxxxxxxxxxxxxxxxx`
- Scope requis : `repo`
- Durée : Pas d'expiration (ou selon votre choix)

### Fine-grained token
- Format : `github_pat_xxxxxxxxxxxxxxxxxxxx`
- Permissions requises :
  - Repository access : **Read and write**
  - Contents : **Read and write**
  - Metadata : **Read-only**

---

## Vérification du token

Le code vérifie automatiquement :
- ✅ Que le token est configuré
- ✅ Que le format est correct (`ghp_` ou `github_pat_`)
- ✅ Que le token est valide et a les permissions nécessaires

Si une erreur survient, vous verrez un message clair indiquant le problème.

---

## Erreurs courantes

### "Token GitHub invalide ou expiré"
→ Le token a expiré ou n'existe plus. Créez un nouveau token et mettez-le à jour dans Netlify.

### "Permissions insuffisantes"
→ Le token n'a pas le scope `repo`. Créez un nouveau token avec le scope `repo` activé.

### "Le token GitHub n'est pas configuré"
→ La variable d'environnement `GITHUB_TOKEN` n'existe pas dans Netlify. Créez-la.

---

## Support

Si le problème persiste après avoir suivi ce guide :
1. Vérifiez les logs Netlify : **Functions** → **Logs**
2. Vérifiez que le dépôt GitHub est bien `Jiji344/Code-Site-webmaximeV2`
3. Vérifiez que vous avez les droits d'écriture sur le dépôt



