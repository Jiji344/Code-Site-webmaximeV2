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

        const items = state.imagesContainer.children;
        state.totalItems = items.length;
        state.totalSlides = Math.ceil(state.totalItems / this.itemsPerSlide);

        this.updateButtons(category);
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

        const items = state.imagesContainer.children;
        if (items.length === 0) return;

        const firstItem = items[0];
        const itemWidth = firstItem.offsetWidth;
        const gap = parseInt(getComputedStyle(state.imagesContainer).gap) || 0;
        
        const slideWidth = (itemWidth + gap) * this.itemsPerSlide;
        const translateX = -slideWidth * state.currentSlide;

        state.imagesContainer.style.transform = `translateX(${translateX}px)`;
        this.updateButtons(category);
    }

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
