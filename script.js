/* ===== MENU MOBILE ===== */
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav-link');

// Ouvrir le menu mobile
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
        navToggle.setAttribute('aria-expanded', 'true');
        // Piéger le focus dans le menu
        trapFocus(navMenu);
    });
}

// Fermer le menu mobile
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus(); // Retourner le focus au bouton
    });
}

// Fermer le menu quand on clique sur un lien
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        navMenu.classList.remove('show-menu');
        navToggle.setAttribute('aria-expanded', 'false');
        // Enlever le focus après le clic pour éviter que l'effet hover reste
        setTimeout(() => {
            e.target.blur();
        }, 100);
    });
});

// Enlever le focus du bouton Contact après clic
const contactLink = document.querySelector('.nav-link-contact');
if (contactLink) {
    contactLink.addEventListener('click', (e) => {
        setTimeout(() => {
            e.target.blur();
        }, 100);
    });
}

// Fermer le menu avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
    }
});

/* ===== PIÈGE À FOCUS POUR ACCESSIBILITÉ ===== */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });

    firstFocusable.focus();
}

/* ===== EFFET SCROLL HEADER ===== */
const header = document.getElementById('header');

function scrollHeader() {
    if (window.scrollY >= 50) {
        header.style.background = 'rgba(10, 22, 40, 0.5)';
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.background = 'rgba(10, 22, 40, 0.3)';
        header.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', scrollHeader);

/* ===== LIEN ACTIF DANS LA NAVIGATION ===== */
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const link = document.querySelector(`.nav-link[href*="${sectionId}"]`);

        if (link) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        }
    });
}

window.addEventListener('scroll', scrollActive);

/* ===== MODAL IMAGE ===== */
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.getElementById('modal-close');
const imageExpandButtons = document.querySelectorAll('.image-expand');

// Ouvrir la modal
imageExpandButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = button.closest('.image-card').querySelector('img');
        
        modalImage.src = img.src;
        modalImage.alt = img.alt;
        imageModal.classList.add('active');
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Focus sur le bouton de fermeture
        modalClose.focus();
    });
});

// Fermer la modal
function closeModal() {
    imageModal.classList.remove('active');
    modalImage.src = '';
    document.body.style.overflow = 'auto';
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// Fermer en cliquant en dehors de l'image
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        closeModal();
    }
});

// Fermer avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageModal.classList.contains('active')) {
        closeModal();
    }
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ===== ANIMATION AU SCROLL - DÉSACTIVÉ ===== */
// Animations désactivées selon les préférences utilisateur

/* ===== GESTION DU FORMULAIRE DE CONTACT (Netlify Forms) ===== */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Validation basique avant soumission
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const message = formData.get('message');
        
        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            e.preventDefault();
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        // Validation du numéro de téléphone (format français)
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        if (!phoneRegex.test(phone)) {
            e.preventDefault();
            showNotification('Veuillez entrer un numéro de téléphone valide (ex: 06 12 34 56 78)', 'error');
            return;
        }
        
        // Afficher le bouton en état de chargement
        const submitButton = contactForm.querySelector('.form-button');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '⏳ Envoi en cours...';
        submitButton.disabled = true;
        
        // Netlify Forms gérera la soumission
        // Le formulaire sera redirigé automatiquement
    });
}

// Afficher un message de succès si on revient de la page de confirmation
if (window.location.search.includes('success')) {
    showNotification('Message envoyé avec succès ! Je vous répondrai bientôt.', 'success');
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

/* ===== SYSTÈME DE NOTIFICATION ===== */
function showNotification(message, type = 'success') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    // Styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '6rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: '#FFFFFF',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        backgroundColor: type === 'success' ? '#4CAF50' : '#F44336'
    });
    
    document.body.appendChild(notification);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Ajouter les styles de notification au CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @media screen and (max-width: 768px) {
        .notification {
            right: 1rem !important;
            left: 1rem !important;
            max-width: calc(100% - 2rem) !important;
        }
    }
`;
document.head.appendChild(notificationStyles);

/* ===== LAZY LOADING DES IMAGES ===== */
if ('loading' in HTMLImageElement.prototype) {
    // Le navigateur supporte le lazy loading natif
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback pour les navigateurs qui ne supportent pas lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src;
                img.removeAttribute('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

/* ===== AMÉLIORATION DE LA PERFORMANCE ===== */
// Debounce pour les événements de scroll
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Appliquer debounce aux fonctions de scroll
const debouncedScrollHeader = debounce(scrollHeader, 10);
const debouncedScrollActive = debounce(scrollActive, 10);

window.removeEventListener('scroll', scrollHeader);
window.removeEventListener('scroll', scrollActive);
window.addEventListener('scroll', debouncedScrollHeader);
window.addEventListener('scroll', debouncedScrollActive);

/* ===== PRÉCHARGEMENT DES IMAGES AU HOVER ===== */
const imageCards = document.querySelectorAll('.image-card');
imageCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const img = this.querySelector('img');
        if (img && img.dataset.fullsrc) {
            const fullImg = new Image();
            fullImg.src = img.dataset.fullsrc;
        }
    });
});

/* ===== GESTION DU THÈME SYSTÈME ===== */
// Détecter la préférence de contraste élevé
if (window.matchMedia('(prefers-contrast: high)').matches) {
    document.documentElement.style.setProperty('--color-text', '#FFFFFF');
    document.documentElement.style.setProperty('--color-text-secondary', '#E0E0E0');
}

// Animations désactivées globalement

/* ===== INITIALISATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    // Appeler les fonctions au chargement
    scrollHeader();
    scrollActive();
    
    // Annoncer que la page est chargée (pour les lecteurs d'écran)
    const loadAnnouncement = document.createElement('div');
    loadAnnouncement.setAttribute('role', 'status');
    loadAnnouncement.setAttribute('aria-live', 'polite');
    loadAnnouncement.className = 'sr-only';
    loadAnnouncement.textContent = 'Page chargée avec succès';
    document.body.appendChild(loadAnnouncement);
    
    // Ajouter la classe pour les éléments visibles uniquement aux lecteurs d'écran
    const srOnlyStyles = document.createElement('style');
    srOnlyStyles.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
    `;
    document.head.appendChild(srOnlyStyles);
});

/* ===== GESTION DES ERREURS D'IMAGES ===== */
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        // Si une image ne charge pas, afficher une image de remplacement
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230F1F3A" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Poppins, sans-serif" font-size="20" fill="%234A90E2"%3EImage non disponible%3C/text%3E%3C/svg%3E';
        this.alt = 'Image non disponible';
    });
});

console.log('Portfolio Monsieur Crocodeal - Chargé avec succès ✨');

