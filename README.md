# 📸 Portfolio Monsieur Crocodeal

Site web portfolio pour photographe professionnel avec système de gestion de contenu (CMS).

---

## 🚀 Fonctionnalités

- ✅ Portfolio organisé par catégories (Portrait, Mariage, Immobilier, Événementiel)
- ✅ Système d'albums avec carrousel
- ✅ Upload multiple : 20 photos en 30 secondes
- ✅ Auto-numérotation des photos
- ✅ Formulaire de contact avec Netlify Forms
- ✅ Design moderne avec effets liquid glass
- ✅ 100% responsive (mobile, tablet, desktop)

---

## 📦 Technologies

- HTML5 / CSS3 / JavaScript
- Decap CMS (gestion de contenu)
- Netlify (hébergement + fonctions serverless)
- **Backblaze B2** (stockage d'images) + **Cloudflare CDN** (bande passante illimitée)
- GitHub (stockage des contenus markdown)
- Three.js (animations 3D)

---

## 🎯 Upload Multiple de Photos

### Accès rapide :
`https://photographemonsieurcrocodeal.netlify.app/admin/batch-upload.html`

### Utilisation :
1. Clique sur "📸 Upload Multiple" dans le CMS
2. Remplis le formulaire (titre + catégorie)
3. Sélectionne 10-20 photos
4. Upload → **Terminé en 30 secondes !**

**Automatique** :
- ✅ Auto-numérotation (Titre 1, Titre 2, Titre 3...)
- ✅ Upload sur Backblaze B2 (servi via Cloudflare CDN)
- ✅ Bande passante **ILLIMITÉE** avec Cloudflare
- ✅ Images optimisées automatiquement
- ✅ Index régénéré automatiquement
- ✅ Site mis à jour automatiquement

---

## 📁 Structure du Projet

```
├── admin/                     # CMS Decap
│   ├── config.yml            # Configuration CMS
│   ├── index.html            # Interface CMS
│   └── batch-upload.html     # Upload multiple
├── content/portfolio/         # Contenus photos
│   ├── portrait/
│   ├── mariage/
│   ├── immobilier/
│   └── événementiel/
├── netlify/functions/        # Fonctions serverless
│   ├── batch-upload.js      # Upload multiple
│   ├── b2-upload.js         # Upload Backblaze B2
│   └── clean-portfolio.js   # Nettoyage portfolio
├── _emails/                  # Templates emails
├── index.html               # Page principale
├── styles.css               # Styles
├── script.js                # JavaScript principal
├── cms-content.js           # Chargement CMS
├── portfolio-carousel.js    # Carrousel sections
├── camera3d.js              # Animation 3D
└── portfolio-index.json     # Index photos (auto-généré par fonction Netlify)
```

---

## ⚙️ Configuration Requise

### Variables d'environnement Netlify :
- `GITHUB_TOKEN` : Token GitHub avec scope `repo`
- `B2_APPLICATION_KEY_ID` : Application Key ID Backblaze B2
- `B2_APPLICATION_KEY` : Application Key Backblaze B2
- `B2_BUCKET_NAME` : Nom du bucket B2 (ex: `portfolio-images`)
- `CLOUDFLARE_CDN_URL` : URL du CDN Cloudflare (ex: `https://cdn.votredomaine.com`)

📖 **Guide complet de migration** : Voir [GUIDE_MIGRATION_B2_CLOUDFLARE.md](./GUIDE_MIGRATION_B2_CLOUDFLARE.md)

---

## 🛠️ Développement Local

```bash
# Installer les dépendances
npm install

# Développement local avec Netlify Dev
npm run dev
```

---

## 🚀 Déploiement

**Automatique via GitHub :**
```bash
git add .
git commit -m "Update"
git push origin main
```

Netlify détecte automatiquement et déploie !

---

## 📞 Contact

Email : maxvir3@hotmail.fr  
Site : https://photographemonsieurcrocodeal.netlify.app

---

**Portfolio propulsé par Decap CMS, Netlify, Backblaze B2 & Cloudflare** 🚀

---

## 🔄 Migration Cloudinary → B2 + Cloudflare

Ce projet a été migré de Cloudinary vers **Backblaze B2 + Cloudflare** pour bénéficier d'une **bande passante illimitée**.

📖 **Guide de migration complet** : [GUIDE_MIGRATION_B2_CLOUDFLARE.md](./GUIDE_MIGRATION_B2_CLOUDFLARE.md)

### Avantages de la migration :
- ✅ **Bande passante illimitée** avec Cloudflare (plan gratuit)
- ✅ **Coûts réduits** : ~$5-10/mois pour 100 GB vs limitations Cloudinary
- ✅ **Performance améliorée** grâce au CDN Cloudflare
- ✅ **Compatibilité** : Support des anciennes URLs Cloudinary pour migration progressive
