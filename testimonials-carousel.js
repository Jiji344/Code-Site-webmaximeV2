/* ===== BANDEROLE D'AVIS GOOGLE ===== */
class GoogleReviewsBanner {
    constructor() {
        this.track = document.getElementById('testimonials-track');
        
        // Configuration Google Places - Monsieur Crocodeal
        this.apiKey = window.GOOGLE_API_KEY || 'VOTRE_CLE_API'; // Variable d'environnement Netlify
        this.placeId = '0x12b44191280072c5:0x4ca0a65562f95654'; // Place ID de Monsieur Crocodeal
        
        // Configuration
        this.speed = 25;
        this.isPaused = false;
        this.animationId = null;
        this.testimonials = [];
        
        // Cache
        this.cacheKey = 'google_reviews_cache';
        this.cacheDuration = 6 * 60 * 60 * 1000; // 6 heures
        
        if (this.track) {
            this.init();
        }
    }
    
    async init() {
        await this.loadConfig();
        await this.loadGoogleReviews();
        this.renderTestimonials();
        this.bindEvents();
        this.startAnimation();
    }
    
    async loadConfig() {
        try {
            const response = await fetch('/.netlify/functions/get-config');
            const config = await response.json();
            if (config.googleApiKey) {
                this.apiKey = config.googleApiKey;
                console.log('✅ Clé API chargée depuis Netlify');
            } else {
                console.warn('⚠️ Clé API non trouvée, utilisation du fallback');
            }
        } catch (error) {
            console.warn('⚠️ Impossible de charger la config, utilisation du fallback:', error);
        }
    }
    
    async loadGoogleReviews() {
        try {
            // Vérifier le cache d'abord
            const cached = this.getCachedReviews();
            if (cached && this.isCacheValid(cached)) {
                console.log('✅ Utilisation du cache - 0 requête API');
                this.testimonials = cached.reviews;
                return;
            }
            
            console.log('🔄 Cache expiré - 1 requête API');
            const reviews = await this.fetchGoogleReviews();
            this.testimonials = reviews.map(review => ({
                name: review.author_name,
                text: review.text,
                rating: review.rating,
                date: new Date(review.time * 1000).getFullYear().toString()
            }));
            
            // Sauvegarder en cache
            this.saveToCache(this.testimonials);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des avis Google:', error);
            this.loadFallbackReviews();
        }
    }
    
    async fetchGoogleReviews() {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=reviews&key=${this.apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK') {
            return data.result.reviews || [];
        } else {
            throw new Error('Erreur API Google: ' + data.status);
        }
    }
    
    // Fonction supprimée - plus de catégories d'avis
    
    getCachedReviews() {
        try {
            return JSON.parse(localStorage.getItem(this.cacheKey));
        } catch {
            return null;
        }
    }
    
    isCacheValid(cached) {
        const now = Date.now();
        return (now - cached.timestamp) < this.cacheDuration;
    }
    
    saveToCache(reviews) {
        const cacheData = {
            reviews: reviews,
            timestamp: Date.now()
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    }
    
    loadFallbackReviews() {
        // Avis de secours si l'API ne fonctionne pas
        this.testimonials = [
            {
                name: "Client Google",
                text: "Service exceptionnel ! Photos de qualité, je recommande vivement.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Client Google",
                text: "Très satisfait du travail de Maxime. Photos magnifiques !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Client Google",
                text: "Photographe professionnel et créatif. Résultats excellents !",
                rating: 5,
                date: "2024"
            }
        ];
    }
    
    renderTestimonials() {
        this.track.innerHTML = '';
        
        // Créer 3 copies pour un défilement vraiment infini
        const testimonialsToRender = [...this.testimonials, ...this.testimonials, ...this.testimonials];
        
        testimonialsToRender.forEach((testimonial, index) => {
            const testimonialElement = this.createTestimonialElement(testimonial, index);
            this.track.appendChild(testimonialElement);
        });
    }
    
    createTestimonialElement(testimonial, index) {
        const testimonialDiv = document.createElement('div');
        testimonialDiv.className = 'testimonial-card';
        
        const stars = '★'.repeat(testimonial.rating);
        
        testimonialDiv.innerHTML = `
            <div class="testimonial-content">
                <div class="testimonial-header">
                    <div class="testimonial-rating">${stars}</div>
                </div>
                <blockquote class="testimonial-text">
                    ${testimonial.text}
                </blockquote>
                <div class="testimonial-footer">
                    <div class="testimonial-author">
                        <span class="author-name">${testimonial.name}</span>
                        <span class="author-date">${testimonial.date}</span>
                    </div>
                </div>
            </div>
        `;
        
        return testimonialDiv;
    }
    
    bindEvents() {
        // Pause au survol
        this.track.addEventListener('mouseenter', () => this.pauseAnimation());
        this.track.addEventListener('mouseleave', () => this.resumeAnimation());
        
        // Pause au focus pour l'accessibilité
        this.track.addEventListener('focusin', () => this.pauseAnimation());
        this.track.addEventListener('focusout', () => this.resumeAnimation());
    }
    
    startAnimation() {
        if (this.animationId) return;
        
        const animate = () => {
            if (!this.isPaused) {
                const currentTransform = this.track.style.transform || 'translateX(0px)';
                const currentX = parseFloat(currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/)?.[1] || 0);
                const newX = currentX - this.speed / 60; // 60fps
                
                // Reset quand on arrive au tiers (fin de la première série)
                const trackWidth = this.track.scrollWidth / 3;
                if (Math.abs(newX) >= trackWidth) {
                    this.track.style.transform = 'translateX(0px)';
                } else {
                    this.track.style.transform = `translateX(${newX}px)`;
                }
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    pauseAnimation() {
        this.isPaused = true;
    }
    
    resumeAnimation() {
        this.isPaused = false;
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    new GoogleReviewsBanner();
});
