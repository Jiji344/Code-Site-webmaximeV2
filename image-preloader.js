// Système de préchargement des images du portfolio
class ImagePreloader {
    constructor() {
        this.imagesLoaded = 0;
        this.totalImages = 0;
        this.imageUrls = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2'
        };
    }

    async preloadPortfolioImages() {
        try {
            // Charger l'index du portfolio avec cache
            const indexUrl = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/main/portfolio-index.json`;
            const response = await fetch(indexUrl, {
                cache: 'force-cache' // Utiliser le cache si disponible
            });
            
            if (!response.ok) {
                console.log('⚠️ Index portfolio non disponible, préchargement ignoré');
                this.dispatchPreloadComplete();
                return;
            }

            const photos = await response.json();
            
            if (!Array.isArray(photos) || photos.length === 0) {
                console.log('⚠️ Aucune photo dans le portfolio');
                this.dispatchPreloadComplete();
                return;
            }

            // Extraire toutes les URLs d'images uniques et les trier par priorité
            const imageUrlsSet = new Set();
            const priorityImages = []; // Premières images de chaque catégorie (visibles immédiatement)
            const otherImages = []; // Autres images
            
            photos.forEach((photo, index) => {
                if (photo.image && typeof photo.image === 'string') {
                    if (!imageUrlsSet.has(photo.image)) {
                        imageUrlsSet.add(photo.image);
                        // Les 3 premières images de chaque catégorie sont prioritaires
                        if (index < 3 || priorityImages.length < 18) {
                            priorityImages.push(photo.image);
                        } else {
                            otherImages.push(photo.image);
                        }
                    }
                }
            });

            this.imageUrls = [...priorityImages, ...otherImages];
            this.totalImages = this.imageUrls.length;

            if (this.totalImages === 0) {
                this.dispatchPreloadComplete();
                return;
            }

            console.log(`📸 Préchargement de ${this.totalImages} images (${priorityImages.length} prioritaires)...`);
            this.updateLoaderText(`Préchargement des images... (0/${this.totalImages})`);

            // Précharger d'abord les images prioritaires (visibles immédiatement) avec plus de parallélisme
            if (priorityImages.length > 0) {
                await this.preloadImagesInBatches(priorityImages, 15, true);
            }

            // Puis précharger les autres images avec moins de parallélisme (en arrière-plan)
            if (otherImages.length > 0) {
                // Utiliser requestIdleCallback si disponible pour ne pas bloquer le rendu
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(() => {
                        this.preloadImagesInBatches(otherImages, 8, false);
                    }, { timeout: 2000 });
                } else {
                    // Fallback pour les navigateurs sans requestIdleCallback
                    setTimeout(() => {
                        this.preloadImagesInBatches(otherImages, 8, false);
                    }, 100);
                }
            }

            console.log(`✅ ${this.totalImages} images préchargées`);
            this.dispatchPreloadComplete();

        } catch (error) {
            console.error('Erreur lors du préchargement:', error);
            this.dispatchPreloadComplete();
        }
    }

    async preloadImagesInBatches(urls, batchSize = 5, isPriority = false) {
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            
            // Pour les images prioritaires, attendre que le batch soit terminé
            // Pour les autres, permettre le chargement en parallèle sans bloquer
            if (isPriority) {
                await Promise.all(
                    batch.map(url => this.preloadSingleImage(url, 'high'))
                );
            } else {
                // Ne pas bloquer pour les images non prioritaires
                Promise.all(
                    batch.map(url => this.preloadSingleImage(url, 'low'))
                ).catch(() => {}); // Ignorer les erreurs silencieusement
            }
            
            // Mettre à jour le texte du loader seulement pour les prioritaires
            if (isPriority) {
                const progress = Math.min(i + batch.length, this.totalImages);
                this.updateLoaderText(`Préchargement des images... (${progress}/${this.totalImages})`);
            }
        }
    }

    preloadSingleImage(url, priority = 'low') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Optimiser l'URL Cloudinary pour le préchargement (format auto, qualité auto)
            let optimizedUrl = url;
            if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(url)) {
                optimizedUrl = window.ImageOptimizer.optimizeUrl(url, {
                    quality: 'auto',
                    format: 'auto'
                });
            }
            
            // Timeout pour éviter de bloquer indéfiniment
            const timeout = setTimeout(() => {
                this.imagesLoaded++;
                resolve();
            }, 10000); // 10 secondes max par image
            
            img.onload = () => {
                clearTimeout(timeout);
                this.imagesLoaded++;
                resolve();
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                // Ne pas bloquer le chargement si une image échoue
                // Ne logger que si c'est une image prioritaire
                if (priority === 'high') {
                    console.warn(`⚠️ Échec du préchargement: ${optimizedUrl}`);
                }
                this.imagesLoaded++;
                resolve();
            };
            
            // Utiliser la priorité fournie
            img.fetchPriority = priority;
            img.decoding = 'async';
            img.loading = 'eager'; // Forcer le chargement immédiat pour le préchargement
            
            // Démarrer le chargement
            img.src = optimizedUrl;
        });
    }

    updateLoaderText(text) {
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = text;
        }
    }

    dispatchPreloadComplete() {
        // Réinitialiser le texte du loader
        this.updateLoaderText('Chargement...');
        
        // Dispatcher l'événement de fin de préchargement
        window.dispatchEvent(new CustomEvent('portfolio-images-preloaded'));
    }
}

// Initialiser le préchargement dès que possible
const imagePreloader = new ImagePreloader();

// Démarrer le préchargement le plus tôt possible
// Utiliser requestIdleCallback si disponible pour ne pas bloquer le rendu initial
if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
        imagePreloader.preloadPortfolioImages();
    }, { timeout: 500 });
} else {
    // Fallback : démarrer immédiatement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            imagePreloader.preloadPortfolioImages();
        });
    } else {
        // Le DOM est déjà chargé
        imagePreloader.preloadPortfolioImages();
    }
}

