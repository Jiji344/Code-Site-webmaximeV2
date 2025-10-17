// Système de carrousel pour les sections du portfolio
class PortfolioCarousel {
    constructor() {
        this.carousels = new Map();
        this.init();
    }

    get itemsPerSlide() {
        // Déterminer le nombre d'éléments par slide selon la largeur d'écran
        const width = window.innerWidth;
        if (width <= 768) return 1;  // Mobile: 1 élément
        if (width <= 968) return 2;  // Tablette: 2 éléments
        return 3;  // Desktop: 3 éléments
    }

    init() {
        // Initialiser tous les carrousels
        document.querySelectorAll('.category-carousel').forEach(carousel => {
            const category = carousel.closest('[data-category]').getAttribute('data-category');
            this.initCarousel(category, carousel);
        });

        // Réinitialiser les carrousels lors du resize
        window.addEventListener('resize', () => {
            this.carousels.forEach((state, category) => {
                this.resetCarousel(category);
            });
        });
    }

    initCarousel(category, carouselElement) {
        const imagesContainer = carouselElement.querySelector('.category-images');
        const prevButton = carouselElement.querySelector('.category-nav-prev');
        const nextButton = carouselElement.querySelector('.category-nav-next');

        if (!imagesContainer || !prevButton || !nextButton) {
            console.log(`Carrousel ${category} : Éléments manquants`);
            return;
        }

        // État du carrousel
        const state = {
            currentSlide: 0,
            totalItems: 0,
            totalSlides: 0,
            imagesContainer,
            prevButton,
            nextButton
        };

        this.carousels.set(category, state);

        // Événements des boutons
        prevButton.addEventListener('click', () => this.prevSlide(category));
        nextButton.addEventListener('click', () => this.nextSlide(category));

        // Observer pour détecter les changements dans le conteneur
        const observer = new MutationObserver(() => {
            this.updateCarousel(category);
        });

        observer.observe(imagesContainer, {
            childList: true,
            subtree: true
        });
    }

    updateCarousel(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        // Compter le nombre d'éléments (albums + images)
        const items = state.imagesContainer.children;
        state.totalItems = items.length;
        state.totalSlides = Math.ceil(state.totalItems / this.itemsPerSlide);

        console.log(`📊 ${category}: ${state.totalItems} éléments, ${state.totalSlides} slides`);

        // Mettre à jour les boutons
        this.updateButtons(category);
    }

    updateButtons(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        // Désactiver le bouton précédent si on est au début
        state.prevButton.disabled = state.currentSlide === 0;

        // Désactiver le bouton suivant si on est à la fin
        state.nextButton.disabled = state.currentSlide >= state.totalSlides - 1;
    }

    prevSlide(category) {
        const state = this.carousels.get(category);
        if (!state || state.currentSlide === 0) return;

        state.currentSlide--;
        this.slideToPosition(category);
    }

    nextSlide(category) {
        const state = this.carousels.get(category);
        if (!state || state.currentSlide >= state.totalSlides - 1) return;

        state.currentSlide++;
        this.slideToPosition(category);
    }

    slideToPosition(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        // Calculer le décalage
        const items = state.imagesContainer.children;
        if (items.length === 0) return;

        // Obtenir la largeur d'un élément + gap
        const firstItem = items[0];
        const itemWidth = firstItem.offsetWidth;
        const gap = parseInt(getComputedStyle(state.imagesContainer).gap) || 0;
        
        // Calculer le décalage pour 3 éléments
        const slideWidth = (itemWidth + gap) * this.itemsPerSlide;
        const translateX = -slideWidth * state.currentSlide;

        // Appliquer la transformation
        state.imagesContainer.style.transform = `translateX(${translateX}px)`;

        // Mettre à jour les boutons
        this.updateButtons(category);

        console.log(`➡️ ${category}: Slide ${state.currentSlide + 1}/${state.totalSlides} (translateX: ${translateX}px)`);
    }

    // Méthode publique pour réinitialiser un carrousel
    resetCarousel(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        state.currentSlide = 0;
        state.imagesContainer.style.transform = 'translateX(0)';
        this.updateCarousel(category);
    }
}

// Initialiser le système de carrousel
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioCarousel = new PortfolioCarousel();
});
