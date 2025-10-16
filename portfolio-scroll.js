// Script pour le défilement automatique des sections portfolio
class PortfolioAutoScroll {
    constructor() {
        this.scrollZones = new Map();
        this.scrollSpeed = 4; // Vitesse augmentée
        this.scrollThreshold = 30; // Distance en pixels pour déclencher le scroll
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
        // Plus d'indicateurs visuels - défilement invisible
        // Le défilement se fait automatiquement au survol
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
        
        // Calculer les zones de déclenchement avec effet de proximité
        const leftZone = rect.left + 40;
        const rightZone = rect.right - 40;
        
        // Vérifier si on peut scroller
        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);

        // Zone gauche avec effet de proximité
        if (mouseX <= leftZone && canScrollLeft) {
            // Calculer la vitesse basée sur la proximité du bord
            const proximity = (leftZone - mouseX) / 40; // 0 à 1
            const dynamicSpeed = Math.max(2, this.scrollSpeed * (0.5 + proximity * 0.5));
            this.startScrolling(zone, 'left', dynamicSpeed);
        }
        // Zone droite avec effet de proximité
        else if (mouseX >= rightZone && canScrollRight) {
            // Calculer la vitesse basée sur la proximité du bord
            const proximity = (mouseX - rightZone) / 40; // 0 à 1
            const dynamicSpeed = Math.max(2, this.scrollSpeed * (0.5 + proximity * 0.5));
            this.startScrolling(zone, 'right', dynamicSpeed);
        }
        // Zone centrale
        else {
            this.stopScrolling(zone);
        }
    }

    startScrolling(zone, direction, speed = this.scrollSpeed) {
        if (zone.isScrolling) return;
        
        zone.isScrolling = true;
        zone.scrollDirection = direction;
        zone.currentSpeed = speed;
        
        const scrollInterval = setInterval(() => {
            if (!zone.isScrolling) {
                clearInterval(scrollInterval);
                return;
            }
            
            const container = zone.container;
            const scrollAmount = direction === 'left' ? -zone.currentSpeed : zone.currentSpeed;
            
            // Animation fluide avec easing
            container.scrollLeft += scrollAmount;
            
            // Arrêter si on atteint les limites
            if ((direction === 'left' && container.scrollLeft <= 0) ||
                (direction === 'right' && container.scrollLeft >= (container.scrollWidth - container.clientWidth))) {
                this.stopScrolling(zone);
            }
        }, 16); // ~60fps pour fluidité maximale
        
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
        });
    }
}

// Initialiser le système de défilement automatique
const portfolioAutoScroll = new PortfolioAutoScroll();

// Exposer globalement pour le CMS
window.portfolioAutoScroll = portfolioAutoScroll;
