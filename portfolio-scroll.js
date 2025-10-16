// Script pour le défilement automatique des sections portfolio
class PortfolioAutoScroll {
    constructor() {
        this.scrollZones = new Map();
        this.scrollSpeed = 15; // Vitesse ultra-rapide comme un scroll normal
        this.scrollThreshold = 20; // Distance en pixels pour déclencher le scroll
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
        const leftZone = rect.left + 20;
        const rightZone = rect.right - 20;
        
        // Vérifier si on peut scroller
        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);

        // Zone gauche avec effet de proximité
        if (mouseX <= leftZone && canScrollLeft) {
            // Vitesse constante et rapide comme un scroll normal
            this.startScrolling(zone, 'left', this.scrollSpeed);
        }
        // Zone droite avec effet de proximité
        else if (mouseX >= rightZone && canScrollRight) {
            // Vitesse constante et rapide comme un scroll normal
            this.startScrolling(zone, 'right', this.scrollSpeed);
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
            
            // Animation ultra-fluide comme un scroll normal
            container.scrollLeft += scrollAmount;
            
            // Arrêter si on atteint les limites
            if ((direction === 'left' && container.scrollLeft <= 0) ||
                (direction === 'right' && container.scrollLeft >= (container.scrollWidth - container.clientWidth))) {
                this.stopScrolling(zone);
            }
        }, 4); // 250fps pour fluidité maximale comme un scroll normal
        
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

    // Fonction d'easing cubic pour un mouvement naturel
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Fonction d'easing pour l'accélération
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Initialiser le système de défilement automatique
const portfolioAutoScroll = new PortfolioAutoScroll();

// Exposer globalement pour le CMS
window.portfolioAutoScroll = portfolioAutoScroll;
