# 🚀 Guide de Migration : Cloudinary → Backblaze B2 + Cloudflare

Ce guide vous explique comment migrer votre site de Cloudinary vers Backblaze B2 avec Cloudflare CDN pour éviter les limitations de bande passante.

---

## 📋 Prérequis

1. **Compte Backblaze B2** : [https://www.backblaze.com/b2/sign-up.html](https://www.backblaze.com/b2/sign-up.html)
2. **Compte Cloudflare** : [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
3. **Domaine personnalisé** (ex: `monsieurcrocodealphotographie.fr`) - Acheté chez OVH, Namecheap, GoDaddy, etc.
4. **Site Netlify** existant

---

## 🔧 Étape 1 : Configuration Backblaze B2

### 1.1 Créer un bucket B2

1. Connectez-vous à votre compte Backblaze B2
2. Allez dans **Buckets** → **Create a Bucket**
3. Configurez :
   - **Bucket Name** : `portfolio-images-crocodeal` (ou le nom de votre choix)
   - **Files in Bucket are** : `Public` ⚠️ **Important** : Doit être Public pour Cloudflare
   - **Default Encryption** : Activé
   - **Object Lock** : Désactivé (sauf si nécessaire)
4. Cliquez sur **Create a Bucket**

### 1.2 Créer une Application Key

1. Allez dans **App Keys** → **Add a New Application Key**
2. Configurez :
   - **Name** : `netlify-upload-key`
   - **Allow access to Bucket(s)** : Sélectionnez votre bucket
   - **Type of Access** : `Read and Write`
   - **Allow List All Bucket Names** : Désactivé (sécurité)
3. Cliquez sur **Create New Key**
4. **IMPORTANT** : Copiez immédiatement et sauvegardez dans un endroit sûr :
   - `keyID` (Application Key ID) - Exemple : `002a1b2c3d4e5f6g7h8i9j0k1l2m`
   - `applicationKey` (Application Key) - Exemple : `K001aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   - ⚠️ **Vous ne pourrez plus voir la clé après !**

### 1.3 Obtenir l'endpoint B2

1. Dans Backblaze B2, allez dans **Buckets** → Sélectionnez votre bucket
2. Regardez la section **"Endpoint"** ou **"Friendly URL"**
3. Vous verrez quelque chose comme : `f000.backblazeb2.com` ou `f003.backblazeb2.com`
   - Le format est : `fXXX.backblazeb2.com` où `XXX` est un numéro unique
4. **Notez cet endpoint** - vous en aurez besoin pour Cloudflare

**Exemple d'endpoint B2** :
```
f000.backblazeb2.com
```

**URL complète d'un fichier B2** (pour référence) :
```
https://f000.backblazeb2.com/file/portfolio-images-crocodeal/portfolio/portrait/album/photo.jpg
```

---

## 🌐 Étape 2 : Configuration Cloudflare CDN

Cloudflare va servir vos images stockées sur B2 via son CDN mondial, offrant une bande passante **illimitée** et des performances optimales.

### 2.1 Créer un compte Cloudflare (si nécessaire)

1. Allez sur [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Créez un compte gratuit (le plan gratuit est suffisant pour la bande passante illimitée)
3. Vérifiez votre email si nécessaire

### 2.2 Ajouter votre domaine à Cloudflare

#### 2.2.1 Si votre domaine n'est PAS encore sur Cloudflare

1. **Connectez-vous** à votre dashboard Cloudflare : [https://dash.cloudflare.com](https://dash.cloudflare.com)

2. **Ajoutez votre site** :
   - Cliquez sur **"Add a Site"** ou **"Add Site"** en haut à droite
   - ⚠️ **IMPORTANT** : Entrez **UNIQUEMENT** le nom de domaine, sans `https://` ni `.netlify.app`
   - ✅ Bon : `monsieurcrocodealphotographie.fr`
   - ❌ Mauvais : `https://monsieurcrocodealphotographie.netlify.app`
   - Cliquez sur **"Add site"**

3. **Choisissez un plan** :
   - Sélectionnez le plan **FREE** (gratuit) - c'est suffisant pour vos besoins
   - Cliquez sur **"Continue"**

4. **Cloudflare va scanner vos DNS actuels** :
   - Attendez quelques secondes que Cloudflare détecte vos enregistrements DNS existants
   - Vérifiez que tous vos enregistrements sont bien détectés (A, CNAME, MX, etc.)
   - Si certains enregistrements manquent, vous pourrez les ajouter manuellement plus tard

5. **Mettez à jour vos serveurs de noms** :
   - Cloudflare vous donnera **2 serveurs de noms** (ex: `alice.ns.cloudflare.com` et `bob.ns.cloudflare.com`)
   - ⚠️ **IMPORTANT** : Vous devez mettre à jour les serveurs de noms chez votre registrar

#### 2.2.2 Configuration spécifique pour OVH

Si vous avez acheté votre domaine chez **OVH** :

1. **Attendez l'activation du domaine** :
   - Vous recevrez un email de confirmation OVH
   - Le domaine est généralement actif en quelques minutes à quelques heures
   - Vérifiez dans votre espace client OVH que le domaine est bien actif

2. **Mettre à jour les serveurs de noms dans OVH** :
   - Connectez-vous à votre espace client OVH : [https://www.ovh.com/manager/](https://www.ovh.com/manager/)
   - Allez dans **"Web Cloud"** → **"Domaines"**
   - Sélectionnez votre domaine `monsieurcrocodealphotographie.fr`
   - Allez dans l'onglet **"Serveurs DNS"** ou **"Nameservers"**
   - Cliquez sur **"Modifier"** ou **"Changer les serveurs DNS"**
   - Remplacez les serveurs OVH par ceux fournis par Cloudflare
   - Exemple :
     ```
     Ancien (OVH) : dns200.anycast.me
     Nouveau (Cloudflare) : alice.ns.cloudflare.com
     Nouveau (Cloudflare) : bob.ns.cloudflare.com
     ```
   - Cliquez sur **"Valider"** ou **"Enregistrer"**
   - ⏱️ **Délai** : La propagation peut prendre 2-24h (souvent moins de 2h)

3. **Vérifier la propagation** :
   - Utilisez [dnschecker.org](https://dnschecker.org)
   - Vérifiez que les serveurs de noms Cloudflare sont bien propagés mondialement
   - Dans Cloudflare, le statut passera à **"Active"** (nuage orange) une fois propagé

#### 2.2.3 Si votre domaine est DÉJÀ sur Cloudflare

1. Connectez-vous à votre dashboard Cloudflare
2. Sélectionnez votre domaine dans la liste
3. Vous êtes prêt pour l'étape suivante !

### 2.3 Créer le sous-domaine CDN sur Cloudflare

Maintenant, créons le sous-domaine qui pointera vers votre bucket B2 :

1. **Dans Cloudflare**, sélectionnez votre domaine
2. Allez dans l'onglet **"DNS"** (menu de gauche)
3. Cliquez sur **"Add record"** ou **"Ajouter un enregistrement"**

4. **Configurez l'enregistrement CNAME** :
   
   **Type** : Sélectionnez `CNAME` dans le menu déroulant
   
   **Name** (Nom) : Entrez le sous-domaine que vous voulez utiliser
   - Exemples : `cdn`, `images`, `assets`, `media`, `static`
   - **Recommandation** : Utilisez `cdn` pour la simplicité
   - ⚠️ **Important** : N'entrez QUE le sous-domaine, pas le domaine complet
   - ✅ Bon : `cdn`
   - ❌ Mauvais : `cdn.monsieurcrocodealphotographie.fr`
   
   **Target** (Cible) : Entrez l'endpoint B2 que vous avez noté à l'étape 1.3
   - Format : `f000.backblazeb2.com` (remplacez `f000` par votre numéro)
   - ⚠️ **Important** : N'ajoutez PAS de `/` à la fin
   - ✅ Bon : `f000.backblazeb2.com`
   - ❌ Mauvais : `f000.backblazeb2.com/` ou `f000.backblazeb2.com/file/`
   
   **Proxy status** : ⚠️ **CRUCIAL** - Cliquez sur le nuage pour qu'il soit **ORANGE** (Proxied)
   - ✅ **Nuage orange** = Proxied = CDN activé = Bande passante illimitée
   - ❌ **Nuage gris** = DNS Only = Pas de CDN = Pas de bande passante illimitée
   - **Vérification** : Le nuage doit être **orange** 🟠 avant de sauvegarder !

5. **TTL** : Laissez sur `Auto` (automatique)

6. Cliquez sur **"Save"** ou **"Sauvegarder"**

**Exemple de configuration complète** :
```
Type: CNAME
Name: cdn
Target: f000.backblazeb2.com
Proxy status: 🟠 Proxied (orange)
TTL: Auto
```

### 2.4 Vérifier la configuration DNS

Après avoir créé l'enregistrement :

1. **Attendez 1-2 minutes** pour la propagation DNS
2. **Vérifiez dans Cloudflare** :
   - L'enregistrement doit apparaître dans la liste DNS
   - Le statut doit être **"Active"** ou **"Proxied"**
   - Le nuage doit être **orange** 🟠

3. **Testez avec un outil DNS** :
   - Allez sur [https://dnschecker.org](https://dnschecker.org)
   - Entrez : `cdn.monsieurcrocodealphotographie.fr`
   - Vérifiez que le CNAME pointe bien vers `f000.backblazeb2.com`
   - Vérifiez que les serveurs Cloudflare répondent (IPs Cloudflare)

4. **Testez l'accès HTTPS** :
   - Ouvrez votre navigateur
   - Allez sur : `https://cdn.monsieurcrocodealphotographie.fr`
   - Vous devriez voir une page B2 (erreur 404 normale si le bucket est vide)
   - ⚠️ Si vous voyez une erreur SSL, attendez quelques minutes pour la génération du certificat

### 2.5 Configurer le certificat SSL Cloudflare

Cloudflare génère automatiquement un certificat SSL gratuit pour votre sous-domaine :

1. **Allez dans** : **SSL/TLS** (menu de gauche)
2. **Vérifiez le mode** : Doit être sur **"Full"** ou **"Full (strict)"**
   - **Full** : Recommandé pour B2 (certificat auto-signé accepté)
   - **Full (strict)** : Nécessite un certificat valide côté B2
3. **Attendez 5-10 minutes** pour la génération automatique du certificat
4. **Vérifiez** : `https://cdn.monsieurcrocodealphotographie.fr` doit fonctionner avec un cadenas vert 🔒

### 2.6 Optimiser les paramètres Cloudflare (Optionnel mais recommandé)

Pour de meilleures performances :

1. **Allez dans** : **Speed** → **Optimization**
   - Activez **"Auto Minify"** pour CSS, HTML, JS (si applicable)
   - Activez **"Brotli"** pour une meilleure compression

2. **Allez dans** : **Caching** → **Configuration**
   - **Caching Level** : `Standard`
   - **Browser Cache TTL** : `Respect Existing Headers` (B2 gère déjà les headers)
   - Activez **"Always Online"** pour une meilleure disponibilité

3. **Allez dans** : **Network**
   - Activez **"HTTP/2"**
   - Activez **"HTTP/3 (with QUIC)"** si disponible
   - Activez **"0-RTT Connection Resumption"**

### 2.7 Notez l'URL finale du CDN

Une fois tout configuré, notez l'URL complète de votre CDN :

**Format** : `https://cdn.monsieurcrocodealphotographie.fr`

⚠️ **Important** : Cette URL sera utilisée dans la variable d'environnement `CLOUDFLARE_CDN_URL` dans Netlify.

---

## ⚙️ Étape 3 : Configuration Netlify

### 3.1 Ajouter les variables d'environnement

Dans votre dashboard Netlify :

1. Allez dans votre site Netlify
2. Allez dans **Site settings** → **Environment variables**
3. Cliquez sur **"Add a variable"** ou **"Ajouter une variable"**
4. Ajoutez les variables suivantes **une par une** :

**Variable 1** :
```
Key: B2_APPLICATION_KEY_ID
Value: [Votre Application Key ID copiée à l'étape 1.2]
```

**Variable 2** :
```
Key: B2_APPLICATION_KEY
Value: [Votre Application Key copiée à l'étape 1.2]
```

**Variable 3** :
```
Key: B2_BUCKET_NAME
Value: portfolio-images-crocodeal
```
(Remplacez par le nom exact de votre bucket B2)

**Variable 4** :
```
Key: CLOUDFLARE_CDN_URL
Value: https://cdn.monsieurcrocodealphotographie.fr
```
⚠️ **Important** : 
- Utilisez `https://` au début
- Pas de `/` à la fin
- Remplacez par votre sous-domaine Cloudflare

5. Cliquez sur **"Save"** pour chaque variable

⚠️ **Sécurité** : Ne partagez jamais ces clés publiquement ! Elles sont stockées de manière sécurisée dans Netlify.

### 3.2 Redéployer le site

Après avoir ajouté toutes les variables :

1. Allez dans **Deploys** (menu principal)
2. Cliquez sur **"Trigger deploy"** → **"Deploy site"**
3. Attendez que le déploiement se termine
4. Vérifiez qu'il n'y a pas d'erreurs dans les logs

**Alternative** : Faites un commit Git vide pour déclencher un déploiement automatique :
```bash
git commit --allow-empty -m "Trigger deploy for B2 migration"
git push
```

### 3.3 Configurer le domaine personnalisé sur Netlify (Optionnel)

Si vous voulez utiliser votre domaine `monsieurcrocodealphotographie.fr` pour votre site Netlify au lieu de `.netlify.app` :

#### 3.3.1 Ajouter le domaine dans Netlify

1. **Dans Netlify**, allez dans votre site
2. Allez dans **Site settings** → **Domain management**
3. Cliquez sur **"Add custom domain"** ou **"Ajouter un domaine personnalisé"**
4. Entrez votre domaine : `monsieurcrocodealphotographie.fr`
5. Cliquez sur **"Add domain"**

#### 3.3.2 Configurer le domaine dans Cloudflare

Netlify vous donnera un enregistrement DNS à créer dans Cloudflare :

1. **Notez l'enregistrement fourni par Netlify** :
   - Il peut être de type `A` avec une IP (ex: `75.2.60.5`)
   - Ou de type `CNAME` avec une cible comme `monsieurcrocodealphotographie.netlify.app`
   - Netlify vous indiquera lequel utiliser

2. **Dans Cloudflare**, allez dans **DNS** → **Add record**

3. **Si Netlify donne une IP (Type A)** :
   ```
   Type: A
   Name: @ (ou laissez vide pour le domaine racine)
   Target: [IP fournie par Netlify, ex: 75.2.60.5]
   Proxy status: 🟠 Proxied (orange)
   TTL: Auto
   ```

4. **Si Netlify donne un CNAME** :
   ```
   Type: CNAME
   Name: @ (ou laissez vide pour le domaine racine)
   Target: monsieurcrocodealphotographie.netlify.app
   Proxy status: 🟠 Proxied (orange)
   TTL: Auto
   ```
   ⚠️ **Note** : Certains registrars ne supportent pas CNAME sur le domaine racine (@). Dans ce cas, utilisez un enregistrement A avec l'IP fournie par Netlify.

5. **Pour le sous-domaine www (optionnel)** :
   ```
   Type: CNAME
   Name: www
   Target: monsieurcrocodealphotographie.netlify.app
   Proxy status: 🟠 Proxied (orange)
   TTL: Auto
   ```

6. **Attendez la vérification Netlify** :
   - Netlify vérifiera automatiquement la configuration DNS
   - Cela peut prendre quelques minutes
   - Le statut passera à **"Active"** une fois vérifié
   - Vous recevrez un email de confirmation

#### 3.3.3 Configuration SSL pour le domaine principal

1. **Dans Netlify** :
   - Allez dans **Domain management**
   - Netlify générera automatiquement un certificat SSL Let's Encrypt
   - Attendez quelques minutes pour la génération
   - Le statut passera à **"Active"** une fois le certificat généré

2. **Dans Cloudflare** :
   - Allez dans **SSL/TLS**
   - Mode : **"Full"** ou **"Full (strict)"**
   - Cloudflare gérera automatiquement le SSL entre le visiteur et Cloudflare
   - Netlify gérera le SSL entre Cloudflare et Netlify

#### 3.3.4 Vérification finale du domaine principal

1. Testez votre domaine : `https://monsieurcrocodealphotographie.fr`
2. Le site doit se charger correctement
3. Le cadenas SSL doit être vert 🔒
4. Redirigez automatiquement vers HTTPS si nécessaire

---

## 📤 Étape 4 : Tester l'upload

1. Allez sur votre site : `https://monsieurcrocodealphotographie.fr/admin/batch-upload.html` (ou votre URL Netlify)
2. Connectez-vous avec votre compte GitHub
3. Testez l'upload d'une photo :
   - Sélectionnez un album (ex: "Test Album")
   - Sélectionnez une catégorie (ex: "Portrait")
   - Sélectionnez 1-2 photos de test
   - Cliquez sur **"Uploader les photos"**
   - Attendez la fin de l'upload (barre de progression)
4. Vérifiez que l'image apparaît correctement :
   - L'image doit apparaître dans le portfolio
   - L'URL de l'image doit commencer par `https://cdn.monsieurcrocodealphotographie.fr`
   - L'image doit se charger rapidement (CDN actif)

---

## 🔄 Étape 5 : Migration des images existantes (Optionnel)

Si vous avez déjà des images sur Cloudinary, vous pouvez :

1. **Les laisser sur Cloudinary** : Le code supporte les deux systèmes en parallèle
   - Les anciennes images continueront de fonctionner
   - Les nouvelles images utiliseront B2 + Cloudflare

2. **Les migrer vers B2** : Utilisez un script de migration (à créer si nécessaire)
   - Téléchargez les images depuis Cloudinary
   - Uploadez-les vers B2 via la fonction `b2-upload`
   - Mettez à jour les URLs dans les fichiers markdown

---

## 📊 Comparaison des coûts

### Cloudinary (Plan gratuit)
- ❌ 25 GB de stockage
- ❌ 25 GB de bande passante/mois
- ❌ Limites strictes
- ❌ Coûts élevés si dépassement

### Backblaze B2 + Cloudflare
- ✅ **B2** : $5/TB stockage, $10/TB sortie (gratuit jusqu'à 10 GB/jour)
- ✅ **Cloudflare** : Bande passante **ILLIMITÉE** (plan gratuit)
- ✅ **Total estimé** : ~$5-10/mois pour 100 GB stockage + trafic illimité
- ✅ **Économies** : Pas de limite de bande passante = pas de surprise sur la facture

---

## 🛠️ Dépannage

### Erreur : "Configuration B2 manquante"
- Vérifiez que toutes les variables d'environnement sont définies dans Netlify
- Vérifiez l'orthographe exacte des noms de variables (sensibles à la casse)
- Redéployez le site après avoir ajouté les variables
- Vérifiez les logs Netlify : **Functions** → **b2-upload** → **Logs**

### Erreur : "Bucket introuvable"
- Vérifiez que `B2_BUCKET_NAME` correspond exactement au nom de votre bucket (sensible à la casse)
- Vérifiez que votre Application Key a les permissions sur ce bucket
- Vérifiez que le bucket existe bien dans votre compte B2

### Erreur : "Erreur authentification B2"
- Vérifiez que `B2_APPLICATION_KEY_ID` et `B2_APPLICATION_KEY` sont corrects
- Les clés sont sensibles à la casse
- Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs dans Netlify
- Recréez une nouvelle Application Key si nécessaire

### Images ne s'affichent pas
- Vérifiez que `CLOUDFLARE_CDN_URL` est correct (format : `https://cdn.monsieurcrocodealphotographie.fr` sans `/` à la fin)
- Vérifiez que le CNAME Cloudflare est bien configuré avec le proxy activé (nuage orange 🟠)
- Vérifiez les permissions du bucket B2 (doit être **Public**)
- Testez l'URL directement : `https://cdn.monsieurcrocodealphotographie.fr/portfolio/portrait/album/photo.jpg`
- Vérifiez les logs Cloudflare : **Analytics** → **Logs** pour voir les erreurs
- Vérifiez la console du navigateur (F12) pour les erreurs de chargement

### Erreur : "Certificate error" ou "SSL not working"
- Attendez 5-10 minutes après la création du CNAME pour la génération du certificat SSL
- Vérifiez que le mode SSL/TLS est sur **"Full"** (pas "Flexible")
- Allez dans **SSL/TLS** → **Edge Certificates** → Vérifiez que le certificat est actif
- Si le problème persiste, changez temporairement en "Flexible" puis remettez en "Full"
- Vérifiez que le sous-domaine est bien proxied (nuage orange)

### Erreur : "DNS propagation" ou "CNAME not resolving"
- Utilisez [dnschecker.org](https://dnschecker.org) pour vérifier la propagation mondiale
- Vérifiez que les serveurs de noms Cloudflare sont bien configurés chez votre registrar (OVH)
- Attendez jusqu'à 48h pour la propagation complète (souvent moins de 2h)
- Vérifiez que le CNAME pointe bien vers `f000.backblazeb2.com` (sans `/` à la fin)
- Vérifiez l'orthographe du sous-domaine dans Cloudflare

### Erreur : "403 Forbidden" ou "Access Denied" sur les images
- Vérifiez que le bucket B2 est configuré en **Public** (pas Private)
- Vérifiez que l'Application Key B2 a les permissions de **lecture**
- Testez l'accès direct à B2 : `https://f000.backblazeb2.com/file/bucket-name/test.jpg`
- Vérifiez les règles de sécurité Cloudflare : **Security** → **WAF** (peut bloquer certaines requêtes)
- Désactivez temporairement le WAF pour tester

### Le nuage Cloudflare est gris au lieu d'orange
- ⚠️ **CRITIQUE** : Le nuage doit être **orange** (Proxied) pour activer le CDN
- Cliquez sur le nuage gris pour le passer en orange
- Si le nuage reste gris, vérifiez que le CNAME est bien configuré
- Le nuage gris = DNS seulement = Pas de CDN = Pas de bande passante illimitée
- Vérifiez que vous avez bien sélectionné le type CNAME (pas A)

### Images lentes à charger malgré Cloudflare
- Vérifiez que le cache Cloudflare fonctionne : **Caching** → **Configuration**
- Activez **"Always Online"** dans **Caching** → **Configuration**
- Vérifiez la compression : **Speed** → **Optimization** → Activez **"Brotli"**
- Vérifiez les logs Cloudflare pour voir si les images sont bien servies depuis le cache
- Vérifiez que le nuage est orange (Proxied)

### Erreur : "CNAME chain too long"
- Cloudflare ne supporte pas les chaînes CNAME trop longues
- Vérifiez que votre CNAME pointe directement vers `f000.backblazeb2.com`
- Ne créez pas de CNAME qui pointe vers un autre CNAME

### Le sous-domaine ne fonctionne pas
- Vérifiez l'orthographe : `cdn` (pas `CDN` ou `Cdn`)
- Vérifiez que vous n'avez pas mis le domaine complet dans "Name" (juste `cdn`)
- Vérifiez qu'il n'y a pas de conflit avec un autre enregistrement DNS
- Attendez quelques minutes pour la propagation DNS locale
- Videz le cache DNS de votre ordinateur : `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

### Erreur lors de l'upload dans Netlify Functions
- Vérifiez les logs Netlify : **Functions** → **b2-upload** → **Logs**
- Vérifiez que toutes les variables d'environnement sont correctement définies
- Vérifiez que les clés B2 sont valides et non expirées
- Vérifiez que le bucket existe et est accessible
- Vérifiez les permissions de l'Application Key B2

---

## 📝 Notes importantes

1. **Sécurité** : 
   - Les clés B2 sont sensibles, ne les commitez jamais dans Git
   - Stockez-les uniquement dans les variables d'environnement Netlify
   - Ne partagez jamais ces clés publiquement

2. **Cache** : 
   - Cloudflare met en cache automatiquement les images
   - Le cache peut prendre quelques minutes à se mettre à jour après un upload
   - Vous pouvez purger le cache dans Cloudflare si nécessaire : **Caching** → **Purge Cache**

3. **Performance** : 
   - Cloudflare CDN améliore les temps de chargement
   - Les images sont servies depuis le serveur le plus proche du visiteur
   - La bande passante est illimitée avec Cloudflare

4. **Compatibilité** : 
   - Le code supporte les anciennes URLs Cloudinary pour une migration progressive
   - Vous pouvez migrer progressivement vos images sans tout casser

5. **Coûts** :
   - B2 : Gratuit jusqu'à 10 GB/jour de sortie
   - Cloudflare : Gratuit avec bande passante illimitée
   - Total : Très économique comparé à Cloudinary

---

## ✅ Checklist de migration

### Backblaze B2
- [ ] Compte Backblaze B2 créé
- [ ] Bucket B2 créé avec nom noté : `portfolio-images-crocodeal`
- [ ] Bucket configuré en **Public** (pour Cloudflare)
- [ ] Application Key B2 créée
- [ ] Key ID et Application Key copiés et sauvegardés dans un endroit sûr
- [ ] Endpoint B2 noté : `f000.backblazeb2.com` (remplacez par votre endpoint)

### Cloudflare
- [ ] Compte Cloudflare créé
- [ ] Domaine `monsieurcrocodealphotographie.fr` ajouté à Cloudflare
- [ ] Serveurs de noms Cloudflare configurés chez OVH
- [ ] Domaine actif sur Cloudflare (statut orange)
- [ ] Enregistrement CNAME créé : `cdn` → `f000.backblazeb2.com`
- [ ] Proxy status : **Orange** (Proxied) 🟠
- [ ] Certificat SSL actif (cadenas vert)
- [ ] Test d'accès : `https://cdn.monsieurcrocodealphotographie.fr` fonctionne
- [ ] URL CDN finale notée : `https://cdn.monsieurcrocodealphotographie.fr`

### Netlify
- [ ] Variable `B2_APPLICATION_KEY_ID` ajoutée
- [ ] Variable `B2_APPLICATION_KEY` ajoutée
- [ ] Variable `B2_BUCKET_NAME` ajoutée avec le bon nom
- [ ] Variable `CLOUDFLARE_CDN_URL` ajoutée (format correct, sans `/` à la fin)
- [ ] Site redéployé après ajout des variables
- [ ] Domaine personnalisé configuré (optionnel)

### Tests finaux
- [ ] Test d'upload réussi via `batch-upload.html`
- [ ] Image uploadée visible dans le portfolio
- [ ] URL de l'image commence par `https://cdn.monsieurcrocodealphotographie.fr`
- [ ] Image se charge rapidement (CDN actif)
- [ ] Pas d'erreurs dans la console du navigateur (F12)
- [ ] Pas d'erreurs dans les logs Netlify Functions
- [ ] Certificat SSL valide (cadenas vert)

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Netlify** : 
   - **Functions** → **b2-upload** → **Logs**
   - Cherchez les erreurs en rouge

2. **Vérifiez la console du navigateur** : 
   - Appuyez sur F12
   - Allez dans l'onglet **Console**
   - Cherchez les erreurs en rouge

3. **Vérifiez les logs Cloudflare** : 
   - **Analytics** → **Logs**
   - Filtrez par votre sous-domaine CDN

4. **Vérifiez les permissions** :
   - B2 : Bucket public, Application Key avec permissions Read/Write
   - Cloudflare : CNAME proxied (orange), SSL en mode Full

5. **Testez étape par étape** :
   - Testez d'abord l'accès direct à B2
   - Testez ensuite l'accès via Cloudflare CDN
   - Testez enfin l'upload depuis Netlify

---

**Migration terminée ! 🎉**

Votre site utilise maintenant Backblaze B2 + Cloudflare avec une bande passante illimitée !

**Résumé de ce qui a été configuré** :
- ✅ Stockage : Backblaze B2 (économique et fiable)
- ✅ CDN : Cloudflare (bande passante illimitée)
- ✅ Domaine : `monsieurcrocodealphotographie.fr` (professionnel)
- ✅ SSL : Certificats automatiques (sécurisé)
- ✅ Performance : Images servies depuis le serveur le plus proche

**Prochaines étapes** :
- Uploadez vos photos via `batch-upload.html`
- Profitez de la bande passante illimitée !
- Surveillez les coûts B2 (gratuit jusqu'à 10 GB/jour)
