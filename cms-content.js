// Script pour charger et afficher le contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.init();
    }

    async init() {
        await this.loadPortfolioData();
        this.displayPortfolioImages();
    }

    async loadPortfolioData() {
        try {
            // Charger les données du portfolio depuis les fichiers Markdown
            const owner = 'Jiji344';
            const repo = 'Code-Site-webmaximeV2';
            const path = 'content/portfolio';
            
            const portfolioFiles = await this.getPortfolioFiles();
            
            for (const file of portfolioFiles) {
                // Charger depuis GitHub Raw
                const githubRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}/${file}`;
                
                try {
                    const response = await fetch(githubRawUrl);
                    if (response.ok) {
                        const content = await response.text();
                        const data = this.parseMarkdownFrontmatter(content);
                        if (data) {
                            this.portfolioData.push(data);
                        }
                    }
                } catch (err) {
                    console.log(`Erreur lors du chargement de ${file}:`, err);
                }
            }
            
            console.log('Données portfolio chargées:', this.portfolioData);
        } catch (error) {
            console.log('Erreur lors du chargement des données CMS:', error);
        }
    }

    async getPortfolioFiles() {
        try {
            // Utiliser l'API GitHub pour lister tous les fichiers du portfolio
            const owner = 'Jiji344'; // Ton nom d'utilisateur GitHub
            const repo = 'Code-Site-webmaximeV2'; // Ton repository
            const path = 'content/portfolio';
            
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
            );
            
            if (response.ok) {
                const files = await response.json();
                // Filtrer seulement les fichiers .md
                return files
                    .filter(file => file.name.endsWith('.md'))
                    .map(file => file.name);
            } else {
                console.log('Impossible de charger la liste des fichiers via GitHub API');
                return [];
            }
        } catch (error) {
            console.log('Erreur lors du chargement de la liste des fichiers:', error);
            return [];
        }
    }

    parseMarkdownFrontmatter(content) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (match) {
            const frontmatter = match[1];
            const data = {};
            
            // Parser le frontmatter YAML simple
            frontmatter.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim();
                    data[key] = value;
                }
            });
            
            return data;
        }
        
        return null;
    }

    displayPortfolioImages() {
        console.log('Affichage des images du portfolio...', this.portfolioData);
        
        // Grouper les images par catégorie puis par album
        const dataByCategory = {};
        this.portfolioData.forEach(item => {
            console.log('Item traité:', item);
            if (item.category && item.image) {
                if (!dataByCategory[item.category]) {
                    dataByCategory[item.category] = {
                        albums: {},
                        singleImages: []
                    };
                }
                
                // Si l'image a un album, la grouper par album
                if (item.album && item.album.trim() !== '') {
                    console.log(`✅ Album détecté: "${item.album}" pour la catégorie ${item.category}`);
                    if (!dataByCategory[item.category].albums[item.album]) {
                        dataByCategory[item.category].albums[item.album] = [];
                    }
                    dataByCategory[item.category].albums[item.album].push(item);
                } else {
                    // Sinon, l'ajouter aux images individuelles
                    console.log(`📷 Image individuelle pour la catégorie ${item.category}`);
                    dataByCategory[item.category].singleImages.push(item);
                }
            }
        });

        console.log('📊 Données groupées par catégorie:', dataByCategory);

        // Afficher les données dans chaque section
        Object.keys(dataByCategory).forEach(category => {
            this.updateCategoryContent(category, dataByCategory[category]);
        });
    }

    updateCategoryContent(category, data) {
        // Trouver la section correspondante
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) {
            console.log(`❌ Section ${category} non trouvée`);
            return;
        }

        // Trouver le conteneur d'images
        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) {
            console.log(`❌ Conteneur d'images pour ${category} non trouvé`);
            return;
        }

        console.log(`📁 Mise à jour de la catégorie: ${category}`);
        console.log(`   Albums: ${Object.keys(data.albums).length}`);
        console.log(`   Images individuelles: ${data.singleImages.length}`);

        // Ajouter d'abord les cartes d'albums
        Object.keys(data.albums).forEach(albumName => {
            const albumImages = data.albums[albumName];
            console.log(`   ➕ Création de l'album: "${albumName}" (${albumImages.length} photos)`);
            const albumCard = this.createAlbumCard(albumName, albumImages);
            imagesContainer.appendChild(albumCard);
        });

        // Puis ajouter les images individuelles
        data.singleImages.forEach((item) => {
            console.log(`   ➕ Ajout image individuelle: ${item.title || item.image}`);
            const imageCard = this.createImageCard(item);
            imagesContainer.appendChild(imageCard);
        });

        // Mettre à jour le carrousel de cette catégorie
        if (window.portfolioCarousel) {
            window.portfolioCarousel.updateCarousel(category);
        }
    }

    createAlbumCard(albumName, images) {
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        
        // Image de couverture (première image de l'album)
        const coverImage = document.createElement('img');
        coverImage.className = 'album-card-image';
        coverImage.src = images[0].image;
        coverImage.alt = albumName;
        coverImage.loading = 'lazy';
        
        // Contenu de la carte
        const cardContent = document.createElement('div');
        cardContent.className = 'album-card-content';
        
        const albumTitle = document.createElement('h4');
        albumTitle.className = 'album-card-title';
        albumTitle.textContent = albumName;
        
        const albumCount = document.createElement('p');
        albumCount.className = 'album-card-count';
        albumCount.textContent = `${images.length} photo${images.length > 1 ? 's' : ''}`;
        
        cardContent.appendChild(albumTitle);
        cardContent.appendChild(albumCount);
        
        albumCard.appendChild(coverImage);
        albumCard.appendChild(cardContent);
        
        // Événement pour ouvrir le carousel
        albumCard.addEventListener('click', () => {
            this.openAlbumCarousel(albumName, images);
        });
        
        return albumCard;
    }

    createImageCard(item) {
        // Créer la structure complète comme les images statiques
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        
        // Créer l'image
        const imgElement = document.createElement('img');
        imgElement.src = item.image;
        imgElement.alt = item.title || item.description || '';
        imgElement.loading = 'lazy';
        imgElement.width = 400;
        imgElement.height = 600;
        
        // Créer l'overlay avec le bouton d'agrandissement
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        
        const expandButton = document.createElement('button');
        expandButton.className = 'image-expand';
        expandButton.setAttribute('aria-label', 'Agrandir l\'image');
        expandButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
        `;
        
        // Événement pour ouvrir la modal (utilise la modal existante du site)
        expandButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const modalClose = document.getElementById('modal-close');
            
            if (modal && modalImg) {
                modalImg.src = item.image;
                modalImg.alt = item.title || item.description || '';
                modal.classList.add('active');
                
                // Empêcher le scroll du body
                document.body.style.overflow = 'hidden';
                
                // Focus sur le bouton de fermeture
                if (modalClose) {
                    modalClose.focus();
                }
            }
        });
        
        overlay.appendChild(expandButton);
        imageCard.appendChild(imgElement);
        imageCard.appendChild(overlay);
        
        return imageCard;
    }

    openAlbumCarousel(albumName, images) {
        const modal = document.getElementById('album-modal');
        const albumTitle = document.getElementById('album-title');
        const albumCurrentTitle = document.getElementById('album-current-title');
        const albumCounter = document.getElementById('album-counter');
        const carouselImage = document.getElementById('carousel-image');
        const thumbnailsContainer = document.getElementById('carousel-thumbnails');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');
        
        if (!modal) return;
        
        // État du carousel
        let currentIndex = 0;
        let isAnimating = false;
        let lastNavigationTime = 0;
        const navigationDelay = 350; // Délai minimum entre deux navigations (en ms)
        
        // Précharger toutes les images de l'album
        const preloadedImages = new Map();
        let loadedCount = 0;
        
        const preloadImages = () => {
            console.log(`🖼️ Préchargement de ${images.length} images...`);
            
            // Créer un indicateur de chargement
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'preload-indicator';
            loadingIndicator.innerHTML = `
                <div class="preload-text">Chargement des images... <span id="preload-count">0/${images.length}</span></div>
            `;
            loadingIndicator.style.cssText = `
                position: fixed;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(74, 144, 226, 0.9);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 2rem;
                font-size: 0.9rem;
                z-index: 10001;
                box-shadow: 0 0 20px rgba(74, 144, 226, 0.6);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(loadingIndicator);
            
            images.forEach((imgData, index) => {
                const img = new Image();
                img.src = imgData.image;
                preloadedImages.set(index, img);
                
                img.onload = () => {
                    loadedCount++;
                    const countElement = document.getElementById('preload-count');
                    if (countElement) {
                        countElement.textContent = `${loadedCount}/${images.length}`;
                    }
                    console.log(`✅ Image ${loadedCount}/${images.length} préchargée`);
                    
                    // Supprimer l'indicateur quand tout est chargé
                    if (loadedCount === images.length) {
                        setTimeout(() => {
                            loadingIndicator.style.opacity = '0';
                            setTimeout(() => {
                                loadingIndicator.remove();
                            }, 300);
                        }, 500);
                        console.log('🎉 Toutes les images sont préchargées !');
                    }
                };
                
                img.onerror = () => {
                    loadedCount++;
                    const countElement = document.getElementById('preload-count');
                    if (countElement) {
                        countElement.textContent = `${loadedCount}/${images.length}`;
                    }
                    console.log(`❌ Erreur de chargement de l'image ${index + 1}`);
                    
                    // Supprimer l'indicateur même en cas d'erreur
                    if (loadedCount === images.length) {
                        setTimeout(() => {
                            loadingIndicator.style.opacity = '0';
                            setTimeout(() => {
                                loadingIndicator.remove();
                            }, 300);
                        }, 500);
                    }
                };
            });
        };
        
        // Lancer le préchargement immédiatement
        preloadImages();
        
        // Fonction pour créer les 3 images du carousel
        const createCarouselImages = () => {
            const imageContainer = document.querySelector('.carousel-image-container');
            imageContainer.innerHTML = '';
            imageContainer.className = 'carousel-image-container carousel-3d';
            
            // Image précédente
            const prevImageDiv = document.createElement('div');
            prevImageDiv.className = 'carousel-slide carousel-prev-slide';
            const prevImg = document.createElement('img');
            prevImg.className = 'carousel-image';
            prevImageDiv.appendChild(prevImg);
            
            // Clic sur l'image précédente pour naviguer
            prevImageDiv.addEventListener('click', () => {
                prevImage();
            });
            
            // Image actuelle
            const currentImageDiv = document.createElement('div');
            currentImageDiv.className = 'carousel-slide carousel-current-slide';
            const currentImg = document.createElement('img');
            currentImg.className = 'carousel-image';
            currentImageDiv.appendChild(currentImg);
            
            // Image suivante
            const nextImageDiv = document.createElement('div');
            nextImageDiv.className = 'carousel-slide carousel-next-slide';
            const nextImg = document.createElement('img');
            nextImg.className = 'carousel-image';
            nextImageDiv.appendChild(nextImg);
            
            // Clic sur l'image suivante pour naviguer
            nextImageDiv.addEventListener('click', () => {
                nextImage();
            });
            
            imageContainer.appendChild(prevImageDiv);
            imageContainer.appendChild(currentImageDiv);
            imageContainer.appendChild(nextImageDiv);
            
            return { prevImg, currentImg, nextImg, prevImageDiv, currentImageDiv, nextImageDiv };
        };
        
        const carouselImages = createCarouselImages();
        
        // Fonction pour afficher une image
        const showImage = (index, direction = 'none') => {
            // Vérifier le throttle pour éviter les clics trop rapides
            const now = Date.now();
            if (direction !== 'none' && (now - lastNavigationTime) < navigationDelay) {
                console.log('⏱️ Navigation trop rapide, ignorée');
                return;
            }
            
            if (isAnimating && direction !== 'none') return;
            
            lastNavigationTime = now;
            currentIndex = index;
            const image = images[index];
            const prevIndex = (index - 1 + images.length) % images.length;
            const nextIndex = (index + 1) % images.length;
            
            // Mettre à jour les titres et compteur
            albumCurrentTitle.textContent = image.title || 'Sans titre';
            albumCounter.textContent = `${index + 1} / ${images.length}`;
            
            if (direction !== 'none') {
                isAnimating = true;
                
                // Appliquer une classe de transition rapide
                const container = document.querySelector('.carousel-image-container');
                container.style.transition = 'opacity 0.2s ease';
                container.style.opacity = '0.5';
                
                setTimeout(() => {
                    // Utiliser les images préchargées (déjà en cache)
                    carouselImages.prevImg.src = images[prevIndex].image;
                    carouselImages.prevImg.alt = images[prevIndex].title || '';
                    
                    carouselImages.currentImg.src = image.image;
                    carouselImages.currentImg.alt = image.title || '';
                    
                    carouselImages.nextImg.src = images[nextIndex].image;
                    carouselImages.nextImg.alt = images[nextIndex].title || '';
                    
                    // Rétablir l'opacité
                    container.style.opacity = '1';
                    
                    setTimeout(() => {
                        isAnimating = false;
                        container.style.transition = '';
                    }, 200);
                }, 80);
            } else {
                // Premier chargement sans animation
                carouselImages.prevImg.src = images[prevIndex].image;
                carouselImages.prevImg.alt = images[prevIndex].title || '';
                
                carouselImages.currentImg.src = image.image;
                carouselImages.currentImg.alt = image.title || '';
                
                carouselImages.nextImg.src = images[nextIndex].image;
                carouselImages.nextImg.alt = images[nextIndex].title || '';
            }
        };
        
        // Fonction pour passer à l'image suivante (avec boucle)
        const nextImage = () => {
            if (isAnimating) return;
            const nextIndex = (currentIndex + 1) % images.length;
            showImage(nextIndex, 'next');
        };
        
        // Fonction pour passer à l'image précédente (avec boucle)
        const prevImage = () => {
            if (isAnimating) return;
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(prevIndex, 'prev');
        };
        
        // Masquer les miniatures (on utilise un carousel 3D maintenant)
        thumbnailsContainer.style.display = 'none';
        
        // Configuration du carousel
        albumTitle.textContent = albumName;
        showImage(0, 'none');
        
        // Navigation
        prevButton.onclick = () => {
            if (!isAnimating) {
                prevImage();
            }
        };
        
        nextButton.onclick = () => {
            if (!isAnimating) {
                nextImage();
            }
        };
        
        // Désactiver visuellement les boutons pendant l'animation
        const updateButtonStates = () => {
            if (isAnimating) {
                prevButton.style.opacity = '0.5';
                nextButton.style.opacity = '0.5';
                prevButton.style.pointerEvents = 'none';
                nextButton.style.pointerEvents = 'none';
            } else {
                prevButton.style.opacity = '1';
                nextButton.style.opacity = '1';
                prevButton.style.pointerEvents = 'auto';
                nextButton.style.pointerEvents = 'auto';
            }
        };
        
        // Observer les changements d'état d'animation
        const originalShowImage = showImage;
        const showImageWrapper = (index, direction = 'none') => {
            originalShowImage(index, direction);
            updateButtonStates();
            
            // Remettre les boutons actifs après l'animation
            if (direction !== 'none') {
                setTimeout(() => {
                    updateButtonStates();
                }, navigationDelay);
            }
        };
        
        // Support du swipe pour mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe vers la gauche - image suivante
                    nextImage();
                } else {
                    // Swipe vers la droite - image précédente
                    prevImage();
                }
            }
        };
        
        const imageContainer = document.querySelector('.carousel-image-container');
        
        imageContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        imageContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        // Navigation au clavier
        const handleKeyboard = (e) => {
            if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'Escape') {
                closeCarousel();
            }
        };
        
        // Fermer le carousel
        const closeCarousel = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyboard);
            
            // Nettoyer l'indicateur de préchargement s'il existe
            const loadingIndicator = document.querySelector('.preload-indicator');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        };
        
        // Bouton de fermeture
        document.getElementById('album-modal-close').onclick = closeCarousel;
        
        // Clic en dehors de la modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeCarousel();
            }
        };
        
        // Ajouter l'écoute du clavier
        document.addEventListener('keydown', handleKeyboard);
        
        // Ouvrir la modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

}

// Initialiser le loader CMS
document.addEventListener('DOMContentLoaded', () => {
    window.cmsLoader = new CMSContentLoader();
});
