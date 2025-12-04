// Utilitaire pour optimiser les URLs d'images Cloudflare CDN
// Supporte aussi les anciennes URLs Cloudinary pour la migration progressive

class ImageOptimizer {
    /**
     * Optimise une URL d'image Cloudflare avec des transformations
     * @param {string} imageUrl - URL de l'image originale
     * @param {Object} options - Options d'optimisation
     * @returns {string} URL optimisée
     */
    static optimizeUrl(imageUrl, options = {}) {
        if (!imageUrl || typeof imageUrl !== 'string') {
            return imageUrl;
        }

        // Support des anciennes URLs Cloudinary (pour migration progressive)
        if (imageUrl.includes('res.cloudinary.com')) {
            return this.optimizeCloudinaryUrl(imageUrl, options);
        }

        // URLs Cloudflare CDN
        if (this.isCloudflareUrl(imageUrl)) {
            return this.optimizeCloudflareUrl(imageUrl, options);
        }

        // URL standard - retourner telle quelle
        return imageUrl;
    }

    /**
     * Optimise une URL Cloudflare
     */
    static optimizeCloudflareUrl(imageUrl, options = {}) {
        const {
            width = null,
            height = null,
            quality = 85,
            format = 'webp' // WebP par défaut pour meilleure compression
        } = options;

        // Cloudflare peut servir les images avec des transformations via Workers
        // Pour l'instant, on retourne l'URL telle quelle car Cloudflare CDN
        // optimise déjà automatiquement les images
        // Vous pouvez ajouter des transformations via Cloudflare Images ou Workers plus tard
        
        // Si des dimensions sont spécifiées, on peut les ajouter comme paramètres
        // (nécessite configuration Cloudflare Images ou Workers)
        const params = new URLSearchParams();
        
        if (width) params.append('w', width);
        if (height) params.append('h', height);
        if (quality) params.append('q', quality);
        if (format && format !== 'auto') params.append('f', format);

        // Pour l'instant, retourner l'URL sans modifications
        // Cloudflare CDN optimise déjà automatiquement
        // TODO: Ajouter support Cloudflare Images si nécessaire
        return imageUrl;
    }

    /**
     * Optimise une URL Cloudinary (support legacy)
     */
    static optimizeCloudinaryUrl(imageUrl, options = {}) {
        const {
            width = null,
            height = null,
            quality = 'auto',
            format = 'auto',
            crop = 'limit'
        } = options;

        const urlParts = imageUrl.split('/upload/');
        
        if (urlParts.length !== 2) {
            return imageUrl;
        }

        const baseUrl = urlParts[0] + '/upload/';
        const restOfUrl = urlParts[1];

        const transformations = [];

        if (format === 'auto' || format === 'webp') {
            transformations.push('f_auto');
        } else if (format) {
            transformations.push(`f_${format}`);
        }

        if (quality === 'auto') {
            transformations.push('q_auto');
        } else if (quality) {
            transformations.push(`q_${quality}`);
        }

        if (width && height) {
            transformations.push(`w_${width},h_${height},c_${crop}`);
        } else if (width) {
            transformations.push(`w_${width},c_${crop}`);
        } else if (height) {
            transformations.push(`h_${height},c_${crop}`);
        }

        transformations.push('fl_progressive');
        transformations.push('fl_immutable_cache');

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
            format: 'webp',
            crop: 'fill'
        });
    }

    /**
     * Optimise une URL pour les cartes d'images (moyennes)
     */
    static optimizeCard(imageUrl, width = 400) {
        return this.optimizeUrl(imageUrl, {
            width: width,
            quality: 85,
            format: 'webp',
            crop: 'limit'
        });
    }

    /**
     * Optimise une URL pour l'affichage plein écran (grandes images)
     */
    static optimizeFullscreen(imageUrl, maxWidth = 1920) {
        return this.optimizeUrl(imageUrl, {
            width: maxWidth,
            quality: 90,
            format: 'webp',
            crop: 'limit'
        });
    }

    /**
     * Vérifie si une URL est Cloudflare
     */
    static isCloudflareUrl(url) {
        if (!url || typeof url !== 'string') return false;
        // Vérifier si c'est une URL Cloudflare CDN
        // Peut être un domaine personnalisé ou un sous-domaine Cloudflare
        return url.includes('cloudflare') || 
               url.includes('cdn') || 
               // Ajoutez votre domaine Cloudflare ici
               url.startsWith('https://cdn.');
    }

    /**
     * Vérifie si une URL est Cloudinary (support legacy)
     */
    static isCloudinaryUrl(url) {
        return url && typeof url === 'string' && url.includes('res.cloudinary.com');
    }

    /**
     * Vérifie si une URL est une URL d'image valide (Cloudflare ou Cloudinary)
     */
    static isValidImageUrl(url) {
        return this.isCloudflareUrl(url) || this.isCloudinaryUrl(url) || 
               (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')));
    }
}

// Exporter pour utilisation globale
if (typeof window !== 'undefined') {
    window.ImageOptimizer = ImageOptimizer;
}
