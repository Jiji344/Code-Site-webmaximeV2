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

/* ===== RÉCUPÉRER LES IMAGES DU PORTFOLIO VIA GITHUB (NETLIFY CMS) ===== */
const token = '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';  // Ton token GitHub personnel
const sectionsPortfolio = ['portrait', 'mariage', 'paysage', 'macro', 'immobilier', 'lifestyle'];

sectionsPortfolio.forEach(section => {
    fetch(`https://api.github.com/repos/Jiji344/Code-Site-webmaximeV2/contents/content/portfolio/${section}`, {
        headers: {
            'Authorization': `token ${token}`  // Authentifier la requête avec le token
        }
    })
    .then(response => response.json())
    .then(data => {
        // Vérifier si 'data' est bien un tableau avant d'appliquer 'forEach'
        if (Array.isArray(data)) {
            data.forEach(file => {
                fetch(file.download_url, {
                    headers: {
                        'Authorization': `token ${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}`  // Authentifier la requête avec le token pour récupérer le fichier Markdown
                    }
                })
                .then(response => response.text())
                .then(markdown => {
                    const metadata = parseMarkdown(markdown);  // Extraire les métadonnées
                    const image = metadata.image;  // Le chemin de l'image
                    const title = metadata.title;  // Le titre de l'image
                    const description = metadata.description;  // La description de l'image

                    const portfolioGrid = document.getElementById('portfolio-grid');
                    const imageElement = document.createElement('div');
                    imageElement.classList.add('portfolio-item');
                    imageElement.innerHTML = `
                        <div class="image-card">
                            <img src="${image}" alt="${title}">
                            <div class="image-overlay">
                                <button class="image-expand" aria-label="Agrandir l'image">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <polyline points="9 21 3 21 3 15"></polyline>
                                        <line x1="21" y1="3" x2="14" y2="10"></line>
                                        <line x1="3" y1="21" x2="10" y2="14"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <h3>${title}</h3>
                        <p>${description}</p>
                    `;
                    portfolioGrid.appendChild(imageElement);
                })
                .catch(error => console.error('Erreur lors de la récupération du fichier Markdown :', error));
            });
        } else {
            console.error('Erreur: La réponse de l\'API ne contient pas un tableau.');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des fichiers Markdown :', error);
    });
});

// Fonction pour extraire les métadonnées du fichier Markdown
function parseMarkdown(markdown) {
    const metadata = {};
    metadata.title = markdown.match(/title: "(.*)"/)[1];
    metadata.description = markdown.match(/description: "(.*)"/)[1];
    metadata.image = markdown.match(/image: "(.*)"/)[1];
    return metadata;
}
