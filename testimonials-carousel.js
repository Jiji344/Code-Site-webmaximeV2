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
                text: "Première séance photo avec Maxime 🐊 et quelle belle découverte ! Il a su me mettre à l'aise dès le début, avec beaucoup de douceur et de professionnalisme. Les photos sont magnifiques et il sait vraiment capturer l'essence de chaque moment.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Yayou Yeh",
                text: "C'est un photographe incroyable et super talentueux, on a était très content de travailler avec lui. Les résultats sont toujours sublimes. Il sait capturer les plus beaux moments. C'est un instant capturé et hors du temps.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Noémie Muela",
                text: "Maxime est un photographe très talentueux qui saura immortaliser chaque instant précieux de votre vie. Il a un œil artistique exceptionnel et sait mettre en valeur chaque détail.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Lilou",
                text: "Un moment incroyable passé avec Monsieur crocodeal pour mon shooting photo ! En plus d'être super doué derrière l'objectif, il sait mettre en confiance et rendre l'expérience hyper agréable. Les photos sont juste sublimes ✨ Merci encore !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Florette BRIAND",
                text: "Photographe très professionnel, de la prise de vue jusqu'aux retouches des photos. Maxime est à l'écoute et sait exactement ce que vous voulez. Un travail de qualité exceptionnelle !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Perdigawette",
                text: "Super expérience avec Monsieur Crocodeal ! N'étant pas particulièrement à l'aise, il a vraiment su détendre l'atmosphère et me mettre en confiance. Les photos sont magnifiques et naturelles.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Bianca",
                text: "Un photographe qui sait mettre à l'aise ses modèles et surtout les sublimer! Vous pouvez y aller les yeux fermés, je recommande sans hésiter! Merci Maxime!",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Marine RATIER",
                text: "Un photographe extraordinaire, un travail incroyable et de qualité, un professionnalisme exemplaire, une personne formidable ! Je recommande à 100000000%",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Alicia Lepetit",
                text: "Un photographe très pro ! Qui nous a bien mis à l'aise ! Il fait du taff incroyable je le remercie pour ce moment sympathique ! On a bien ri quand même un peu !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Elsa Constant",
                text: "Super photographe ! Maxime nous a fait de superbes photos pour notre mariage ! Avec 500 photos les souvenirs sont géniaux ! La qualité du travail est top, nous sommes ravis !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Amélie Martin",
                text: "Maxime a été le photographe de notre mariage le 1er juillet dernier, il a été parfait du début à la fin! Discret mais toujours à l'affût du moindre moment à immortaliser. Un professionnel exceptionnel !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Marie Lévêque",
                text: "Premier shooting réalisé avec beaucoup d'appréhension. Mais Maxime as su nous mettre à l'aise et nous faire passer un merveilleux moment! Très professionnel et à l'écoute. Je recommande vivement !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "guillaume cormier",
                text: "Notre choix s'est posé sur Maxime pour un grand événement, notre mariage... et quel bonheur de l'avoir choisi plutôt qu'un autre, non seulement nous avons eu des photos magnifiques mais aussi un moment de partage exceptionnel !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Florence DURUT",
                text: "Pour mon EVJF, mes témoins m'ont fait la surprise d'immortaliser ce week-end avec elles. C'était une superbe expérience ce shooting par Maxime, on a passé un moment magique !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Pascal Cardonna",
                text: "Maxime rayonne dans toute la région avec de sublimes photos. C'est un excellent photographe professionnel. Il est sérieux, ponctuel, assidu et abordable. Je le recommande vivement !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Pierrick Benadassi",
                text: "J'ai eu la chance de travailler avec Maxime sur un projet de vidéo de présentation pour mon concours de Mister Beau en Forme PACA 2023. Il est très souriant, professionnel et créatif !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Lucile Garoute",
                text: "Le shooting avec Maxime a magnifiquement clôturé l'EVJF de notre mariée. Nous avons passé une très bonne après-midi entre témoins et mariée et les photos sont magnifiques !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Elodie Fougerol",
                text: "Maxime est un photographe à l'écoute qui sais capturer l'essentiel et la personnalité des gens au beau milieu d'une fête comme dans un shooting. Merci à lui !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "juliette",
                text: "Shooting réalisé en juillet après avoir vu le résultat des photos du mariage de ma sœur par Monsieur Crocodeal. Shooting au top, très bonne ambiance, photos magnifiques !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "χєlι иα",
                text: "Super photographe, très professionnel et amical à la fois ! Super doué pour mettre à l'aise, très respectueux et à l'écoute, des idées photos géniales et le rendu est top, j'adore !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Morgane Brun",
                text: "Un travail diverse et varié, des thèmes différents selon les goûts, les envies, et un rendu exceptionnel grâce à sa patiente. Très professionnel ! Merci Maxime d'éclairer nos yeux avec tes clichés à couper le souffle.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Julie Halouin",
                text: "Très professionnel, à l'écoute de nos attentes, il sait exactement donné le résultat que l'on souhaite en photo ! Je recommande à 100% ! En plus il est très sympathique !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "PELISSIER Laura",
                text: "Un super photographe ! Il arrives a capter les moments et les émotions de manière incroyable ! Je vous recommande grandement ce photographe :)",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Magali Palumbo",
                text: "Talentueux et passionné, ce jeune photographe est déjà très professionnel et prometteur ! Ses photos sont justes magnifiques et remarquables ! Je vous le recommande 😊",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Nikita",
                text: "Photographe qualifié et impliqué qui a su se montrer à l'écoute de mon projet photo. Très professionnel et créatif, je recommande vivement !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Douglas Le Bihan",
                text: "Superbe photographe, professionnel, passionné de photos et de vidéos, je vous le recommande les yeux fermés !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Dorian Vignes",
                text: "Photographe officiel de la fête à St Hilaire. Une personne à l'écoute, au grand coeur qui saura immortalisé tout vos moments avec professionnalisme et passion. Merci encore",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Nicolas Bolle",
                text: "Et c'est 5 étoiles pour Maxime ! Même en plein nouvel an il a sorti des clichés magnifiques !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Camille Vareilhes",
                text: "Photographe compétent qui saura immortaliser vos plus beaux moments. Personne très sympathique qui connaît son travail",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Alex Wzk",
                text: "Au top, photos de qualité. Cette personne est passionnée et le fait ressentir. A consommer sans modération!",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Gino Boci",
                text: "Photos incroyablement belle un très bon talent en espérant te voir à Hollywood 👏🎥📸⏳",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Jean Pierre",
                text: "Un photographe bien talentueux bravo pour ces photos d'exception !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Mathieu Leveque",
                text: "Tres bon photographe en pleine progression. Qui propose déjà un travail de qualités",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Malika Bonheur",
                text: "Très belle expérience pour notre journée de mariage et même plus encore 🤗 Moment inoubliable 😍",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Léa Tulipe",
                text: "Un homme passionnée par ce qu'il fait, très professionnel et adorable.",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Loïc Seibert",
                text: "Excellent photographe, très professionnel et créatif. Je recommande vivement ses services !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
            },
            {
                name: "Aurore Cayrel",
                text: "Photographe exceptionnel, très professionnel et à l'écoute. Les photos sont magnifiques !",
                rating: 5,
                date: "2024",
                link: "https://search.google.com/local/reviews?placeid=ChIJxXIAKJFBtBIRVFb5YlWmoEw&q=Monsieur+Crocodeal+Photographie&hl=fr&gl=FR&sa=X&ved=2ahUKEwi5_LydpbiQAxVoK_sDHR0hEdwQ3PALegQIIBAO"
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
            <div class="testimonial-content" onclick="window.open('${testimonial.link}', '_blank')">
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