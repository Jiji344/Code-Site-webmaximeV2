/* ===== CONFIGURATION ===== */
const CONFIG = {
    SCROLL_THRESHOLD: 50,
    SECTION_OFFSET: 100,
    NOTIFICATION_DURATION: 5000,
    DEBOUNCE_DELAY: 10,
    COPY_FEEDBACK_DURATION: 600,
    EMAIL_REDIRECT_DELAY: 1000,
    PHONE_REGEX: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

/* ===== UTILITAIRES ===== */
const debounce = (func, wait = CONFIG.DEBOUNCE_DELAY) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

/* ===== MENU MOBILE ===== */
class MobileMenu {
    constructor() {
        this.menu = document.getElementById('nav-menu');
        this.toggle = document.getElementById('nav-toggle');
        this.close = document.getElementById('nav-close');
        this.links = document.querySelectorAll('.nav-link');
        
        if (this.menu && this.toggle && this.close) {
            this.init();
        }
    }

    init() {
        this.toggle.addEventListener('click', () => this.open());
        this.close.addEventListener('click', () => this.closeMenu());
        this.links.forEach(link => link.addEventListener('click', (e) => this.handleLinkClick(e)));
        document.addEventListener('keydown', (e) => this.handleEscape(e));
    }

    open() {
        this.menu.classList.add('show-menu');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.trapFocus();
    }

    closeMenu() {
        this.menu.classList.remove('show-menu');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.focus();
    }

    handleLinkClick(e) {
        this.closeMenu();
        setTimeout(() => e.target.blur(), 100);
    }

    handleEscape(e) {
        if (e.key === 'Escape' && this.menu.classList.contains('show-menu')) {
            this.closeMenu();
        }
    }

    trapFocus() {
        const focusableElements = this.menu.querySelectorAll('a[href], button:not([disabled]), textarea, input, select');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.menu.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey && document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        });

        firstFocusable.focus();
    }
}

/* ===== HEADER SCROLL ===== */
class ScrollHeader {
    constructor() {
        this.header = document.getElementById('header');
        if (this.header) {
            this.init();
        }
    }

    init() {
        const handleScroll = debounce(() => this.update());
        window.addEventListener('scroll', handleScroll);
        this.update();
    }

    update() {
        const scrolled = window.scrollY >= CONFIG.SCROLL_THRESHOLD;
        this.header.style.background = scrolled ? 'rgba(10, 22, 40, 0.5)' : 'rgba(10, 22, 40, 0.3)';
        this.header.style.boxShadow = scrolled ? '0 4px 20px rgba(0, 0, 0, 0.3)' : 'none';
    }
}

/* ===== NAVIGATION ACTIVE ===== */
class ActiveNav {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        if (this.sections.length) {
            this.init();
        }
    }

    init() {
        const handleScroll = debounce(() => this.update());
        window.addEventListener('scroll', handleScroll);
    }

    update() {
        const scrollY = window.pageYOffset;

        // Utiliser requestAnimationFrame pour des calculs de dimensions précises
        requestAnimationFrame(() => {
            this.sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - CONFIG.SECTION_OFFSET;
                const sectionId = section.getAttribute('id');
                const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);

                if (link) {
                    const isActive = scrollY > sectionTop && scrollY <= sectionTop + sectionHeight;
                    link.classList.toggle('active-link', isActive);
                }
            });
        });
    }
}

/* ===== MODAL IMAGE ===== */
class ImageModal {
    constructor() {
        this.modal = document.getElementById('image-modal');
        this.image = document.getElementById('modal-image');
        this.closeBtn = document.getElementById('modal-close');

        if (this.modal && this.image && this.closeBtn) {
            this.init();
        }
    }

    init() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => e.target === this.modal && this.close());
        document.addEventListener('keydown', (e) => e.key === 'Escape' && this.modal.classList.contains('active') && this.close());
        
        // Double-clic/double-tap pour zoom x2
        let lastTap = 0;
        
        this.image.addEventListener('dblclick', () => {
            this.toggleZoom();
        });
        
        // Pour mobile (double-tap)
        this.image.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                this.toggleZoom();
            }
            
            lastTap = currentTime;
        });
    }

    toggleZoom() {
        const isZoomed = this.image.dataset.zoomed === 'true';
        
        if (isZoomed) {
            // Dezoom vers x1
            this.image.style.transform = 'scale(1)';
            this.image.style.cursor = 'pointer';
            this.image.dataset.zoomed = 'false';
        } else {
            // Zoom vers x2
            this.image.style.transform = 'scale(2)';
            this.image.style.cursor = 'zoom-out';
            this.image.dataset.zoomed = 'true';
        }
    }

    close() {
        this.modal.classList.remove('active');
        this.image.src = '';
        this.image.style.transform = 'scale(1)';
        this.image.dataset.zoomed = 'false';
        document.body.style.overflow = 'auto';
    }
}

/* ===== SMOOTH SCROLL ===== */
class SmoothScroll {
    constructor() {
        this.header = document.getElementById('header');
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        
        if (target) {
            // Attendre le rendu pour avoir les bonnes dimensions
            requestAnimationFrame(() => {
                const headerHeight = this.header ? this.header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            });
        }
    }
}

