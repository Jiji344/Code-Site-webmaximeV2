// Chargement et affichage du contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2',
            basePath: 'content/portfolio',
            // Liste des catégories à scanner
            categories: ['Portrait', 'Mariage', 'Immobilier', 'Événementiel', 'Voyage', 'Animalier']
        };
        this.init();
    }

    async init() {
        // Charger les données du portfolio en premier (priorité)
        await this.loadPortfolioData();
        this.displayPortfolioImages();
        
        // Déclencher l'événement pour masquer le loader
        window.dispatchEvent(new CustomEvent('portfolio-images-preloaded'));
        
    }


    async loadPortfolioData() {
        try {
            // Essayer de charger l'index JSON (généré par la fonction Netlify)
            const indexLoaded = await this.loadFromIndex();
            
            if (!indexLoaded) {
                // Fallback : charger récursivement (ancien système)
                this.portfolioData = [];
                
                for (const category of this.config.categories) {
                    const categoryPath = `${this.config.basePath}/${category.toLowerCase()}`;
                    await this.loadFilesFromPath(categoryPath);
                }
            }
            
            if (this.portfolioData.length === 0) {
                console.error('❌ AUCUNE PHOTO CHARGÉE !');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données CMS:', error);
        }
    }

    async loadFromIndex() {
        try {
            const { owner, repo } = this.config;
            const indexUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/portfolio-index.json?t=${Date.now()}`;
            
            const response = await fetch(indexUrl, {
                cache: 'no-store',
                mode: 'cors'
            });
            
            if (response.ok) {
                const photos = await response.json();
                
                // Filtrer uniquement les photos valides (avec image)
                const validPhotos = photos.filter(photo => photo && photo.image);
                
                if (validPhotos.length > 0) {
                    this.portfolioData = validPhotos;
                    return true;
                }
            }
            return false;
        } catch (error) {
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
            // Silencieux si le dossier n'existe pas
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
            // Silencieux en cas d'erreur
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
            const response = await fetch('/.netlify/functions/clean-portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                // Recharger les données après nettoyage
                setTimeout(() => {
                    this.loadPortfolioData().then(() => {
                        this.displayPortfolioImages();
                    });
                }, 2000);
            }
        } catch (error) {
            // Silencieux en cas d'erreur
        }
    }

    displayPortfolioImages() {
        if (this.portfolioData.length === 0) {
            console.error('❌ AUCUNE PHOTO À AFFICHER !');
            return;
        }
        
        const dataByCategory = this.groupByCategory(this.portfolioData);
        const categories = Object.keys(dataByCategory);
        
        categories.forEach(category => {
            this.updateCategoryContent(category, dataByCategory[category]);
        });
    }

    groupByCategory(data) {
        const grouped = {};
        
        data.forEach(item => {
            if (item.category && item.image) {
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
            }
        });

        return grouped;
    }

    async updateCategoryContent(category, data) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) return;

        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) return;

        requestAnimationFrame(() => {
            // Garder les éléments de navigation
            const navElements = imagesContainer.querySelectorAll('.category-nav-prev, .category-nav-next');
            imagesContainer.innerHTML = '';
            navElements.forEach(nav => imagesContainer.appendChild(nav));
            
            // Ajouter les albums
            const albumNames = Object.keys(data.albums);
            albumNames.forEach(albumName => {
                const albumCard = this.createAlbumCard(albumName, data.albums[albumName]);
                if (albumCard) imagesContainer.appendChild(albumCard);
            });

            // Ajouter les images individuelles
            data.singleImages.forEach(item => {
                imagesContainer.appendChild(this.createImageCard(item));
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
        let coverImageData = images.find((img) => {
            const isCover = img.isCover === true || 
                           img.isCover === 'true' || 
                           img.isCover === 'True' ||
                           img.isCover === 1 ||
                           img.isCover === '1';
            return isCover;
        });
        
        // Si aucune image n'est marquée comme couverture, utiliser la première
        if (!coverImageData) {
            if (images.length > 0) {
                coverImageData = images[0];
            } else {
                return null;
            }
        }
        
        let imageUrl = coverImageData.image;
        
        coverImage.src = imageUrl;
        coverImage.alt = albumName;
        coverImage.loading = 'lazy';
        coverImage.decoding = 'async';
        
        const cardContent = document.createElement('div');
        cardContent.className = 'album-card-content';
        
        const albumTitle = document.createElement('h4');
        albumTitle.className = 'album-card-title';
        albumTitle.textContent = albumName;
        
        cardContent.appendChild(albumTitle);
        
        albumCard.appendChild(coverImage);
        albumCard.appendChild(cardContent);
        
        albumCard.addEventListener('click', () => {
            if (!images || images.length === 0) {
                console.error('❌ Album vide:', albumName);
                return;
            }
            this.openAlbumCarousel(albumName, images);
        });
        
        return albumCard;
    }

    createImageCard(item) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.style.cursor = 'pointer';
        
        const imgElement = document.createElement('img');
        
        let imageUrl = item.image;
        
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
                let imageUrl = item.image;
                
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

    scrollThumbnailToCenter(thumbnailsContainer, activeIndex) {
        if (!thumbnailsContainer || activeIndex < 0) return;
        
        const thumbnails = thumbnailsContainer.children;
        if (!thumbnails || activeIndex >= thumbnails.length) return;
        
        const thumbnail = thumbnails[activeIndex];
        if (!thumbnail) return;
        
        // Marquer qu'on est en train de centrer pour éviter les conflits avec le scroll infini
        if (thumbnailsContainer.isCentering) return;
        thumbnailsContainer.isCentering = true;
        
        // Détecter si on est sur un vrai appareil mobile
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                               (window.innerWidth <= 768 && 'ontouchstart' in window);
        
        // Attendre que les vignettes soient rendues et mesurables
        let attempts = 0;
        const maxAttempts = 15;
        
        const centerThumbnail = () => {
            attempts++;
            
            // Vérifier que la vignette est toujours valide
            if (!thumbnailsContainer.contains(thumbnail)) {
                thumbnailsContainer.isCentering = false;
                return;
            }
            
            // Calculer la position de scroll pour centrer la vignette
            const containerWidth = thumbnailsContainer.clientWidth;
            const thumbnailLeft = thumbnail.offsetLeft;
            const thumbnailWidth = thumbnail.offsetWidth || thumbnail.getBoundingClientRect().width;
            
            // Si les dimensions ne sont pas encore disponibles, réessayer
            if (containerWidth === 0 || thumbnailWidth === 0 || attempts < 3) {
                if (attempts < maxAttempts) {
                    requestAnimationFrame(centerThumbnail);
                } else {
                    thumbnailsContainer.isCentering = false;
                }
                return;
            }
            
            // Sur mobile réel, utiliser scrollIntoView qui fonctionne mieux
            if (isMobileDevice) {
                try {
                    thumbnail.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                } catch (e) {
                    // Fallback si scrollIntoView échoue
                    const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
                    const maxScroll = Math.max(0, thumbnailsContainer.scrollWidth - containerWidth);
                    const finalScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
                    thumbnailsContainer.scrollLeft = finalScroll;
                    thumbnailsContainer.lastScrollLeft = finalScroll;
                }
            } else {
                // Sur desktop/responsive, utiliser scrollTo
                const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
                const maxScroll = Math.max(0, thumbnailsContainer.scrollWidth - containerWidth);
                const finalScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
                
                thumbnailsContainer.lastScrollLeft = finalScroll;
                thumbnailsContainer.scrollTo({
                    left: finalScroll,
                    behavior: 'smooth'
                });
            }
            
            // Réactiver le scroll infini après l'animation
            setTimeout(() => {
                thumbnailsContainer.isCentering = false;
                thumbnailsContainer.lastScrollLeft = thumbnailsContainer.scrollLeft;
            }, 700);
        };
        
        // Utiliser plusieurs requestAnimationFrame pour s'assurer que le DOM est complètement prêt
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(centerThumbnail);
            });
        });
    }

    /**
     * Précharge progressivement les images d'un album
     * Priorité 1: Image actuelle (fullscreen) - déjà chargée dans showImage
     * Priorité 2: Images adjacentes (±1) en 1200px
     * Priorité 3: Images proches (±2 à ±5) en 800px
     * Priorité 4: Images lointaines progressivement par lots
     */
    scheduleProgressivePreload(images, currentIndex, imageCache, preloadState, isSlowConnection, isFastConnection) {
        // Annuler les préchargements précédents en attente
        if (preloadState.timeout) {
            clearTimeout(preloadState.timeout);
            preloadState.timeout = null;
        }

        const preloadImage = (imageIndex, size) => {
            if (imageIndex < 0 || imageIndex >= images.length) return;
            
            const image = images[imageIndex];
            if (!image || !image.image) return;
            
            // Vérifier si déjà en cache
            const cacheKey = `${imageIndex}_${size}`;
            if (imageCache.has(cacheKey)) {
                const cached = imageCache.get(cacheKey);
                if (cached.loaded) return; // Déjà chargée
            }
            
            // Marquer comme en cours de chargement
            imageCache.set(cacheKey, { loading: true });
            
            const img = new Image();
            let imageUrl = image.image;
            
            img.fetchPriority = 'low';
            img.decoding = 'async';
            
            img.onload = () => {
                imageCache.set(cacheKey, { loaded: true, img: img });
            };
            
            img.onerror = () => {
                imageCache.delete(cacheKey);
            };
            
            img.src = imageUrl;
        };

        // Priorité 2: Images adjacentes (±1) en 1200px
        const preloadAdjacent = () => {
            if (currentIndex > 0) {
                preloadImage(currentIndex - 1, 1200);
            }
            if (currentIndex < images.length - 1) {
                preloadImage(currentIndex + 1, 1200);
            }
        };

        // Priorité 3: Images proches (±2 à ±5) en 800px
        const preloadNearby = () => {
            const nearbyRange = [2, 3, 4, 5];
            nearbyRange.forEach(offset => {
                if (currentIndex - offset >= 0) {
                    preloadImage(currentIndex - offset, 800);
                }
                if (currentIndex + offset < images.length) {
                    preloadImage(currentIndex + offset, 800);
                }
            });
        };

        // Priorité 4: Images lointaines progressivement
        const preloadDistant = () => {
            if (preloadState.inProgress) return;
            preloadState.inProgress = true;
            
            const distantIndices = [];
            for (let i = 0; i < images.length; i++) {
                const distance = Math.abs(i - currentIndex);
                if (distance > 5) {
                    distantIndices.push({ index: i, distance });
                }
            }
            
            // Trier par distance (plus proche d'abord)
            distantIndices.sort((a, b) => a.distance - b.distance);
            
            // Précharger par lots de 3-5 images
            const batchSize = 3;
            let batchIndex = 0;
            
            const processBatch = () => {
                const batch = distantIndices.slice(batchIndex, batchIndex + batchSize);
                if (batch.length === 0) {
                    preloadState.inProgress = false;
                    return;
                }
                
                batch.forEach(({ index }) => {
                    preloadImage(index, 800);
                });
                
                batchIndex += batchSize;
                
                // Utiliser requestIdleCallback si disponible, sinon setTimeout
                if (window.requestIdleCallback) {
                    window.requestIdleCallback(processBatch, { timeout: 1000 });
                } else {
                    setTimeout(processBatch, 200);
                }
            };
            
            // Démarrer le traitement des lots
            if (window.requestIdleCallback) {
                window.requestIdleCallback(processBatch, { timeout: 1000 });
            } else {
                setTimeout(processBatch, 200);
            }
        };

        // Exécuter les préchargements avec délais progressifs
        // Sur connexion lente, réduire le nombre d'images préchargées
        if (isSlowConnection) {
            // Seulement les adjacentes
            preloadAdjacent();
        } else {
            preloadAdjacent();
            
            preloadState.timeout = setTimeout(() => {
                preloadNearby();
                // Sur connexion rapide, précharger aussi les lointaines
                if (isFastConnection) {
                    preloadState.timeout = setTimeout(() => {
                        preloadDistant();
                    }, 300);
                }
            }, 100);
        }
    }
    
    /**
     * Met à niveau les images adjacentes en fullscreen quand l'image actuelle est chargée
     */
    upgradeAdjacentToFullscreen(images, currentIndex, imageCache) {
        const upgradeImage = (imageIndex) => {
            if (imageIndex < 0 || imageIndex >= images.length) return;
            
            const cacheKey1200 = `${imageIndex}_1200`;
            const cacheKey1920 = `${imageIndex}_1920`;
            
            // Si l'image en 1200px est chargée mais pas en 1920px, la mettre à niveau
            if (imageCache.has(cacheKey1200)) {
                const cached1200 = imageCache.get(cacheKey1200);
                if (cached1200.loaded && !imageCache.has(cacheKey1920)) {
                    const image = images[imageIndex];
                    if (!image || !image.image) return;
                    
                    let imageUrl = image.image;
                    
                    const img = new Image();
                    img.fetchPriority = 'low';
                    img.decoding = 'async';
                    img.onload = () => {
                        imageCache.set(cacheKey1920, { loaded: true, img: img });
                    };
                    img.src = imageUrl;
                }
            }
        };
        
        // Mettre à niveau les adjacentes
        if (currentIndex > 0) upgradeImage(currentIndex - 1);
        if (currentIndex < images.length - 1) upgradeImage(currentIndex + 1);
    }
    
    /**
     * Précharge la prochaine image en fullscreen quand l'image actuelle est à 80% chargée
     */
    preloadNextInFullscreen(images, currentIndex, imageCache, preloadState) {
        // Déterminer la direction probable (basée sur la dernière navigation)
        const nextIndex = preloadState.lastDirection === 'prev' && currentIndex > 0 
            ? currentIndex - 1 
            : currentIndex < images.length - 1 
                ? currentIndex + 1 
                : null;
        
        if (nextIndex === null) return;
        
        const cacheKey = `${nextIndex}_1920`;
        if (imageCache.has(cacheKey)) {
            const cached = imageCache.get(cacheKey);
            if (cached.loaded) return; // Déjà chargée
        }
        
        const image = images[nextIndex];
        if (!image || !image.image) return;
        
        let imageUrl = image.image;
        
        const img = new Image();
        img.fetchPriority = 'high'; // Priorité haute car c'est la prochaine probable
        img.decoding = 'async';
        img.onload = () => {
            imageCache.set(cacheKey, { loaded: true, img: img });
        };
        img.src = imageUrl;
    }

    openAlbumCarousel(albumName, images) {
        if (!images || images.length === 0) {
            console.error('❌ Aucune image dans l\'album:', albumName);
            return;
        }
        
        const modal = document.getElementById('album-modal');
        const albumTitle = document.getElementById('album-title');
        const albumCounter = document.getElementById('album-counter');
        const carouselImage = document.getElementById('carousel-image');
        const thumbnailsContainer = document.getElementById('carousel-thumbnails');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');
        
        if (!modal || !albumTitle || !albumCounter || !carouselImage || !thumbnailsContainer) {
            console.error('❌ Éléments DOM manquants pour le carousel');
            return;
        }
        
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
        
        // Variables pour le slide (changement d'image)
        let isSliding = false;
        let slideStartX = 0;
        let slideStartY = 0;
        let slideCurrentX = 0;
        let slideThreshold = 50; // Distance minimale pour déclencher le slide
        let slideVelocity = 0; // Vitesse du slide pour l'inertie
        let lastSlideX = 0;
        let lastSlideTime = 0;
        let animationFrame = null;
        
        // Cache des images préchargées et état du préchargement
        const imageCache = new Map();
        const preloadState = {
            timeout: null,
            inProgress: false,
            lastDirection: null, // 'next' ou 'prev' pour préchargement directionnel
            currentImageLoadProgress: 0
        };
        
        // Détecter la qualité de connexion
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isFastConnection = connection && (connection.effectiveType === '4g');
        
        const showImage = (index) => {
            // Gérer le défilement infini (loop)
            if (index < 0) {
                index = images.length - 1;
            } else if (index >= images.length) {
                index = 0;
            }
            
            currentIndex = index;
            const image = images[index];
            
            // Annuler toute animation en cours
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // Réinitialiser le zoom lors du changement d'image
            carouselImage.style.transform = 'scale(1) translateX(0)';
            carouselImage.style.cursor = 'pointer';
            carouselImage.style.transformOrigin = 'center center';
            carouselImage.style.willChange = 'auto';
            isZoomed = false;
            currentX = 0;
            currentY = 0;
            isPanning = false;
            isSliding = false;
            slideCurrentX = 0;
            slideVelocity = 0;
            
            let imageUrl = image.image;
            
            // Vérifier si l'image est déjà en cache (fullscreen)
            const cacheKey = `${index}_1920`;
            if (imageCache.has(cacheKey)) {
                const cached = imageCache.get(cacheKey);
                if (cached.loaded && cached.img) {
                    // Utiliser l'image en cache directement
                    carouselImage.src = cached.img.src;
                } else {
                    carouselImage.src = imageUrl;
                }
            } else {
                carouselImage.src = imageUrl;
            }
            
            carouselImage.alt = albumName;
            carouselImage.fetchPriority = 'high';
            carouselImage.decoding = 'async';
            
            // Suivre la progression du chargement pour préchargement anticipatif
            carouselImage.onload = () => {
                preloadState.currentImageLoadProgress = 100;
                // Quand l'image actuelle est chargée, mettre à niveau les adjacentes en fullscreen
                this.upgradeAdjacentToFullscreen(images, index, imageCache);
            };
            
            carouselImage.onprogress = (e) => {
                if (e.lengthComputable) {
                    preloadState.currentImageLoadProgress = (e.loaded / e.total) * 100;
                    // À 80% de chargement, commencer à précharger la suivante en fullscreen
                    if (preloadState.currentImageLoadProgress >= 80) {
                        this.preloadNextInFullscreen(images, index, imageCache, preloadState);
                    }
                }
            };
            
            // Animation légère et rapide
            carouselImage.style.animation = 'none';
            requestAnimationFrame(() => {
                carouselImage.style.animation = 'carouselImageZoom 0.12s ease-out';
            });
            
            albumCounter.textContent = `${currentIndex + 1} / ${images.length}`;
            
            const imageContainer = document.querySelector('.carousel-image-container');
            if (imageContainer) {
                imageContainer.setAttribute('data-title', albumName);
            }
            
            document.querySelectorAll('.carousel-thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            // Centrer la vignette active
            requestAnimationFrame(() => {
                this.scrollThumbnailToCenter(thumbnailsContainer, currentIndex);
            });
            
            // Déclencher le préchargement progressif des images adjacentes et autres
            this.scheduleProgressivePreload(images, index, imageCache, preloadState, isSlowConnection, isFastConnection);
        };
        
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'carousel-thumbnail';
            thumbnail.setAttribute('data-index', index);
            
            let imageUrl = image.image;
            
            // Charger les miniatures visibles immédiatement, les autres en lazy
            if (index <= 5) {
                // Premières miniatures visibles : chargement immédiat
                thumbnail.src = imageUrl;
                thumbnail.fetchPriority = 'high';
            } else {
                // Miniatures hors écran : lazy loading
                thumbnail.loading = 'lazy';
                thumbnail.fetchPriority = 'low';
                // Utiliser data-src pour le lazy loading
                thumbnail.setAttribute('data-src', imageUrl);
                
                // Observer pour charger quand visible
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            observer.unobserve(img);
                        }
                    });
                }, { rootMargin: '50px' });
                
                observer.observe(thumbnail);
            }
            
            thumbnail.alt = image.title || '';
            thumbnail.decoding = 'async';
            thumbnail.addEventListener('click', () => showImage(index));
            
            // Précharger l'image en fullscreen au survol de la miniature
            thumbnail.addEventListener('mouseenter', () => {
                    if (!isSlowConnection) {
                    const cacheKey = `${index}_1920`;
                    if (!imageCache.has(cacheKey)) {
                        const img = new Image();
                        let preloadUrl = image.image;
                        img.fetchPriority = 'high';
                        img.decoding = 'async';
                        img.onload = () => {
                            imageCache.set(cacheKey, { loaded: true, img: img });
                        };
                        img.src = preloadUrl;
                    }
                }
            });
            
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // S'assurer que le conteneur permet le scroll
        thumbnailsContainer.style.overflowX = 'auto';
        thumbnailsContainer.style.justifyContent = 'flex-start';
        
        // Gérer le scroll infini en boucle
        let isScrolling = false;
        let scrollTimeout = null;
        let isUserScrolling = false;
        
        // Stocker lastScrollLeft sur le conteneur pour synchronisation
        thumbnailsContainer.lastScrollLeft = thumbnailsContainer.scrollLeft;
        
        const handleInfiniteScroll = () => {
            // Ne pas interférer si on est en train de centrer programmatiquement
            // Attendre un peu plus longtemps pour laisser le centrage se terminer
            if (isScrolling || thumbnailsContainer.isCentering) {
                // Réinitialiser isUserScrolling si on est en train de centrer
                isUserScrolling = false;
                // Mettre à jour lastScrollLeft pour éviter les conflits
                thumbnailsContainer.lastScrollLeft = thumbnailsContainer.scrollLeft;
                return;
            }
            
            const container = thumbnailsContainer;
            const scrollLeft = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const clientWidth = container.clientWidth;
            const maxScroll = scrollWidth - clientWidth;
            
            // Ignorer si le conteneur est trop petit pour scroller
            if (maxScroll <= 0) return;
            
            // Détecter si c'est un scroll utilisateur (changement de position)
            const scrollDelta = Math.abs(scrollLeft - (thumbnailsContainer.lastScrollLeft || 0));
            if (scrollDelta > 1) {
                isUserScrolling = true;
                thumbnailsContainer.lastScrollLeft = scrollLeft;
            }
            
            // Détecter si c'est un scroll utilisateur (pas programmatique)
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                // Ne faire le saut que si c'est un scroll utilisateur
                if (!isUserScrolling) {
                    isUserScrolling = false;
                    return;
                }
                
                const currentScroll = container.scrollLeft;
                
                // Si on est très proche du début (dans les 30px), sauter vers la fin
                if (currentScroll <= 30 && maxScroll > 0) {
                    isScrolling = true;
                    isUserScrolling = false;
                    const newScroll = maxScroll - 10; // Laisser un peu de marge
                    container.scrollTo({
                        left: newScroll,
                        behavior: 'auto'
                    });
                    thumbnailsContainer.lastScrollLeft = newScroll;
                    setTimeout(() => { isScrolling = false; }, 150);
                }
                // Si on est très proche de la fin (dans les 30px), sauter vers le début
                else if (currentScroll >= maxScroll - 30 && maxScroll > 0) {
                    isScrolling = true;
                    isUserScrolling = false;
                    const newScroll = 10; // Laisser un peu de marge
                    container.scrollTo({
                        left: newScroll,
                        behavior: 'auto'
                    });
                    thumbnailsContainer.lastScrollLeft = newScroll;
                    setTimeout(() => { isScrolling = false; }, 150);
                } else {
                    isUserScrolling = false;
                    thumbnailsContainer.lastScrollLeft = currentScroll;
                }
            }, 150);
        };
        
        thumbnailsContainer.addEventListener('scroll', handleInfiniteScroll);
        thumbnailsContainer.hasScrollListener = true;
        
        // Centrer la première vignette au démarrage
        setTimeout(() => {
            this.scrollThumbnailToCenter(thumbnailsContainer, 0);
            
            // Recentrer lors du redimensionnement de la fenêtre
            let resizeTimeout;
            resizeHandler = () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (modal.classList.contains('active')) {
                        this.scrollThumbnailToCenter(thumbnailsContainer, currentIndex);
                    }
                }, 150);
            };
            window.addEventListener('resize', resizeHandler);
        }, 100);
        
        albumTitle.textContent = albumName;
        showImage(0);
        
        
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
            
            // Annuler toute animation en cours
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            if (isZoomed) {
                if (e.touches.length === 1) {
                    isPanning = true;
                    startX = e.touches[0].clientX - currentX;
                    startY = e.touches[0].clientY - currentY;
                    initialX = currentX;
                    initialY = currentY;
                }
            } else {
                // Initialiser les variables de slide mais ne pas activer immédiatement
                // On activera seulement si le mouvement est significatif
                isSliding = false;
                slideStartX = e.touches[0].clientX;
                slideStartY = e.touches[0].clientY;
                slideCurrentX = 0;
                slideVelocity = 0;
                lastSlideX = slideStartX;
                lastSlideTime = Date.now();
                // Optimiser les performances
                carouselImage.style.willChange = 'transform';
            }
        }, { passive: true });

        carouselImage.addEventListener('touchmove', (e) => {
            if (isZoomed && isPanning) {
                if (e.touches.length === 1) {
                    e.preventDefault(); // Empêcher le scroll de la page
                    
                    // Capturer les valeurs avant requestAnimationFrame
                    const touchX = e.touches[0].clientX;
                    const touchY = e.touches[0].clientY;
                    
                    // Utiliser requestAnimationFrame pour un mouvement ultra-fluide
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }
                    
                    animationFrame = requestAnimationFrame(() => {
                        // Retirer la transition pendant le pan pour un mouvement fluide
                        carouselImage.style.transition = 'none';
                        
                        const x = touchX - startX;
                        const y = touchY - startY;
                        
                        const constrained = constrainPan(x, y, carouselImage);
                        currentX = constrained.x;
                        currentY = constrained.y;
                        
                        carouselImage.style.transform = `scale(2) translate(${currentX}px, ${currentY}px)`;
                        carouselImage.style.transformOrigin = 'center center';
                        animationFrame = null;
                    });
                }
            } else if (!isZoomed) {
                // Gérer le slide pour changer d'image (mobile uniquement)
                const currentTime = Date.now();
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = touchX - slideStartX;
                const deltaY = Math.abs(touchY - slideStartY);
                
                // Calculer la vélocité pour l'inertie
                if (currentTime - lastSlideTime > 0) {
                    slideVelocity = (touchX - lastSlideX) / (currentTime - lastSlideTime);
                }
                lastSlideX = touchX;
                lastSlideTime = currentTime;
                
                // Si le mouvement horizontal est plus important que le vertical, activer le slide
                if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
                    if (!isSliding) {
                        isSliding = true;
                        carouselImage.style.transition = 'none';
                    }
                    e.preventDefault();
                    
                    // Utiliser requestAnimationFrame pour un mouvement ultra-fluide
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }
                    
                    animationFrame = requestAnimationFrame(() => {
                        // Appliquer une résistance progressive aux bords
                        let resistance = 1;
                        const maxSlide = window.innerWidth * 0.5;
                        if (Math.abs(deltaX) > maxSlide) {
                            resistance = maxSlide / Math.abs(deltaX);
                        }
                        
                        slideCurrentX = deltaX * resistance;
                        carouselImage.style.transform = `scale(1) translateX(${slideCurrentX}px)`;
                        animationFrame = null;
                    });
                }
            }
        }, { passive: false });

        // Gestion du zoom au double tap sur mobile (fusionné avec touchend du pan)
        carouselImage.addEventListener('touchend', (e) => {
            // Annuler toute animation en cours
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Calculer la distance du mouvement
            const moveDistance = Math.sqrt(
                Math.pow(touchEndX - touchStartX, 2) + 
                Math.pow(touchEndY - touchStartY, 2)
            );
            
            // Gérer le slide pour changer d'image
            if (isSliding && !isZoomed) {
                isSliding = false;
                carouselImage.style.willChange = 'auto';
                
                const deltaX = touchEndX - slideStartX;
                const deltaY = Math.abs(touchEndY - slideStartY);
                
                // Prendre en compte la vélocité pour l'inertie
                const velocityThreshold = 0.3; // px/ms
                const hasVelocity = Math.abs(slideVelocity) > velocityThreshold;
                
                // Si le mouvement horizontal est suffisant OU si la vélocité est importante
                if ((Math.abs(deltaX) > slideThreshold && Math.abs(deltaX) > deltaY) || 
                    (hasVelocity && Math.abs(deltaX) > 20)) {
                    if (deltaX > 0) {
                        // Slide vers la droite -> image précédente (avec loop)
                        preloadState.lastDirection = 'prev';
                        carouselImage.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                        showImage(currentIndex - 1);
                    } else if (deltaX < 0) {
                        // Slide vers la gauche -> image suivante (avec loop)
                        preloadState.lastDirection = 'next';
                        carouselImage.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                        showImage(currentIndex + 1);
                    } else {
                        // Retour à la position initiale avec animation fluide
                        carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        carouselImage.style.transform = 'scale(1) translateX(0)';
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                        }, 300);
                    }
                } else {
                    // Retour à la position initiale si le mouvement n'était pas suffisant
                    carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    carouselImage.style.transform = 'scale(1) translateX(0)';
                    setTimeout(() => {
                        carouselImage.style.transition = '';
                    }, 300);
                }
                return;
            }
            
            // Si on était en train de panner, arrêter le pan et recentrer l'image
            if (isZoomed && isPanning) {
                isPanning = false;
                // Recentrer l'image avec une animation fluide
                carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
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
                    
                    // Réinitialiser l'état de slide
                    isSliding = false;
                    slideCurrentX = 0;
                    slideVelocity = 0;
                    
                    if (!isZoomed) {
                        // Zoom avec animation fluide
                        carouselImage.style.willChange = 'transform';
                        carouselImage.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        carouselImage.style.transform = 'scale(2) translateX(0)';
                        carouselImage.style.cursor = 'zoom-out';
                        carouselImage.style.transformOrigin = 'center center';
                        currentX = 0;
                        currentY = 0;
                        isZoomed = true;
                        isPanning = false;
                        
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                            carouselImage.style.willChange = 'auto';
                        }, 350);
                    } else {
                        // Dézoom avec animation fluide
                        carouselImage.style.willChange = 'transform';
                        carouselImage.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        carouselImage.style.transform = 'scale(1) translateX(0)';
                        carouselImage.style.cursor = 'pointer';
                        carouselImage.style.transformOrigin = 'center center';
                        currentX = 0;
                        currentY = 0;
                        isZoomed = false;
                        isPanning = false;
                        
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                            carouselImage.style.willChange = 'auto';
                        }, 350);
                    }
                }
                
                lastTap = currentTime;
            }
        });
        
        if (prevButton) {
            prevButton.onclick = () => {
                preloadState.lastDirection = 'prev';
                showImage(currentIndex - 1);
            };
        }
        
        if (nextButton) {
            nextButton.onclick = () => {
                preloadState.lastDirection = 'next';
                showImage(currentIndex + 1);
            };
        }
        
        const handleKeyboard = (e) => {
            if (e.key === 'ArrowLeft') {
                preloadState.lastDirection = 'prev';
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight') {
                preloadState.lastDirection = 'next';
                showImage(currentIndex + 1);
            } else if (e.key === 'Escape') {
                closeCarousel();
            }
        };
        
        const closeCarousel = () => {
            // Nettoyer le cache et annuler les préchargements en cours
            if (preloadState.timeout) {
                clearTimeout(preloadState.timeout);
                preloadState.timeout = null;
            }
            preloadState.inProgress = false;
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyboard);
            // Nettoyer l'event listener de resize
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
        };
        
        const closeButton = document.getElementById('album-modal-close');
        if (closeButton) {
            closeButton.onclick = closeCarousel;
        }
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
