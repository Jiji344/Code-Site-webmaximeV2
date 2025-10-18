// Système de carrousel pour les sections du portfolio
class PortfolioCarousel {
    constructor() {
        this.carousels = new Map();
        this.breakpoints = {
            mobile: 768,
            tablet: 968
        };
        this.init();
    }

    get itemsPerSlide() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return 1;
        if (width <= this.breakpoints.tablet) return 2;
        return 3;
    }

    init() {
        document.querySelectorAll('.category-carousel').forEach(carousel => {
            const category = carousel.closest('[data-category]')?.getAttribute('data-category');
            if (category) {
                this.initCarousel(category, carousel);
            }
        });

        // Debounce du resize pour éviter trop de recalculs
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.carousels.forEach((state, category) => {
                    this.resetCarousel(category);
                });
            }, 150);
        });
    }

    initCarousel(category, carouselElement) {
        const imagesContainer = carouselElement.querySelector('.category-images');
        const prevButton = carouselElement.querySelector('.category-nav-prev');
        const nextButton = carouselElement.querySelector('.category-nav-next');

        if (!imagesContainer || !prevButton || !nextButton) return;

        const state = {
            currentSlide: 0,
            totalItems: 0,
            totalSlides: 0,
            imagesContainer,
            prevButton,
            nextButton
        };

        this.carousels.set(category, state);

        prevButton.addEventListener('click', () => this.prevSlide(category));
        nextButton.addEventListener('click', () => this.nextSlide(category));

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

        // Attendre que le DOM soit mis à jour
        setTimeout(() => {
            const items = state.imagesContainer.children;
            state.totalItems = items.length;
            state.totalSlides = Math.ceil(state.totalItems / this.itemsPerSlide);

            // S'assurer que currentSlide n'est pas hors limites
            if (state.currentSlide >= state.totalSlides && state.totalSlides > 0) {
                state.currentSlide = Math.max(0, state.totalSlides - 1);
            }

            // Repositionner si nécessaire
            if (state.totalItems > 0) {
                this.slideToPosition(category);
            } else {
                this.updateButtons(category);
            }
        }, 100);
    }

    updateButtons(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        state.prevButton.disabled = state.currentSlide === 0;
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

        const items = Array.from(state.imagesContainer.children);
        if (items.length === 0) return;

        // Attendre que les éléments soient bien rendus
        requestAnimationFrame(() => {
            const firstItem = items[0];
            if (!firstItem) return;
            
            const itemWidth = firstItem.offsetWidth;
            const containerStyle = getComputedStyle(state.imagesContainer);
            const gap = parseFloat(containerStyle.gap) || 0;
            
            // Calculer la position exacte en fonction du nombre d'items par slide
            const itemsToMove = state.currentSlide * this.itemsPerSlide;
            const translateX = -(itemsToMove * (itemWidth + gap));

            state.imagesContainer.style.transform = `translateX(${translateX}px)`;
            this.updateButtons(category);
        });
    }

    resetCarousel(category) {
        const state = this.carousels.get(category);
        if (!state) return;

        state.currentSlide = 0;
        
        // Recalculer et repositionner
        const items = state.imagesContainer.children;
        state.totalItems = items.length;
        state.totalSlides = Math.ceil(state.totalItems / this.itemsPerSlide);
        
        // Réinitialiser la position
        state.imagesContainer.style.transform = 'translateX(0)';
        this.updateButtons(category);
    }
}

// Initialiser le système de carrousel
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioCarousel = new PortfolioCarousel();
});
