// Utilitaire pour optimiser les URLs d'images Cloudinary
class ImageOptimizer {
    /**
     * Optimise une URL d'image Cloudinary avec des transformations
     * @param {string} imageUrl - URL de l'image originale
     * @param {Object} options - Options d'optimisation
     * @returns {string} URL optimisée
     */
    static optimizeUrl(imageUrl, options = {}) {
        if (!imageUrl || typeof imageUrl !== 'string') {
            return imageUrl;
        }

        // Si ce n'est pas une URL Cloudinary, retourner l'URL telle quelle
        if (!imageUrl.includes('res.cloudinary.com')) {
            return imageUrl;
        }

        const {
            width = null,
            height = null,
            quality = 'auto',
            format = 'auto', // 'auto' utilise WebP si supporté, sinon le format original
            crop = 'limit', // 'limit' maintient les proportions
            fetchFormat = 'auto' // Force WebP si supporté
        } = options;

        // Extraire les parties de l'URL Cloudinary
        // Format: https://res.cloudinary.com/{cloud_name}/{type}/upload/{transformations}/{public_id}.{format}
        const urlParts = imageUrl.split('/upload/');
        
        if (urlParts.length !== 2) {
            // URL déjà transformée ou format non standard
            return imageUrl;
        }

        const baseUrl = urlParts[0] + '/upload/';
        const restOfUrl = urlParts[1];

        // Construire les transformations
        const transformations = [];

        // Format et qualité
        if (format === 'auto' || fetchFormat === 'auto') {
            transformations.push('f_auto'); // Format automatique (WebP si supporté)
        } else if (format) {
            transformations.push(`f_${format}`);
        }

        if (quality === 'auto') {
            transformations.push('q_auto'); // Qualité automatique optimisée
        } else if (quality) {
            transformations.push(`q_${quality}`);
        }

        // Dimensions
        if (width && height) {
            transformations.push(`w_${width},h_${height},c_${crop}`);
        } else if (width) {
            transformations.push(`w_${width},c_${crop}`);
        } else if (height) {
            transformations.push(`h_${height},c_${crop}`);
        }

        // Ajouter d'autres optimisations
        transformations.push('fl_progressive'); // Progressive JPEG
        transformations.push('fl_immutable_cache'); // Cache immutable pour meilleures performances

        // Reconstruire l'URL
        if (transformations.length > 0) {
            return baseUrl + transformations.join(',') + '/' + restOfUrl;
        }

        return imageUrl;
    }

    /**
     * Optimise une URL pour les miniatures (petites images)
     */
    static optimizeThumbnail(imageUrl, size = 100) {
        return this.optimizeUrl(imageUrl, {
            width: size,
            height: size,
            quality: 80,
            format: 'auto',
            crop: 'fill'
        });
    }

    /**
     * Optimise une URL pour les cartes d'images (moyennes)
     */
    static optimizeCard(imageUrl, width = 400) {
        return this.optimizeUrl(imageUrl, {
            width: width,
            quality: 'auto',
            format: 'auto',
            crop: 'limit'
        });
    }

    /**
     * Optimise une URL pour l'affichage plein écran (grandes images)
     */
    static optimizeFullscreen(imageUrl, maxWidth = 1920) {
        return this.optimizeUrl(imageUrl, {
            width: maxWidth,
            quality: 'auto',
            format: 'auto',
            crop: 'limit'
        });
    }

    /**
     * Vérifie si une URL est Cloudinary
     */
    static isCloudinaryUrl(url) {
        return url && typeof url === 'string' && url.includes('res.cloudinary.com');
    }
}

// Exporter pour utilisation globale
if (typeof window !== 'undefined') {
    window.ImageOptimizer = ImageOptimizer;
}

