# 🖼️ Système de Préchargement des Images

## 📋 Vue d'ensemble

Ce document explique le système de préchargement intelligent des images mis en place pour optimiser les performances du portfolio.

## 🎯 Objectifs

- ⚡ **Réduire les latences** lors de l'affichage des photos haute qualité
- 🎨 **Améliorer l'expérience utilisateur** avec des transitions fluides
- 📱 **Optimiser la bande passante** avec un préchargement progressif

## 🔧 Fonctionnement

### 1. Classe `ImagePreloader`

La classe gère le préchargement des images en arrière-plan :

```javascript
const preloader = new ImagePreloader();
await preloader.preload('url-image.jpg', 'high'); // Priorité haute
```

#### Méthodes principales :

| Méthode | Description | Utilisation |
|---------|-------------|-------------|
| `preload(url, priority)` | Précharge une seule image | Préchargement ciblé |
| `preloadBatch(urls, priority)` | Précharge un lot d'images | Préchargement de masse |
| `preloadVisible(container)` | Précharge les images visibles | Lazy loading intelligent |

#### Priorités :

- **`high`** : Images immédiatement visibles (album ouvert, images viewport)
- **`low`** : Images en arrière-plan (reste du portfolio)

### 2. Stratégie de Préchargement

#### Phase 1 : Chargement initial
```
1. Chargement des métadonnées du portfolio
2. Affichage des thumbnails/cartes d'albums
3. ✅ Site utilisable immédiatement
```

#### Phase 2 : Préchargement intelligent (après 1 seconde)
```
4. Préchargement de toutes les images en arrière-plan
5. Traitement par lots de 3 images en parallèle
6. Pas de blocage de l'interface utilisateur
```

#### Phase 3 : Ouverture d'album
```
7. Préchargement prioritaire de toutes les images de l'album
8. Chargement instantané lors de la navigation
9. ✅ Expérience fluide garantie
```

### 3. Contrôle de Concurrence

```javascript
maxConcurrent: 3  // Max 3 images en parallèle
```

Évite de saturer la bande passante et permet une navigation fluide même pendant le préchargement.

### 4. Cache Intelligent

```javascript
this.preloadedImages = new Set();  // Cache des URLs déjà préchargées
```

Les images déjà préchargées ne sont pas rechargées, économisant la bande passante.

## 🎨 Effets Visuels

### 1. Effet de Chargement (Shimmer)

Pendant le chargement d'une image dans le carousel :

```css
.carousel-image.loading {
    opacity: 0.3;
    animation: shimmer 1.5s infinite;
}
```

**Résultat** : Animation de vague lumineuse bleue qui indique le chargement.

### 2. Fade-in des Images

Les images des cartes apparaissent progressivement :

```css
.image-card img {
    opacity: 0;
    transition: opacity 0.3s ease-in;
}

.image-card img.loaded {
    opacity: 1;
}
```

**Résultat** : Transition douce de transparent à opaque quand l'image est prête.

## 📊 Performance

### Avant (sans préchargement)

```
Clic sur album → ⏱️ 2-5s de chargement → Image affichée
Navigation → ⏱️ 2-5s de chargement → Image suivante
```

### Après (avec préchargement)

```
Clic sur album → ⚡ Instantané → Image affichée
Navigation → ⚡ Instantané → Image suivante

(Préchargement en arrière-plan pendant que l'utilisateur navigue)
```

### Métriques attendues

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Temps d'affichage 1ère image** | 2-5s | < 100ms | **95%** |
| **Navigation entre photos** | 2-5s | < 50ms | **98%** |
| **Expérience utilisateur** | Saccadée | Fluide | **100%** |

## 🔍 Debugging

### Console Logs

Le système affiche des logs pour suivre le préchargement :

```
🖼️ Préchargement de 45 images en arrière-plan...
✅ Toutes les images sont préchargées !
```

### Vérifier le Cache

```javascript
// Dans la console du navigateur
window.cmsLoader.imagePreloader.preloadedImages
// Affiche toutes les URLs préchargées
```

## ⚙️ Configuration

### Ajuster le nombre d'images en parallèle

Dans `cms-content.js` :

```javascript
this.maxConcurrent = 3;  // Augmenter pour connexions rapides
this.maxConcurrent = 2;  // Réduire pour connexions lentes
```

### Ajuster le délai de préchargement

Dans `startPreloading()` :

```javascript
setTimeout(() => {
    // ...
}, 1000);  // 1 seconde par défaut
```

## 🚀 Améliorations Futures

### 1. Détection de Connexion

```javascript
if (navigator.connection.effectiveType === '4g') {
    maxConcurrent = 5;  // Plus rapide sur 4G
} else {
    maxConcurrent = 2;  // Plus lent sur 3G
}
```

### 2. Images Responsive (WebP)

```javascript
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="...">
</picture>
```

**Gain** : 30-50% de réduction de taille avec WebP

### 3. Service Worker

Mise en cache persistante des images pour visites ultérieures.

## 📚 Ressources

- [MDN - Preloading content](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content)
- [Web.dev - Optimize images](https://web.dev/fast/#optimize-your-images)
- [Web.dev - Lazy loading](https://web.dev/lazy-loading-images/)

## 🐛 Résolution de Problèmes

### Images ne se préchargent pas

1. Vérifier la console pour les erreurs
2. Vérifier les CORS si images externes
3. Vérifier la taille des images (> 10MB peut être trop lent)

### Préchargement trop lent

1. Réduire `maxConcurrent`
2. Augmenter le délai initial
3. Optimiser les images (compression, WebP)

### Consommation de bande passante

Le préchargement consomme de la bande passante en arrière-plan. Pour les utilisateurs avec forfait limité, on pourrait ajouter une option pour le désactiver.

---

**Dernière mise à jour** : 2025-10-18

