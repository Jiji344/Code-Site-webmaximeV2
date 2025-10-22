/* ===== BANDEROLE D'AVIS STATIQUES ===== */
class TestimonialsBanner {
    constructor() {
        this.track = document.getElementById('testimonials-track');
        
        // Configuration
        this.speed = 25;
        this.isPaused = false;
        this.animationId = null;
        this.testimonials = [];
        
        if (this.track) {
            this.init();
        }
    }
    
    init() {
        this.loadStaticReviews();
        this.renderTestimonials();
        this.bindEvents();
        this.startAnimation();
    }
    
    loadStaticReviews() {
        this.testimonials = [
            {
                name: "Marie L.",
                text: "Service exceptionnel ! Maxime a su capturer parfaitement nos émotions. Photos magnifiques et professionnalisme au rendez-vous.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Thomas M.",
                text: "Très satisfait de notre séance photo. Maxime est patient et créatif. Je recommande vivement !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Sophie D.",
                text: "Un photographe talentueux qui sait mettre en valeur ses sujets. Résultat au-delà de nos attentes.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Pierre R.",
                text: "Excellent rapport qualité-prix. Maxime est à l'écoute et très professionnel. Photos superbes !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Julie K.",
                text: "Séance photo parfaite ! Maxime a su créer une ambiance détendue. Résultat magnifique, je recommande !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Alexandre B.",
                text: "Photographe très professionnel, à l'écoute et créatif. Les photos sont magnifiques, je recommande !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Camille S.",
                text: "Séance photo incroyable ! Maxime sait mettre en confiance et capturer les meilleurs moments.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Nicolas F.",
                text: "Très bon photographe, patient et créatif. Résultat au-delà de nos attentes, merci !",
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
    new TestimonialsBanner();
});