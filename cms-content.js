// Chargement et affichage du contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2',
            basePath: 'content/portfolio',
            // Liste des catégories à scanner
            categories: ['Portrait', 'Mariage', 'Immobilier', 'Paysage', 'Macro', 'Lifestyle']
        };
        this.init();
    }

    async init() {
        await this.loadPortfolioData();
        this.displayPortfolioImages();
    }

    async loadPortfolioData() {
        try {
            // Essayer de charger l'index JSON (généré par la fonction Netlify)
            const indexLoaded = await this.loadFromIndex();
            
            if (!indexLoaded) {
                // Fallback : charger récursivement (ancien système)
                console.log('📦 Chargement depuis GitHub (fallback)...');
                for (const category of this.config.categories) {
                    const categoryPath = `${this.config.basePath}/${category.toLowerCase()}`;
                    await this.loadFilesFromPath(categoryPath);
                }
            }
            
            console.log(`✅ ${this.portfolioData.length} photos chargées`);
        } catch (error) {
            console.error('Erreur lors du chargement des données CMS:', error);
        }
    }

    async loadFromIndex() {
        try {
            const { owner, repo } = this.config;
            const indexUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/portfolio-index.json`;
            
            console.log(`📥 Chargement de l'index depuis: ${indexUrl}`);
            
            // Forcer le rechargement en bypassant le cache du navigateur
            const response = await fetch(indexUrl, {
                cache: 'no-cache', // Revalider avec le serveur mais utiliser le cache si valide
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            console.log(`📥 Réponse HTTP: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const photos = await response.json();
                console.log(`📦 Index brut chargé: ${photos.length} photos`);
                
                // Filtrer uniquement les photos sans image (pas de filtrage supplémentaire)
                const validPhotos = photos.filter(photo => {
                    if (!photo.image) {
                        console.warn('⚠️ Photo sans image:', photo.title || photo);
                        return false;
                    }
                    return true;
                });
                
                console.log(`✅ Photos valides après filtrage: ${validPhotos.length} photos`);
                console.log(`📊 Photos filtrées: ${photos.length - validPhotos.length}`);
                
                this.portfolioData = validPhotos;
                console.log(`📦 Index chargé: ${validPhotos.length} photos`);
                
                return true;
            }
            return false;
        } catch (error) {
            console.debug('Index non disponible, utilisation du fallback');
            return false;
        }
    }

    async loadFilesFromPath(path) {
        try {
            const { owner, repo } = this.config;
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
            );
            
            if (response.ok) {
                const items = await response.json();
                
                for (const item of items) {
                    if (item.type === 'file' && item.name.endsWith('.md')) {
                        // C'est un fichier markdown, on le charge
                        await this.loadMarkdownFile(item.path);
                    } else if (item.type === 'dir') {
                        // C'est un dossier (album), on le scan récursivement
                        await this.loadFilesFromPath(item.path);
                    }
                }
            }
        } catch (error) {
            // Silencieux si le dossier n'existe pas encore (normal pour une nouvelle installation)
            console.debug(`Dossier ${path} non trouvé ou vide`);
        }
    }

    async loadMarkdownFile(filePath) {
        try {
            const { owner, repo } = this.config;
            const githubRawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
            
            const response = await fetch(githubRawUrl);
            if (response.ok) {
                const content = await response.text();
                const data = this.parseMarkdownFrontmatter(content);
                if (data) {
                    this.portfolioData.push(data);
                }
            }
        } catch (err) {
            console.warn(`Impossible de charger ${filePath}`);
        }
    }

    parseMarkdownFrontmatter(content) {
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        
        if (match) {
            const frontmatter = match[1];
            const data = {};
            
            frontmatter.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    
                    // Convertir les valeurs booléennes
                    if (value === 'true' || value === 'True') {
                        value = true;
                    } else if (value === 'false' || value === 'False') {
                        value = false;
                    }
                    // Garder les autres valeurs comme strings (dates, URLs, etc.)
                    
                    data[key] = value;
                }
            });
            
            return data;
        }
        
        return null;
    }

    async triggerAutoCleanup() {
        try {
            console.log('🧹 Déclenchement du nettoyage automatique...');
            const response = await fetch('/.netlify/functions/clean-portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ Nettoyage automatique terminé');
                // Recharger les données après nettoyage
                setTimeout(() => {
                    this.loadPortfolioData().then(() => {
                        this.displayPortfolioImages();
                    });
                }, 2000);
            } else {
                console.log('⚠️ Nettoyage automatique échoué');
            }
        } catch (error) {
            console.log('⚠️ Erreur lors du nettoyage automatique:', error);
        }
    }

    displayPortfolioImages() {
        console.log(`🖼️ Affichage de ${this.portfolioData.length} photos`);
        const dataByCategory = this.groupByCategory(this.portfolioData);
        console.log(`📁 Catégories trouvées:`, Object.keys(dataByCategory));
        
        Object.keys(dataByCategory).forEach(category => {
            const categoryData = dataByCategory[category];
            const albumsCount = Object.keys(categoryData.albums).length;
            const singleImagesCount = categoryData.singleImages.length;
            const totalPhotosInCategory = Object.values(categoryData.albums).reduce((sum, album) => sum + album.length, 0) + singleImagesCount;
            console.log(`📂 ${category}: ${albumsCount} albums, ${singleImagesCount} images individuelles (${totalPhotosInCategory} photos totales)`);
            this.updateCategoryContent(category, categoryData);
        });
    }

    groupByCategory(data) {
        const grouped = {};
        let skippedCount = 0;
        
        data.forEach(item => {
            if (!item.category) {
                console.warn('⚠️ Photo sans catégorie:', item.title || item);
                skippedCount++;
                return;
            }
            if (!item.image) {
                console.warn('⚠️ Photo sans image:', item.title || item);
                skippedCount++;
                return;
            }
            
            if (!grouped[item.category]) {
                grouped[item.category] = {
                    albums: {},
                    singleImages: []
                };
            }
            
            if (item.album && item.album.trim() !== '') {
                if (!grouped[item.category].albums[item.album]) {
                    grouped[item.category].albums[item.album] = [];
                }
                grouped[item.category].albums[item.album].push(item);
            } else {
                grouped[item.category].singleImages.push(item);
            }
        });

        if (skippedCount > 0) {
            console.warn(`⚠️ ${skippedCount} photos ignorées (sans catégorie ou sans image)`);
        }

        return grouped;
    }

    updateCategoryContent(category, data) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) return;

        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) return;

        // Utiliser requestAnimationFrame pour ne pas bloquer le rendu
        requestAnimationFrame(() => {
        // Ajouter les albums
        Object.keys(data.albums).forEach(albumName => {
            const albumImages = data.albums[albumName];
            const albumCard = this.createAlbumCard(albumName, albumImages);
            imagesContainer.appendChild(albumCard);
        });

        // Ajouter les images individuelles
        data.singleImages.forEach((item) => {
            const imageCard = this.createImageCard(item);
            imagesContainer.appendChild(imageCard);
        });

        // Mettre à jour le carrousel
        if (window.portfolioCarousel) {
            window.portfolioCarousel.updateCarousel(category);
        }
        });
    }

    createAlbumCard(albumName, images) {
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        
        const coverImage = document.createElement('img');
        coverImage.className = 'album-card-image';
        
        // Trouver l'image de couverture ou utiliser la première par défaut
        // Chercher une image avec isCover === true ou isCover === 'true' (pour gérer les strings)
        let coverImageData = images.find(img => {
            // Log pour déboguer
            if (img.isCover !== undefined) {
                console.log(`🔍 Photo "${img.title}" - isCover:`, img.isCover, typeof img.isCover);
            }
            return img.isCover === true || 
                   img.isCover === 'true' || 
                   img.isCover === 'True' ||
                   img.isCover === 1 ||
                   img.isCover === '1';
        });
        
        // Si aucune image n'est marquée comme couverture, utiliser la première
        if (!coverImageData) {
            console.log(`📸 Aucune couverture trouvée pour l'album "${albumName}", utilisation de la première photo`);
            coverImageData = images[0];
        } else {
            console.log(`✅ Couverture trouvée pour l'album "${albumName}":`, coverImageData.title);
        }
        
        // Optimiser l'URL Cloudinary pour les cartes
        let imageUrl = coverImageData.image;
        if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(imageUrl)) {
            imageUrl = window.ImageOptimizer.optimizeCard(imageUrl, 400);
        }
        
        coverImage.src = imageUrl;
        coverImage.alt = albumName;
        coverImage.fetchPriority = 'high'; // Priorité haute pour les images visibles
        coverImage.decoding = 'async'; // Décodage asynchrone pour meilleures performances
        // Pas de lazy loading car les images sont déjà préchargées
        
        const cardContent = document.createElement('div');
        cardContent.className = 'album-card-content';
        
        const albumTitle = document.createElement('h4');
        albumTitle.className = 'album-card-title';
        albumTitle.textContent = albumName;
        
        cardContent.appendChild(albumTitle);
        
        albumCard.appendChild(coverImage);
        albumCard.appendChild(cardContent);
        
        albumCard.addEventListener('click', () => {
            this.openAlbumCarousel(albumName, images);
        });
        
        return albumCard;
    }

    createImageCard(item) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.style.cursor = 'pointer';
        
        const imgElement = document.createElement('img');
        
        // Optimiser l'URL Cloudinary pour les cartes
        let imageUrl = item.image;
        if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(imageUrl)) {
            imageUrl = window.ImageOptimizer.optimizeCard(imageUrl, 400);
        }
        
        imgElement.src = imageUrl;
        imgElement.alt = item.title || item.description || '';
        imgElement.fetchPriority = 'high'; // Priorité haute pour les images visibles
        imgElement.decoding = 'async'; // Décodage asynchrone pour meilleures performances
        // Pas de lazy loading car les images sont déjà préchargées
        imgElement.width = 400;
        imgElement.height = 600;
        
        // Clic simple pour ouvrir la modal
        imageCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const modalClose = document.getElementById('modal-close');
            
            if (modal && modalImg) {
                // Optimiser l'URL Cloudinary pour l'affichage plein écran
                let imageUrl = item.image;
                if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(imageUrl)) {
                    imageUrl = window.ImageOptimizer.optimizeFullscreen(imageUrl, 1920);
                }
                
                modalImg.src = imageUrl;
                modalImg.alt = item.title || item.description || '';
                modalImg.fetchPriority = 'high';
                modalImg.decoding = 'async';
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Réinitialiser le zoom
                modalImg.style.transform = 'scale(1)';
                modalImg.style.cursor = 'pointer';
                modalImg.dataset.zoomed = 'false';
                
                if (modalClose) {
                    modalClose.focus();
                }
            }
        });
        
        imageCard.appendChild(imgElement);
        
        return imageCard;
    }

    centerThumbnails(thumbnailsContainer, imageCount) {
        if (!thumbnailsContainer || imageCount === 0) return;
        
        // Déterminer la taille des miniatures selon la taille d'écran
        const isMobile = window.innerWidth <= 768;
        const thumbnailWidth = isMobile ? 50 : 100; // 50px sur mobile, 100px sur desktop
        const gap = isMobile ? 4 : 8; // Gap réduit sur mobile
        const padding = isMobile ? 16 : 32; // Padding réduit sur mobile
        
        // Calculer la largeur totale nécessaire pour toutes les miniatures
        const totalWidth = (thumbnailWidth * imageCount) + (gap * (imageCount - 1)) + (padding * 2);
        
        // Obtenir la largeur disponible du conteneur
        const containerWidth = thumbnailsContainer.offsetWidth || thumbnailsContainer.clientWidth;
        
        // Si toutes les miniatures tiennent dans l'espace disponible, les centrer
        if (totalWidth <= containerWidth) {
            thumbnailsContainer.style.justifyContent = 'center';
            thumbnailsContainer.style.overflowX = 'hidden';
        } else {
            // Sinon, permettre le scroll horizontal et aligner à gauche
            thumbnailsContainer.style.justifyContent = 'flex-start';
            thumbnailsContainer.style.overflowX = 'auto';
        }
    }

    openAlbumCarousel(albumName, images) {
        const modal = document.getElementById('album-modal');
        const albumTitle = document.getElementById('album-title');
        const albumCounter = document.getElementById('album-counter');
        const carouselImage = document.getElementById('carousel-image');
        const thumbnailsContainer = document.getElementById('carousel-thumbnails');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');
        
        if (!modal) return;
        
        let currentIndex = 0;
        let isZoomed = false;
        let lastTap = 0;
        let resizeHandler = null;
        
        // Variables pour le pan (déplacement) sur mobile
        let isPanning = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        
        const showImage = (index) => {
            currentIndex = index;
            const image = images[index];
            
            // Réinitialiser le zoom lors du changement d'image
            carouselImage.style.transform = 'scale(1)';
            carouselImage.style.cursor = 'pointer';
            carouselImage.style.transformOrigin = 'center center';
            isZoomed = false;
            currentX = 0;
            currentY = 0;
            isPanning = false;
            
            // Optimiser l'URL Cloudinary pour l'affichage plein écran
            let imageUrl = image.image;
            if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(imageUrl)) {
                imageUrl = window.ImageOptimizer.optimizeFullscreen(imageUrl, 1920);
            }
            
            // Changer l'image immédiatement
            carouselImage.src = imageUrl;
            carouselImage.alt = albumName;
            carouselImage.fetchPriority = 'high';
            carouselImage.decoding = 'async';
            
            // Animation légère et rapide
            carouselImage.style.animation = 'none';
            requestAnimationFrame(() => {
                carouselImage.style.animation = 'carouselImageZoom 0.12s ease-out';
            });
            
            albumCounter.textContent = `${index + 1} / ${images.length}`;
            
            const imageContainer = document.querySelector('.carousel-image-container');
            if (imageContainer) {
                imageContainer.setAttribute('data-title', albumName);
            }
            
            prevButton.disabled = index === 0;
            nextButton.disabled = index === images.length - 1;
            
            document.querySelectorAll('.carousel-thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            // Précharger les images adjacentes pour navigation fluide
            if (index < images.length - 1) {
                const nextImg = new Image();
                let nextUrl = images[index + 1].image;
                if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(nextUrl)) {
                    nextUrl = window.ImageOptimizer.optimizeFullscreen(nextUrl, 1920);
                }
                nextImg.src = nextUrl;
                nextImg.fetchPriority = 'low';
            }
            if (index > 0) {
                const prevImg = new Image();
                let prevUrl = images[index - 1].image;
                if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(prevUrl)) {
                    prevUrl = window.ImageOptimizer.optimizeFullscreen(prevUrl, 1920);
                }
                prevImg.src = prevUrl;
                prevImg.fetchPriority = 'low';
            }
        };
        
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'carousel-thumbnail';
            
            // Optimiser l'URL Cloudinary pour les miniatures
            let imageUrl = image.image;
            if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(imageUrl)) {
                imageUrl = window.ImageOptimizer.optimizeThumbnail(imageUrl, 100);
            }
            
            thumbnail.src = imageUrl;
            thumbnail.alt = image.title || '';
            thumbnail.fetchPriority = 'low'; // Priorité basse pour les miniatures
            thumbnail.decoding = 'async';
            thumbnail.addEventListener('click', () => showImage(index));
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // Centrer les miniatures si elles tiennent dans l'espace disponible
        setTimeout(() => {
            this.centerThumbnails(thumbnailsContainer, images.length);
            
            // Recentrer lors du redimensionnement de la fenêtre
            let resizeTimeout;
            resizeHandler = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (modal.classList.contains('active')) {
                        this.centerThumbnails(thumbnailsContainer, images.length);
                    }
                }, 150);
            };
            window.addEventListener('resize', resizeHandler);
        }, 100);
        
        albumTitle.textContent = albumName;
        showImage(0);
        
        // Précharger toutes les images de l'album en arrière-plan pour navigation instantanée
        images.forEach((image) => {
            const img = new Image();
            let preloadUrl = image.image;
            if (window.ImageOptimizer && window.ImageOptimizer.isCloudinaryUrl(preloadUrl)) {
                preloadUrl = window.ImageOptimizer.optimizeFullscreen(preloadUrl, 1920);
            }
            img.src = preloadUrl;
            img.fetchPriority = 'low';
        });
        
        // Fonction pour limiter le déplacement aux limites de l'image
        const constrainPan = (x, y, img) => {
            const rect = img.getBoundingClientRect();
            const containerRect = img.parentElement.getBoundingClientRect();
            const scale = 2; // Niveau de zoom
            
            const scaledWidth = rect.width * scale;
            const scaledHeight = rect.height * scale;
            
            const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
            const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
            
            return {
                x: Math.max(-maxX, Math.min(maxX, x)),
                y: Math.max(-maxY, Math.min(maxY, y))
            };
        };

        // Gestion du pan (déplacement) sur l'image zoomée
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        
        carouselImage.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            if (isZoomed) {
                if (e.touches.length === 1) {
                    isPanning = true;
                    startX = e.touches[0].clientX - currentX;
                    startY = e.touches[0].clientY - currentY;
                    initialX = currentX;
                    initialY = currentY;
                }
            }
        });

        carouselImage.addEventListener('touchmove', (e) => {
            if (isZoomed && isPanning) {
                if (e.touches.length === 1) {
                    e.preventDefault(); // Empêcher le scroll de la page
                    
                    // Retirer la transition pendant le pan pour un mouvement fluide
                    carouselImage.style.transition = '';
                    
                    const x = e.touches[0].clientX - startX;
                    const y = e.touches[0].clientY - startY;
                    
                    const constrained = constrainPan(x, y, carouselImage);
                    currentX = constrained.x;
                    currentY = constrained.y;
                    
                    carouselImage.style.transform = `scale(2) translate(${currentX}px, ${currentY}px)`;
                    carouselImage.style.transformOrigin = 'center center';
                }
            }
        });
        
        // Gestion du zoom au double tap sur mobile (fusionné avec touchend du pan)
        carouselImage.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Calculer la distance du mouvement
            const moveDistance = Math.sqrt(
                Math.pow(touchEndX - touchStartX, 2) + 
                Math.pow(touchEndY - touchStartY, 2)
            );
            
            // Si on était en train de panner, arrêter le pan et recentrer l'image
            if (isZoomed && isPanning) {
                isPanning = false;
                // Recentrer l'image avec une animation fluide
                carouselImage.style.transition = 'transform 0.3s ease-out';
                currentX = 0;
                currentY = 0;
                carouselImage.style.transform = 'scale(2) translate(0px, 0px)';
                carouselImage.style.transformOrigin = 'center center';
                
                // Retirer la transition après l'animation
                setTimeout(() => {
                    carouselImage.style.transition = '';
                }, 300);
                
                // Ne pas détecter le double tap si on a bougé (c'était un pan)
                if (moveDistance > 10) {
                    return;
                }
            }
            
            // Détecter le double tap seulement si :
            // - Le mouvement était très petit (< 10px) - c'est un tap, pas un pan
            // - La durée était courte (< 300ms) - c'est un tap rapide
            if (moveDistance < 10 && touchDuration < 300) {
                const currentTime = Date.now();
                const tapLength = currentTime - lastTap;
            
            // Détection du double tap (moins de 300ms entre deux taps)
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                
                if (!isZoomed) {
                    // Zoom
                        carouselImage.style.transition = 'transform 0.3s ease-out';
                    carouselImage.style.transform = 'scale(2)';
                    carouselImage.style.cursor = 'zoom-out';
                        carouselImage.style.transformOrigin = 'center center';
                        currentX = 0;
                        currentY = 0;
                    isZoomed = true;
                        
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                        }, 300);
                } else {
                    // Dézoom
                        carouselImage.style.transition = 'transform 0.3s ease-out';
                    carouselImage.style.transform = 'scale(1)';
                    carouselImage.style.cursor = 'pointer';
                        carouselImage.style.transformOrigin = 'center center';
                        currentX = 0;
                        currentY = 0;
                    isZoomed = false;
                        
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                        }, 300);
                    }
                }
                
                lastTap = currentTime;
            }
        });
        
        prevButton.onclick = () => {
            if (currentIndex > 0) showImage(currentIndex - 1);
        };
        
        nextButton.onclick = () => {
            if (currentIndex < images.length - 1) showImage(currentIndex + 1);
        };
        
        const handleKeyboard = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                showImage(currentIndex + 1);
            } else if (e.key === 'Escape') {
                closeCarousel();
            }
        };
        
        const closeCarousel = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyboard);
            // Nettoyer l'event listener de resize
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
        };
        
        document.getElementById('album-modal-close').onclick = closeCarousel;
        modal.onclick = (e) => e.target === modal && closeCarousel();
        document.addEventListener('keydown', handleKeyboard);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Initialiser
document.addEventListener('DOMContentLoaded', () => {
    window.cmsLoader = new CMSContentLoader();
});
