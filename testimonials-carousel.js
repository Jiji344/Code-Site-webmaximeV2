/* ===== BANDEROLE D'AVIS INFINIE ===== */
class TestimonialsBanner {
    constructor() {
        this.track = document.getElementById('testimonials-track');
        
        // Configuration
        this.speed = 20; // pixels par seconde (plus lent pour les cartes plus larges)
        this.isPaused = false;
        this.animationId = null;
        
        // Données des avis
        this.testimonials = [
            {
                name: "Marie & Pierre",
                type: "Mariage",
                text: "Photos de mariage exceptionnelles ! Maxime a su capturer l'émotion de notre jour J avec une sensibilité remarquable. Je recommande vivement !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Sophie L.",
                type: "Portrait",
                text: "Séance portrait parfaite ! Maxime m'a mise en confiance et a capturé ma personnalité. Les photos sont magnifiques, je recommande !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Famille Martin",
                type: "Lifestyle",
                text: "Super séance en famille ! Maxime a su saisir l'authenticité de nos moments. Des souvenirs précieux, merci !",
                rating: 5,
                date: "2023"
            },
            {
                name: "Agence ABC",
                type: "Immobilier",
                text: "Professionnalisme exemplaire ! Les photos de nos biens sont d'une qualité exceptionnelle. Nos ventes ont augmenté grâce à ces visuels.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Claire & Thomas",
                type: "Mariage",
                text: "Photographe exceptionnel ! Maxime a su être discret tout en capturant tous les détails importants. Travail remarquable !",
                rating: 5,
                date: "2023"
            },
            {
                name: "Emma R.",
                type: "Portrait",
                text: "Séance corporate réussie ! Maxime a créé une ambiance professionnelle naturelle. Les photos reflètent parfaitement mon image.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Jean & Sarah",
                type: "Mariage",
                text: "Photos de mariage magnifiques ! Maxime a capturé tous les moments importants avec créativité. Nous recommandons !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Lisa M.",
                type: "Portrait",
                text: "Séance photo parfaite ! Maxime est à l'écoute et sait mettre en valeur. Les résultats dépassent nos attentes !",
                rating: 5,
                date: "2023"
            },
            {
                name: "Marc & Julie",
                type: "Mariage",
                text: "Service impeccable ! Maxime a su immortaliser notre mariage avec talent. Photos magnifiques, nous sommes ravis !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Sarah K.",
                type: "Portrait",
                text: "Excellente séance ! Maxime est professionnel et créatif. Les photos sont superbes, je recommande !",
                rating: 5,
                date: "2024"
            }
        ];
        
        if (this.track) {
            this.init();
        }
    }
    
    init() {
        this.renderTestimonials();
        this.bindEvents();
        this.startAnimation();
    }
    
    renderTestimonials() {
        this.track.innerHTML = '';
        
        // Créer deux copies pour l'effet infini
        const testimonialsToRender = [...this.testimonials, ...this.testimonials];
        
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
                    <div class="testimonial-type">${testimonial.type}</div>
                    <div class="testimonial-rating">${stars}</div>
                </div>
                <blockquote class="testimonial-text">
                    "${testimonial.text}"
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
                
                // Reset quand on arrive à la moitié (fin de la première série)
                const trackWidth = this.track.scrollWidth / 2;
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