/* ===== FORMULAIRE DE CONTACT ===== */
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        if (window.location.search.includes('success')) {
            showNotification('Message envoyé avec succès ! Je vous répondrai bientôt.', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    handleSubmit(e) {
        const formData = new FormData(this.form);
        const email = formData.get('email');
        const phone = formData.get('phone');
        
        if (!CONFIG.EMAIL_REGEX.test(email)) {
            e.preventDefault();
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        if (!CONFIG.PHONE_REGEX.test(phone)) {
            e.preventDefault();
            showNotification('Veuillez entrer un numéro de téléphone valide (ex: 06 12 34 56 78)', 'error');
            return;
        }
        
        const submitButton = this.form.querySelector('.form-button');
        submitButton.innerHTML = '⏳ Envoi en cours...';
        submitButton.disabled = true;
    }
}

/* ===== COPIE DES COORDONNÉES ===== */
class ContactCopy {
    constructor() {
        this.phoneLink = document.getElementById('phone-link');
        this.emailLink = document.getElementById('email-link');
        this.instagramLink = document.getElementById('instagram-link');
        this.isMobile = isMobileDevice();
        
        this.init();
    }

    init() {
        // Debounce du resize pour optimiser les performances
        const debouncedResize = debounce(() => {
            this.isMobile = isMobileDevice();
        }, 150);
        
        window.addEventListener('resize', debouncedResize);
        
        if (this.phoneLink) {
            this.phoneLink.addEventListener('click', (e) => this.handlePhone(e));
        }
        
        if (this.emailLink) {
            this.emailLink.addEventListener('click', (e) => this.handleEmail(e));
        }
        
        if (this.instagramLink) {
            this.instagramLink.addEventListener('click', () => {
                showNotification('💬 Ouverture d\'Instagram...', 'success');
            });
        }
    }

    async handlePhone(e) {
        if (this.isMobile) return;
        
        e.preventDefault();
        const phoneNumber = e.target.getAttribute('data-copy');
        const success = await this.copyToClipboard(phoneNumber);
        
        if (success) {
            e.target.classList.add('copied');
            showNotification('📞 Numéro de téléphone copié !', 'success');
            
            setTimeout(() => e.target.classList.remove('copied'), CONFIG.COPY_FEEDBACK_DURATION);
            setTimeout(() => window.location.href = `tel:${phoneNumber}`, CONFIG.EMAIL_REDIRECT_DELAY);
        } else {
            showNotification('Erreur lors de la copie', 'error');
        }
    }

    async handleEmail(e) {
        if (this.isMobile) return;
        
        e.preventDefault();
        const email = e.target.getAttribute('data-copy');
        const success = await this.copyToClipboard(email);
        
        if (success) {
            e.target.classList.add('copied');
            showNotification('📧 Adresse email copiée !', 'success');
            
            setTimeout(() => e.target.classList.remove('copied'), CONFIG.COPY_FEEDBACK_DURATION);
            setTimeout(() => window.location.href = `mailto:${email}`, CONFIG.EMAIL_REDIRECT_DELAY);
        } else {
            showNotification('Erreur lors de la copie', 'error');
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
}

/* ===== SYSTÈME DE NOTIFICATION ===== */
function showNotification(message, type = 'success') {
    // Supprimer les anciennes notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    // Créer la nouvelle notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), CONFIG.NOTIFICATION_DURATION);
}

/* ===== LAZY LOADING DES IMAGES ===== */
// Utilisation du loading="lazy" natif des navigateurs modernes
// Plus besoin de polyfill - tous les navigateurs récents le supportent

/* ===== GESTION DES ERREURS D'IMAGES ===== */
class ImageErrorHandler {
    init() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230F1F3A" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%234A90E2"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                this.alt = 'Image non disponible';
            });
        });
    }
}

/* ===== PRÉFÉRENCES SYSTÈME ===== */
class SystemPreferences {
    init() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.style.setProperty('--color-text', '#FFFFFF');
            document.documentElement.style.setProperty('--color-text-secondary', '#E0E0E0');
        }
    }
}

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser tous les modules
    new MobileMenu();
    new ScrollHeader();
    new ActiveNav();
    new ImageModal();
    new SmoothScroll();
    new ContactForm();
    new ContactCopy();
    new ImageErrorHandler().init();
    new SystemPreferences().init();
    
    // Annoncer le chargement pour l'accessibilité
    const loadAnnouncement = document.createElement('div');
    loadAnnouncement.setAttribute('role', 'status');
    loadAnnouncement.setAttribute('aria-live', 'polite');
    loadAnnouncement.className = 'sr-only';
    loadAnnouncement.textContent = 'Page chargée avec succès';
    document.body.appendChild(loadAnnouncement);
});

// Enlever le focus du bouton Contact après clic
const contactLink = document.querySelector('.nav-link-contact');
if (contactLink) {
    contactLink.addEventListener('click', (e) => {
        setTimeout(() => e.target.blur(), 100);
    });
}
