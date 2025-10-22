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
                name: "M",
                text: "Première séance photo avec Maxime 🐊 et quelle belle découverte ! Il a su me mettre à l'aise dès le début, avec beaucoup de douceur et de professionnalisme.",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Yayou Yeh",
                text: "C'est un photographe incroyable et super talentueux, on a était très content de travailler avec lui. Les résultats sont toujours sublimes. Il sait capturer les plus beaux moments.",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Noémie Muela",
                text: "Maxime est un photographe très talentueux qui saura immortaliser chaque instant précieux de votre vie.",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Lilou",
                text: "Un moment incroyable passé avec Monsieur crocodeal pour mon shooting photo ! En plus d'être super doué derrière l'objectif, il sait mettre en confiance et rendre l'expérience hyper agréable. Les photos sont juste sublimes ✨",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Florette BRIAND",
                text: "Photographe très professionnel, de la prise de vue jusqu'aux retouches des photos.",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Perdigawette",
                text: "Super expérience avec Monsieur Crocodeal ! N'étant pas particulièrement à l'aise, il a vraiment su détendre l'atmosphère",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Bianca",
                text: "Un photographe qui sait mettre à l'aise ses modèles et surtout les sublimer! Vous pouvez y aller les yeux fermés, je recommande sans hésiter! Merci Maxime!",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Marine RATIER",
                text: "Un photographe extraordinaire, un travail incroyable et de qualité, un professionnalisme exemplaire, une personne formidable ! Je recommande à 100000000%",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Alicia Lepetit",
                text: "Un photographe très pro ! Qui nous a bien mis à l'aise ! Il fait du taff incroyable je le remercie pour ce moment sympathique ! On a bien ri quand même un peu !",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Elsa Constant",
                text: "Super photographe ! Maxime nous a fait de superbes photos pour notre mariage ! Avec 500 photos les souvenirs sont géniaux ! La qualité du travail est top",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Amélie Martin",
                text: "Maxime a été le photographe de notre mariage le 1er juillet dernier, il a été parfait du début à la fin! discret mais toujours à l'affût du moindre moment à",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
            },
            {
                name: "Marie Lévêque",
                text: "Premier shooting réalisé avec beaucoup d'appréhension. Mais Maxime as su nous mettre à l'aise et nous faire passer un merveilleux moment! Très professionnel",
                rating: 5,
                date: "2024",
                link: "https://www.google.com/maps/place/Monsieur+Crocodeal+Photographie"
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
        
        // Vérifier si le texte est tronqué (contient "...")
        const hasMoreText = testimonial.text.includes('...') || testimonial.text.includes('…');
        const readMoreLink = hasMoreText ? `<a href="${testimonial.link}" target="_blank" class="read-more">Lire plus</a>` : '';
        
        testimonialDiv.innerHTML = `
            <div class="testimonial-content">
                <div class="testimonial-header">
                    <div class="testimonial-rating">${stars}</div>
                </div>
                <blockquote class="testimonial-text">
                    ${testimonial.text}
                    ${readMoreLink}
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