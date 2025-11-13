# 📸 Portfolio Monsieur Crocodeal

Site web portfolio pour photographe professionnel avec système de gestion de contenu (CMS).

---

## 🚀 Fonctionnalités

- ✅ Portfolio organisé par catégories (Portrait, Mariage, Immobilier, Paysage, Macro, Lifestyle)
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
- Cloudinary (hébergement et optimisation d'images)
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
- ✅ Upload sur Cloudinary (pas de limite de taille)
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
│   ├── paysage/
│   ├── macro/
│   └── lifestyle/
├── netlify/functions/        # Fonctions serverless
│   ├── batch-upload.js      # Upload multiple
│   ├── cloudinary-upload.js # Upload Cloudinary
│   └── cms-config.js        # Config Cloudinary pour CMS
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
- `CLOUDINARY_CLOUD_NAME` : Nom de votre compte Cloudinary
- `CLOUDINARY_API_KEY` : Clé API Cloudinary
- `CLOUDINARY_API_SECRET` : Secret API Cloudinary (pour fonctions serveur)
- `CLOUDINARY_UPLOAD_PRESET` : Nom du preset Cloudinary (optionnel, défaut: `ml_default`)

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

**Portfolio propulsé par Decap CMS & Netlify** 🚀
