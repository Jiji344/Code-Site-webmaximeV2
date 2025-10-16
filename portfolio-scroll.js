// Script pour le défilement automatique des sections portfolio
class PortfolioAutoScroll {
    constructor() {
        this.scrollZones = new Map();
        this.scrollSpeed = 2;
        this.scrollThreshold = 50; // Distance en pixels pour déclencher le scroll
        this.isScrolling = false;
        this.init();
    }

    init() {
        // Attendre que le DOM soit chargé
        document.addEventListener('DOMContentLoaded', () => {
            this.setupScrollZones();
            this.bindEvents();
        });
    }

    setupScrollZones() {
        // Trouver toutes les sections portfolio
        const portfolioSections = document.querySelectorAll('.portfolio-category');
        
        portfolioSections.forEach(section => {
            const categoryImages = section.querySelector('.category-images');
            if (!categoryImages) return;

            // S'assurer que la section a une position relative
            section.style.position = 'relative';
            section.style.overflow = 'hidden';

            // Créer les indicateurs de scroll
            this.createScrollIndicators(section, categoryImages);
            
            // Enregistrer la zone de scroll
            this.scrollZones.set(section, {
                container: categoryImages,
                leftIndicator: section.querySelector('.scroll-indicator.left'),
                rightIndicator: section.querySelector('.scroll-indicator.right'),
                isScrolling: false
            });
        });
    }

    createScrollIndicators(section, container) {
        // Indicateur gauche
        const leftIndicator = document.createElement('div');
        leftIndicator.className = 'scroll-indicator left';
        leftIndicator.innerHTML = '←';
        leftIndicator.style.display = 'none';
        section.appendChild(leftIndicator);

        // Indicateur droit
        const rightIndicator = document.createElement('div');
        rightIndicator.className = 'scroll-indicator right';
        rightIndicator.innerHTML = '→';
        rightIndicator.style.display = 'none';
        section.appendChild(rightIndicator);

        // Événements pour les indicateurs
        leftIndicator.addEventListener('click', () => {
            this.scrollToDirection(container, 'left');
        });

        rightIndicator.addEventListener('click', () => {
            this.scrollToDirection(container, 'right');
        });
    }

    bindEvents() {
        // Événement mousemove global
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // Événement mouseleave pour arrêter le scroll
        document.addEventListener('mouseleave', () => {
            this.stopAllScrolling();
        });
    }

    handleMouseMove(e) {
        this.scrollZones.forEach((zone, section) => {
            const rect = section.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Vérifier si la souris est dans la section
            if (mouseX >= rect.left && mouseX <= rect.right && 
                mouseY >= rect.top && mouseY <= rect.bottom) {
                
                this.handleSectionHover(section, zone, mouseX, rect);
            } else {
                this.stopScrolling(zone);
            }
        });
    }

    handleSectionHover(section, zone, mouseX, rect) {
        const container = zone.container;
        const leftIndicator = zone.leftIndicator;
        const rightIndicator = zone.rightIndicator;
        
        // Calculer les zones de déclenchement (plus petites pour être plus réactives)
        const leftZone = rect.left + 30;
        const rightZone = rect.right - 30;
        
        // Vérifier si on peut scroller
        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);

        console.log(`Mouse: ${mouseX}, LeftZone: ${leftZone}, RightZone: ${rightZone}`);
        console.log(`Can scroll left: ${canScrollLeft}, Can scroll right: ${canScrollRight}`);

        // Zone gauche
        if (mouseX <= leftZone && canScrollLeft) {
            this.startScrolling(zone, 'left');
            this.showIndicator(leftIndicator);
            this.hideIndicator(rightIndicator);
        }
        // Zone droite
        else if (mouseX >= rightZone && canScrollRight) {
            this.startScrolling(zone, 'right');
            this.showIndicator(rightIndicator);
            this.hideIndicator(leftIndicator);
        }
        // Zone centrale
        else {
            this.stopScrolling(zone);
            this.hideAllIndicators(zone);
        }
    }

    startScrolling(zone, direction) {
        if (zone.isScrolling) return;
        
        zone.isScrolling = true;
        zone.scrollDirection = direction;
        
        const scrollInterval = setInterval(() => {
            if (!zone.isScrolling) {
                clearInterval(scrollInterval);
                return;
            }
            
            const container = zone.container;
            const scrollAmount = direction === 'left' ? -this.scrollSpeed : this.scrollSpeed;
            
            container.scrollLeft += scrollAmount;
            
            // Arrêter si on atteint les limites
            if ((direction === 'left' && container.scrollLeft <= 0) ||
                (direction === 'right' && container.scrollLeft >= (container.scrollWidth - container.clientWidth))) {
                this.stopScrolling(zone);
            }
        }, 16); // ~60fps
        
        zone.scrollInterval = scrollInterval;
    }

    stopScrolling(zone) {
        if (zone.scrollInterval) {
            clearInterval(zone.scrollInterval);
            zone.scrollInterval = null;
        }
        zone.isScrolling = false;
        zone.scrollDirection = null;
    }

    stopAllScrolling() {
        this.scrollZones.forEach(zone => {
            this.stopScrolling(zone);
            this.hideAllIndicators(zone);
        });
    }

    scrollToDirection(container, direction) {
        const scrollAmount = 300; // Distance de scroll
        const targetScroll = direction === 'left' 
            ? Math.max(0, container.scrollLeft - scrollAmount)
            : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + scrollAmount);
        
        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }

    showIndicator(indicator) {
        if (indicator) {
            indicator.style.display = 'flex';
            indicator.classList.add('visible');
        }
    }

    hideIndicator(indicator) {
        if (indicator) {
            indicator.classList.remove('visible');
            setTimeout(() => {
                if (!indicator.classList.contains('visible')) {
                    indicator.style.display = 'none';
                }
            }, 300);
        }
    }

    hideAllIndicators(zone) {
        this.hideIndicator(zone.leftIndicator);
        this.hideIndicator(zone.rightIndicator);
    }
}

// Initialiser le système de défilement automatique
const portfolioAutoScroll = new PortfolioAutoScroll();

// Exposer globalement pour le CMS
window.portfolioAutoScroll = portfolioAutoScroll;
