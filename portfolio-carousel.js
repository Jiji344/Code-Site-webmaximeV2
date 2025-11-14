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
            nextButton,
            // Variables pour le swipe
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            isSwiping: false,
            startTransform: 0
        };

        this.carousels.set(category, state);

        prevButton.addEventListener('click', () => this.prevSlide(category));
        nextButton.addEventListener('click', () => this.nextSlide(category));

        // Ajouter le support du swipe horizontal sur mobile
        this.initSwipe(category, imagesContainer);

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

    initSwipe(category, container) {
        const state = this.carousels.get(category);
        if (!state) return;

        // Détecter uniquement sur mobile
        const isMobile = () => window.innerWidth <= this.breakpoints.mobile;
        let swipeOccurred = false;

        container.addEventListener('touchstart', (e) => {
            if (!isMobile()) return;

            swipeOccurred = false;
            state.touchStartX = e.touches[0].clientX;
            state.touchStartY = e.touches[0].clientY;
            state.isSwiping = false;
            
            // Récupérer la position actuelle du transform
            const transform = getComputedStyle(container).transform;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/matrix.*\((.+)\)/);
                if (matrix) {
                    state.startTransform = parseFloat(matrix[1].split(',')[4]) || 0;
                } else {
                    state.startTransform = 0;
                }
            } else {
                state.startTransform = 0;
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isMobile()) return;

            state.touchEndX = e.touches[0].clientX;
            state.touchEndY = e.touches[0].clientY;

            const deltaX = state.touchEndX - state.touchStartX;
            const deltaY = Math.abs(state.touchEndY - state.touchStartY);

            // Détecter si c'est un swipe horizontal (plus horizontal que vertical)
            if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
                state.isSwiping = true;
                swipeOccurred = true;
                e.preventDefault(); // Empêcher le scroll de la page

                // Calculer la nouvelle position avec limites strictes
                const items = Array.from(container.children);
                if (items.length === 0) return;

                // S'assurer que totalSlides est à jour
                if (state.totalSlides === 0) {
                    state.totalItems = items.length;
                    state.totalSlides = Math.ceil(state.totalItems / this.itemsPerSlide);
                }

                // Si un seul slide ou moins, pas de swipe possible
                if (state.totalSlides <= 1) {
                    container.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    container.style.transform = 'translateX(0)';
                    return;
                }

                const firstItem = items[0];
                const itemWidth = firstItem.offsetWidth;
                const containerStyle = getComputedStyle(container);
                const gap = parseFloat(containerStyle.gap) || 0;
                
                // Position de base
                const baseTranslateX = state.startTransform;
                
                // Calculer les limites strictes (pas d'effet élastique)
                const maxTranslateX = 0; // Premier slide (position 0)
                // La position minimale correspond au dernier slide
                // Utiliser la même formule que slideToPosition pour garantir la cohérence
                const lastSlideIndex = state.totalSlides - 1;
                const itemsToMove = lastSlideIndex * this.itemsPerSlide;
                const minTranslateX = -(itemsToMove * (itemWidth + gap));
                
                // Appliquer le mouvement avec limites strictes
                let newTranslateX = baseTranslateX + deltaX;
                
                // Limiter strictement aux bornes (pas de dépassement)
                if (newTranslateX > maxTranslateX) {
                    newTranslateX = maxTranslateX;
                } else if (newTranslateX < minTranslateX) {
                    newTranslateX = minTranslateX;
                }

                // Désactiver la transition pendant le swipe pour un mouvement fluide
                container.style.transition = 'none';
                container.style.transform = `translateX(${newTranslateX}px)`;
            }
        }, { passive: false });

        container.addEventListener('touchend', (e) => {
            if (!isMobile()) return;

            const deltaX = state.touchEndX - state.touchStartX;
            const threshold = 50; // Seuil minimum pour déclencher le swipe (en pixels)

            if (state.isSwiping) {
                // Réactiver la transition
                container.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

                // Vérifier si le swipe est suffisant ET si on peut changer de slide
                if (Math.abs(deltaX) > threshold) {
                    if (deltaX > 0) {
                        // Swipe vers la droite -> slide précédent
                        // Vérifier qu'on n'est pas déjà au premier slide
                        if (state.currentSlide > 0) {
                            this.prevSlide(category);
                        } else {
                            // Revenir à la position actuelle si on est déjà au début
                            this.slideToPosition(category);
                        }
                    } else {
                        // Swipe vers la gauche -> slide suivant
                        // Vérifier qu'on n'est pas déjà au dernier slide
                        if (state.currentSlide < state.totalSlides - 1) {
                            this.nextSlide(category);
                        } else {
                            // Revenir à la position actuelle si on est déjà à la fin
                            this.slideToPosition(category);
                        }
                    }
                } else {
                    // Swipe insuffisant, toujours revenir à la position actuelle (garantit qu'un album est visible)
                    this.slideToPosition(category);
                }
            }

            // Réinitialiser les valeurs
            state.isSwiping = false;
            state.touchStartX = 0;
            state.touchStartY = 0;
            state.touchEndX = 0;
            state.touchEndY = 0;

            // Réinitialiser swipeOccurred après un court délai pour permettre le clic si ce n'était pas un swipe
            setTimeout(() => {
                swipeOccurred = false;
            }, 100);
        }, { passive: true });

        // Empêcher le clic sur les albums seulement si un swipe a réellement eu lieu
        container.addEventListener('click', (e) => {
            if (swipeOccurred) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }
}

// Initialiser le système de carrousel
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioCarousel = new PortfolioCarousel();
});
