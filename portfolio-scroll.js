// Script simplifié pour le défilement automatique des sections portfolio
class PortfolioAutoScroll {
    constructor() {
        this.scrollSpeed = 8;
        this.scrollThreshold = 30;
        this.activeScroll = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindEvents();
        });
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseleave', () => {
            this.handleMouseLeave();
        });
    }

    handleMouseMove(e) {
        const portfolioSections = document.querySelectorAll('.portfolio-category');
        
        portfolioSections.forEach(section => {
            const container = section.querySelector('.category-images');
            if (!container) return;

            const rect = section.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Vérifier si la souris est dans la section
            if (mouseX >= rect.left && mouseX <= rect.right && 
                mouseY >= rect.top && mouseY <= rect.bottom) {
                
                this.handleSectionHover(container, mouseX, rect);
            } else {
                this.stopScrolling();
            }
        });
    }

    handleMouseLeave() {
        this.stopScrolling();
    }

    handleSectionHover(container, mouseX, rect) {
        const leftZone = rect.left + this.scrollThreshold;
        const rightZone = rect.right - this.scrollThreshold;
        
        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);

        if (mouseX <= leftZone && canScrollLeft) {
            this.startScrolling(container, 'left');
        } else if (mouseX >= rightZone && canScrollRight) {
            this.startScrolling(container, 'right');
        } else {
            this.stopScrolling();
        }
    }

    startScrolling(container, direction) {
        if (this.activeScroll) return;
        
        this.activeScroll = setInterval(() => {
            const scrollAmount = direction === 'left' ? -this.scrollSpeed : this.scrollSpeed;
            container.scrollLeft += scrollAmount;
            
            // Arrêter si on atteint les limites
            if ((direction === 'left' && container.scrollLeft <= 0) ||
                (direction === 'right' && container.scrollLeft >= (container.scrollWidth - container.clientWidth))) {
                this.stopScrolling();
            }
        }, 16);
    }

    stopScrolling() {
        if (this.activeScroll) {
            clearInterval(this.activeScroll);
            this.activeScroll = null;
        }
    }
}

// Initialiser le système simplifié
const portfolioAutoScroll = new PortfolioAutoScroll();
window.portfolioAutoScroll = portfolioAutoScroll;
