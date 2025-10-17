# Portfolio Monsieur Crocodeal - Photographe Professionnel

Site web portfolio moderne avec CMS intégré.

## ✨ Fonctionnalités

### Design & Interface
- **Effet Liquid Glass** : Header semi-transparent avec effet de flou moderne
- **3D Interactive** : Caméras 3D rotatives dans la section hero
- **Design responsive** : Adaptation parfaite pour desktop, tablettes et mobiles
- **Animations fluides** : Animations au scroll et transitions élégantes
- **Modal images** : Agrandissement des photos en plein écran

### CMS Intégré
- **Decap CMS** : Interface d'administration pour gérer le contenu
- **Authentification** : Git Gateway + Netlify Identity
- **Collections** : Portfolio avec gestion des images
- **Contenu dynamique** : À propos, contact, hero section

### Sections du site
1. **Hero** : Section d'accueil avec sphère 3D et caméras rotatives
2. **Portfolio** : 6 catégories de photographie
   - Portrait
   - Mariage
   - Immobilier
   - Paysage
   - Macro
   - Lifestyle
3. **À propos** : Présentation du photographe
4. **Contact** : Formulaire de contact et coordonnées
5. **Footer** : Liens réseaux sociaux et copyright

## 🚀 Installation

1. **Cloner ou télécharger** le projet
2. **Ouvrir** le fichier `index.html` dans votre navigateur

## 🔧 Configuration CMS

### 1. Déployer sur Netlify
- Connecter le repository GitHub
- Déployer automatiquement

### 2. Activer Netlify Identity
- **Site settings** → **Identity** → **Enable Identity**
- **Git Gateway** → **Enable Git Gateway**

### 3. Accéder à l'admin
- Va sur : `ton-site.netlify.app/admin`
- Connecte-toi avec tes identifiants

## 📁 Structure des fichiers

```
Code-Site-webmaximeV2/
├── _redirects                    # Redirections Netlify
├── admin/                       # Interface CMS
│   ├── config.yml              # Configuration CMS
│   └── index.html              # Interface admin
├── assets/                      # Ressources du site
│   ├── camera.glb              # Modèle 3D
│   ├── GoodButter.otf          # Police titre
│   ├── Logo.webp               # Logo
│   ├── Marble Light.ttf        # Police corps
│   └── Photos/                 # Photos
├── AUTH0-NETLIFY-SETUP.md       # Instructions CMS
├── camera3d.js                  # Script 3D
├── content/                     # Contenu CMS
│   ├── about.yml               # Contenu à propos
│   ├── contact.yml             # Contenu contact
│   └── hero.yml                # Contenu hero
├── index.html                   # Site principal
├── netlify.toml                 # Configuration Netlify
├── script.js                    # Scripts du site
├── static/                      # Dossier CMS
│   └── img/                    # Images CMS
└── styles.css                   # Styles du site
```

## 🎨 Personnalisation

### Couleurs
Les couleurs sont définies dans les variables CSS au début du fichier `styles.css` :

```css
:root {
    --color-primary: #4A90E2;
    --color-secondary: #5AB9EA;
    --color-accent: #7EC8E3;
    --color-text: #FFFFFF;
    --color-text-secondary: #B8C5D6;
    --color-background: #0A1628;
}
```

### Typographie
- **Titres** : GoodButter (police personnalisée)
- **Corps** : Marble Light (police personnalisée)

### Images
- **Logo** : `assets/Logo.webp`
- **Photos** : `assets/Photos/`
- **CMS** : `static/img/`

## 🔧 Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles et animations
- **JavaScript** : Interactions et 3D
- **Three.js** : Rendu 3D
- **Decap CMS** : Gestion de contenu
- **Netlify** : Hébergement et déploiement

## 📊 Optimisations

### Performance
- Lazy loading des images
- Animations optimisées
- Images WebP
- CSS et JavaScript minifiés

### SEO
- Balises meta optimisées
- Attributs alt descriptifs
- Structure sémantique HTML5
- Open Graph pour le partage

### Accessibilité
- Navigation au clavier
- Attributs ARIA
- Support des lecteurs d'écran
- Focus visible

## 🌐 Déploiement

### Netlify (Recommandé)
1. Connecter le repository GitHub
2. Déployer automatiquement
3. Configurer Netlify Identity
4. Accéder à l'admin sur `/admin`

## 📧 Support

Pour toute question concernant ce portfolio :
- Email : maxvir3@hotmail.fr
- Téléphone : +33642616494
- Localisation : Nîmes, France

## 📄 Licence

Ce projet est créé pour Monsieur Crocodeal. Tous droits réservés © 2025.

---

**Développé avec ❤️ pour créer un portfolio photographique élégant et performant**

