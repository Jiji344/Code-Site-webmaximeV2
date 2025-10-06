# Portfolio Monsieur Crocodeal - Photographe Professionnel

Site web portfolio one-page moderne et responsive pour photographe professionnel, avec un design élégant utilisant l'effet "liquid glass" et un dégradé bleu nuit.

## ✨ Fonctionnalités

### Design & Interface
- **Effet Liquid Glass** : Header semi-transparent avec effet de flou (blur) moderne
- **Dégradé élégant** : Background avec dégradé bleu nuit subtil
- **Design responsive** : Adaptation parfaite pour desktop, tablettes et mobiles
- **Menu mobile élégant** : Menu hamburger avec effet liquid glass cohérent
- **Animations fluides** : Animations au scroll et transitions élégantes
- **Modal images** : Agrandissement des photos en plein écran

### Sections du site
1. **Hero** : Section d'accueil avec image de fond et appel à l'action
2. **Portfolio** : 6 catégories de photographie
   - Portrait
   - Événements
   - Photo de rue
   - Paysage
   - Macro
   - Lifestyle
3. **À propos** : Présentation du photographe avec parcours et vision
4. **Contact** : Formulaire de contact et coordonnées
5. **Footer** : Liens réseaux sociaux et copyright

### Optimisations

#### SEO
- Balises meta optimisées
- Attributs alt descriptifs sur toutes les images
- Structure sémantique HTML5
- Open Graph pour le partage sur les réseaux sociaux
- Favicon personnalisé

#### Accessibilité
- Navigation au clavier complète
- Attributs ARIA appropriés
- Piège à focus dans les modales et menus
- Support des lecteurs d'écran
- Respect des préférences utilisateur (mouvement réduit, contraste élevé)
- Focus visible pour la navigation clavier

#### Performance
- Lazy loading des images
- Debouncing des événements de scroll
- Images optimisées via Unsplash
- CSS et JavaScript optimisés
- Animations conditionnelles selon les préférences

## 🚀 Installation

1. **Cloner ou télécharger** le projet dans votre répertoire
2. **Ouvrir** le fichier `index.html` dans votre navigateur préféré

Aucune installation de dépendances n'est nécessaire ! Le site utilise uniquement :
- HTML5
- CSS3 (avec Google Fonts - Poppins)
- JavaScript Vanilla (pas de frameworks)

## 📱 Compatibilité

### Navigateurs supportés
- Chrome (dernière version)
- Firefox (dernière version)
- Safari (dernière version)
- Edge (dernière version)
- Opera (dernière version)

### Résolutions testées
- Desktop : 1920px et plus
- Laptop : 1200px - 1920px
- Tablette : 768px - 1200px
- Mobile : 350px - 768px

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
    /* ... */
}
```

### Typographie
Pour changer la police, modifiez l'import Google Fonts dans `index.html` et la variable dans `styles.css` :

```css
--font-family: 'Poppins', sans-serif;
```

### Images
Les images proviennent actuellement d'Unsplash. Pour utiliser vos propres photos :
1. Remplacez les URLs dans les balises `<img src="...">`
2. Conservez les attributs `alt` descriptifs pour le SEO
3. Optimisez vos images (format WebP recommandé, taille < 500KB)

### Contenu
- **Textes** : Modifiez directement dans `index.html`
- **Coordonnées** : Section Contact dans `index.html`
- **Réseaux sociaux** : Footer dans `index.html`

## 📊 Google Lighthouse

Le site est optimisé pour obtenir d'excellents scores Lighthouse :

- ⚡ **Performance** : 90+
- ♿ **Accessibilité** : 95+
- 🎯 **Meilleures pratiques** : 95+
- 🔍 **SEO** : 100

### Comment tester
1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet "Lighthouse"
3. Sélectionnez les catégories à tester
4. Cliquez sur "Analyze page load"

## 🔧 Fonctionnalités JavaScript

### Menu mobile
- Ouverture/fermeture avec animation
- Fermeture au clic sur un lien
- Fermeture avec touche Escape
- Piège à focus pour l'accessibilité

### Modal images
- Agrandissement des photos au clic
- Fermeture au clic extérieur
- Fermeture avec touche Escape
- Navigation au clavier

### Formulaire de contact
- Validation des champs
- Notification de succès/erreur
- Animation de chargement

### Animations
- Scroll reveal pour les sections
- Changement d'opacité du header au scroll
- Indicateurs de section active dans la navigation

## 📝 Structure des fichiers

```
Code-Site-webmaximeV2/
│
├── index.html          # Structure HTML du site
├── styles.css          # Styles et responsive design
├── script.js           # Interactions et animations
└── README.md           # Documentation (ce fichier)
```

## 🌐 Déploiement

### Hébergement statique
Le site peut être déployé sur n'importe quelle plateforme d'hébergement statique :

- **GitHub Pages** : Gratuit et simple
- **Netlify** : Déploiement automatique
- **Vercel** : Optimisé pour les sites statiques
- **OVH/Ionos** : Hébergement classique

### Étapes pour GitHub Pages
1. Créer un repository GitHub
2. Pousser les fichiers
3. Aller dans Settings > Pages
4. Sélectionner la branche main
5. Le site sera accessible à `https://username.github.io/repository-name`

## 🔒 Sécurité et confidentialité

- Aucun cookie n'est utilisé
- Aucune donnée n'est collectée automatiquement
- Le formulaire de contact nécessite une intégration backend pour fonctionner (actuellement en mode démo)

### Intégrer un vrai formulaire
Pour que le formulaire fonctionne réellement, vous pouvez utiliser :
- **Formspree** : Service gratuit pour formulaires
- **EmailJS** : Envoi d'emails via JavaScript
- **Backend personnalisé** : PHP, Node.js, etc.

## 📧 Support et contact

Pour toute question ou suggestion concernant ce portfolio :
- Email : contact@monsieurcrocodeal.fr
- Téléphone : +33 1 23 45 67 89
- Localisation : Montpellier, France

## 📄 Licence

Ce projet est créé pour Monsieur Crocodeal. Tous droits réservés © 2025.

---

**Développé avec ❤️ pour créer un portfolio photographique élégant et performant**

