/* ===== BANDEROLE D'AVIS INFINIE ===== */
class TestimonialsBanner {
    constructor() {
        this.track = document.getElementById('testimonials-track');
        
        // Configuration
        this.speed = 20; // pixels par seconde (plus lent pour les cartes plus larges)
        this.isPaused = false;
        this.animationId = null;
        
        // Données des avis Google réels
        this.testimonials = [
            {
                name: "Noémie Muela",
                type: "Portrait",
                text: "Maxime est un photographe très talentueux qui saura immortaliser chaque instant précieux de votre vie.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Yayou Yeh",
                type: "Portrait",
                text: "C'est un photographe incroyable et super talentueux, on a était très content de travailler avec lui. Les résultats sont toujours sublimes.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Lilou",
                type: "Portrait",
                text: "Un moment incroyable passé avec Monsieur crocodeal pour mon shooting photo ! En plus d'être super doué derrière l'objectif, il sait mettre en confiance.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Gaël Le Thiec",
                type: "Formation",
                text: "Maxime m'a clairement appris les bases de la photographie de manière très pédagogique. Nous avons passé une demie journée à analyser les différents réglages.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Florette BRIAND",
                type: "Portrait",
                text: "Photographe très professionnel, de la prise de vue jusqu'aux retouches des photos.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Perdigawette",
                type: "Portrait",
                text: "Super expérience avec Monsieur Crocodeal ! N'étant pas particulièrement à l'aise, il a vraiment su détendre l'atmosphère.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Bianca",
                type: "Portrait",
                text: "Un photographe qui sait mettre à l'aise ses modèles et surtout les sublimer! Vous pouvez y aller les yeux fermés, je recommande sans hésiter!",
                rating: 5,
                date: "2024"
            },
            {
                name: "Alicia Lepetit",
                type: "Portrait",
                text: "Un photographe très pro ! Qui nous a bien mis à l'aise ! Il fait du taff incroyable je le remercie pour ce moment sympathique !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Elsa Constant",
                type: "Mariage",
                text: "Super photographe ! Maxime nous a fait de superbes photos pour notre mariage ! Avec 500 photos les souvenirs sont géniaux !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Marine RATIER",
                type: "Portrait",
                text: "Un photographe extraordinaire, un travail incroyable et de qualité, un professionnalisme exemplaire, une personne formidable !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Amélie Martin",
                type: "Mariage",
                text: "Maxime a été le photographe de notre mariage, il a été parfait du début à la fin! discret mais toujours à l'affût du moindre moment.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Marie Lévêque",
                type: "Portrait",
                text: "Premier shooting réalisé avec beaucoup d'appréhension. Mais Maxime as su nous mettre à l'aise et nous faire passer un merveilleux moment!",
                rating: 5,
                date: "2024"
            },
            {
                name: "guillaume cormier",
                type: "Mariage",
                text: "Notre choix s'est posé sur Maxime pour un grand événement, notre mariage et quel bonheur de l'avoir choisi plutôt qu'un autre.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Florence DURUT",
                type: "EVJF",
                text: "Pour mon EVJF, mes témoins m'ont fait la surprise d'immortaliser ce week-end avec elles. C'était une superbe expérience ce shooting par Maxime.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Pascal Cardonna",
                type: "Portrait",
                text: "Maxime rayonne dans toute la région avec de sublimes photos. C'est un excellent photographe professionnel. Il est sérieux, ponctuel, assidu et abordable.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Pierrick Benadassi",
                type: "Vidéo",
                text: "J'ai eu la chance de travailler avec Maxime sur un projet de vidéo de présentation pour mon concours de Mister Beau en Forme PACA 2023.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Lucile Garoute",
                type: "EVJF",
                text: "Le shooting avec Maxime a magnifiquement clôturé l'EVJF de notre mariée. Nous avons passé une très bonne après-midi entre témoins et mariée.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Elodie Fougerol",
                type: "Événement",
                text: "Maxime est un photographe à l'écoute qui sais capturer l'essentiel et la personnalité des gens au beau milieu d'une fête comme dans un shooting.",
                rating: 5,
                date: "2024"
            },
            {
                name: "juliette",
                type: "Portrait",
                text: "Shooting réalisé en juillet après avoir vu le résultat des photos du mariage de ma sœur par Monsieur Crocodeal. Shooting au top, très bonne ambiance.",
                rating: 5,
                date: "2023"
            },
            {
                name: "χєlι иα",
                type: "Portrait",
                text: "Super photographe, très professionnel et amical à la fois ! Super doué pour mettre à l'aise, très respectueux et à l'écoute.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Morgane Brun",
                type: "Portrait",
                text: "Un travail diverse et varié, des thèmes différents selon les goûts, les envies, et un rendu exceptionnel grâce à sa patiente. Très professionnel !",
                rating: 5,
                date: "2020"
            },
            {
                name: "Julie Halouin",
                type: "Portrait",
                text: "Très professionnel, à l'écoute de nos attentes, il sait exactement donné le résultat que l'on souhaite en photo ! Je recommande à 100% !",
                rating: 5,
                date: "2024"
            },
            {
                name: "PELISSIER Laura",
                type: "Portrait",
                text: "Un super photographe ! Il arrives a capter les moments et les émotions de manière incroyable ! Je vous recommande grandement ce photographe.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Magali Palumbo",
                type: "Portrait",
                text: "Talentueux et passionné, ce jeune photographe est déjà très professionnel et prometteur ! Ses photos sont justes magnifiques et remarquables !",
                rating: 5,
                date: "2020"
            },
            {
                name: "Nikita",
                type: "Portrait",
                text: "Photographe qualifié et impliqué qui a su se montrer à l'écoute de mon projet photo.",
                rating: 5,
                date: "2024"
            },
            {
                name: "Douglas Le Bihan",
                type: "Portrait",
                text: "Superbe photographe, professionnel, passionné de photos et de vidéos, je vous le recommande les yeux fermés !",
                rating: 5,
                date: "2023"
            },
            {
                name: "Dorian Vignes",
                type: "Événement",
                text: "Photographe officiel de la fête à St Hilaire. Une personne à l'écoute, au grand coeur qui saura immortalisé tout vos moments avec professionnalisme et passion.",
                rating: 5,
                date: "2023"
            },
            {
                name: "Nicolas Bolle",
                type: "Événement",
                text: "Et c'est 5 étoiles pour Maxime ! Même en plein nouvel an il a sorti des clichés magnifiques !",
                rating: 5,
                date: "2024"
            },
            {
                name: "Camille Vareilhes",
                type: "Portrait",
                text: "Photographe compétent qui saura immortaliser vos plus beaux moments. Personne très sympathique qui connaît son travail.",
                rating: 5,
                date: "2022"
            },
            {
                name: "Alex Wzk",
                type: "Portrait",
                text: "Au top, photos de qualité. Cette personne est passionnée et le fait ressentir. A consommer sans modération!",
                rating: 5,
                date: "2020"
            },
            {
                name: "Gino Boci",
                type: "Portrait",
                text: "Photos incroyablement belle un très bon talent en espérant te voir à Hollywood.",
                rating: 5,
                date: "2022"
            },
            {
                name: "Jean Pierre",
                type: "Portrait",
                text: "Un photographe bien talentueux bravo pour ces photos d'exception !",
                rating: 5,
                date: "2023"
            },
            {
                name: "Mathieu Leveque",
                type: "Portrait",
                text: "Tres bon photographe en pleine progression. Qui propose déjà un travail de qualités.",
                rating: 5,
                date: "2020"
            },
            {
                name: "Malika Bonheur",
                type: "Mariage",
                text: "Très belle expérience pour notre journée de mariage et même plus encore. Moment inoubliable.",
                rating: 5,
                date: "2020"
            },
            {
                name: "Léa Tulipe",
                type: "Portrait",
                text: "Un homme passionnée par ce qu'il fait, très professionnel et adorable.",
                rating: 5,
                date: "2020"
            },
            {
                name: "M",
                type: "Portrait",
                text: "Première séance photo avec Maxime et quelle belle découverte ! Il a su me mettre à l'aise dès le début, avec beaucoup de douceur et de professionnalisme.",
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
