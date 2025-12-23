// Chargement et affichage du contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2',
            basePath: 'content/portfolio',
            categories: ['Portrait', 'Mariage', 'Immobilier', 'Événementiel', 'Voyage', 'Animalier']
        };
        this.init();
    }

    // ==========================================
    // INITIALISATION
    // ==========================================

    async init() {
        await this.loadPortfolioData();
        this.displayPortfolioImages();
        window.dispatchEvent(new CustomEvent('portfolio-images-preloaded'));
    }

    // ==========================================
    // CHARGEMENT DES DONNÉES
    // ==========================================

    async loadPortfolioData() {
        try {
            const indexLoaded = await this.loadFromIndex();
            
            if (!indexLoaded) {
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
                        await this.loadMarkdownFile(item.path);
                    } else if (item.type === 'dir') {
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
        
        if (!match) return null;
        
        const frontmatter = match[1];
        const data = {};
        
        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                if (value === 'true' || value === 'True') {
                    value = true;
                } else if (value === 'false' || value === 'False') {
                    value = false;
                }
                
                data[key] = value;
            }
        });
        
        return data;
    }

    // ==========================================
    // AFFICHAGE DU PORTFOLIO
    // ==========================================

    displayPortfolioImages() {
        if (this.portfolioData.length === 0) {
            console.error('❌ AUCUNE PHOTO À AFFICHER !');
            return;
        }
        
        const dataByCategory = this.groupByCategory(this.portfolioData);
        Object.keys(dataByCategory).forEach(category => {
            this.updateCategoryContent(category, dataByCategory[category]);
        });
    }

    groupByCategory(data) {
        const grouped = {};
        
        data.forEach(item => {
            if (!item.category || !item.image) return;
            
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

        return grouped;
    }

    async updateCategoryContent(category, data) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) return;

        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) return;

        requestAnimationFrame(() => {
            const navElements = imagesContainer.querySelectorAll('.category-nav-prev, .category-nav-next');
            imagesContainer.innerHTML = '';
            navElements.forEach(nav => imagesContainer.appendChild(nav));
            
            Object.keys(data.albums).forEach(albumName => {
                const albumCard = this.createAlbumCard(albumName, data.albums[albumName]);
                if (albumCard) imagesContainer.appendChild(albumCard);
            });

            data.singleImages.forEach(item => {
                imagesContainer.appendChild(this.createImageCard(item));
            });

            if (window.portfolioCarousel) {
                window.portfolioCarousel.updateCarousel(category);
            }
        });
    }

    // ==========================================
    // CRÉATION DES CARTES
    // ==========================================

    createAlbumCard(albumName, images) {
        if (images.length === 0) return null;
        
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        
        const coverImage = document.createElement('img');
        coverImage.className = 'album-card-image';
        
        const coverImageData = images.find(img => {
            const cover = img.isCover;
            return cover === true || cover === 'true' || cover === 'True' || cover === 1 || cover === '1';
        }) || images[0];
        
        coverImage.src = coverImageData.image;
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
            if (images && images.length > 0) {
                this.openAlbumCarousel(albumName, images);
            }
        });
        
        return albumCard;
    }

    createImageCard(item) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.style.cursor = 'pointer';
        
        const imgElement = document.createElement('img');
        imgElement.src = item.image;
        imgElement.alt = item.title || item.description || '';
        imgElement.fetchPriority = 'high';
        imgElement.decoding = 'async';
        imgElement.width = 400;
        imgElement.height = 600;
        
        imageCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const modalClose = document.getElementById('modal-close');
            
            if (modal && modalImg) {
                modalImg.src = item.image;
                modalImg.alt = item.title || item.description || '';
                modalImg.fetchPriority = 'high';
                modalImg.decoding = 'async';
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
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

    // ==========================================
    // CAROUSEL D'ALBUM
    // ==========================================

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
        
        // État du carousel
        let currentIndex = 0;
        let isZoomed = false;
        let lastTap = 0;
        let resizeHandler = null;
        let isPanning = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let isSliding = false;
        let slideStartX = 0;
        let slideStartY = 0;
        let slideCurrentX = 0;
        let slideThreshold = 50;
        let slideVelocity = 0;
        let lastSlideX = 0;
        let lastSlideTime = 0;
        let animationFrame = null;
        
        // Cache et préchargement
        const imageCache = new Map();
        const preloadState = {
            timeout: null,
            inProgress: false,
            lastDirection: null,
            currentImageLoadProgress: 0
        };
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isFastConnection = connection && (connection.effectiveType === '4g');
        
        // Fonction principale d'affichage d'image
        const showImage = (index) => {
            if (index < 0) index = images.length - 1;
            else if (index >= images.length) index = 0;
            
            currentIndex = index;
            const image = images[index];
            
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            // Réinitialiser l'état
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
            
            // Charger l'image
            const cacheKey = `${index}_1920`;
            if (imageCache.has(cacheKey)) {
                const cached = imageCache.get(cacheKey);
                if (cached.loaded && cached.img) {
                    carouselImage.src = cached.img.src;
                } else {
                    carouselImage.src = image.image;
                }
            } else {
                carouselImage.src = image.image;
            }
            
            carouselImage.alt = albumName;
            carouselImage.fetchPriority = 'high';
            carouselImage.decoding = 'async';
            
            carouselImage.onload = () => {
                preloadState.currentImageLoadProgress = 100;
                this.upgradeAdjacentToFullscreen(images, index, imageCache);
            };
            
            carouselImage.onprogress = (e) => {
                if (e.lengthComputable) {
                    preloadState.currentImageLoadProgress = (e.loaded / e.total) * 100;
                    if (preloadState.currentImageLoadProgress >= 80) {
                        this.preloadNextInFullscreen(images, index, imageCache, preloadState);
                    }
                }
            };
            
            // Animation
            carouselImage.style.animation = 'none';
            requestAnimationFrame(() => {
                carouselImage.style.animation = 'carouselImageZoom 0.12s ease-out';
            });
            
            // Mettre à jour le compteur
            albumCounter.textContent = `${currentIndex + 1} / ${images.length}`;
            
            // Mettre à jour le titre
            const imageContainer = document.querySelector('.carousel-image-container');
            if (imageContainer) {
                imageContainer.setAttribute('data-title', albumName);
            }
            
            // Mettre à jour les vignettes actives
            document.querySelectorAll('.carousel-thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
            
            // Centrer la vignette active
            requestAnimationFrame(() => {
                this.scrollThumbnailToCenter(thumbnailsContainer, currentIndex);
            });
            
            // Précharger les images
            this.scheduleProgressivePreload(images, index, imageCache, preloadState, isSlowConnection, isFastConnection);
        };
        
        // Créer les vignettes
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'carousel-thumbnail';
            thumbnail.setAttribute('data-index', index);
            
            if (index <= 5) {
                thumbnail.src = image.image;
                thumbnail.fetchPriority = 'high';
            } else {
                thumbnail.loading = 'lazy';
                thumbnail.fetchPriority = 'low';
                thumbnail.setAttribute('data-src', image.image);
                
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
            
            thumbnail.addEventListener('mouseenter', () => {
                if (!isSlowConnection) {
                    const cacheKey = `${index}_1920`;
                    if (!imageCache.has(cacheKey)) {
                        const img = new Image();
                        img.fetchPriority = 'high';
                        img.decoding = 'async';
                        img.onload = () => {
                            imageCache.set(cacheKey, { loaded: true, img: img });
                        };
                        img.src = image.image;
                    }
                }
            });
            
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // Configuration du conteneur de vignettes
        thumbnailsContainer.style.overflowX = 'auto';
        thumbnailsContainer.style.justifyContent = 'flex-start';
        thumbnailsContainer.lastScrollLeft = thumbnailsContainer.scrollLeft;
        
        // Centrer la première vignette
        setTimeout(() => {
            this.scrollThumbnailToCenter(thumbnailsContainer, 0);
            
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
        
        // Gestion du pan (déplacement) sur l'image zoomée
        const constrainPan = (x, y, img) => {
            const rect = img.getBoundingClientRect();
            const containerRect = img.parentElement.getBoundingClientRect();
            const scale = 2;
            
            const scaledWidth = rect.width * scale;
            const scaledHeight = rect.height * scale;
            
            const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
            const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
            
            return {
                x: Math.max(-maxX, Math.min(maxX, x)),
                y: Math.max(-maxY, Math.min(maxY, y))
            };
        };

        // Gestion des événements tactiles
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        
        carouselImage.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            if (isZoomed) {
                if (e.touches.length === 1) {
                    isPanning = true;
                    startX = e.touches[0].clientX - currentX;
                    startY = e.touches[0].clientY - currentY;
                }
            } else {
                isSliding = false;
                slideStartX = e.touches[0].clientX;
                slideStartY = e.touches[0].clientY;
                slideCurrentX = 0;
                slideVelocity = 0;
                lastSlideX = slideStartX;
                lastSlideTime = Date.now();
                carouselImage.style.willChange = 'transform';
            }
        }, { passive: true });

        carouselImage.addEventListener('touchmove', (e) => {
            if (isZoomed && isPanning) {
                if (e.touches.length === 1) {
                    e.preventDefault();
                    
                    const touchX = e.touches[0].clientX;
                    const touchY = e.touches[0].clientY;
                    
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }
                    
                    animationFrame = requestAnimationFrame(() => {
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
                const currentTime = Date.now();
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = touchX - slideStartX;
                const deltaY = Math.abs(touchY - slideStartY);
                
                if (currentTime - lastSlideTime > 0) {
                    slideVelocity = (touchX - lastSlideX) / (currentTime - lastSlideTime);
                }
                lastSlideX = touchX;
                lastSlideTime = currentTime;
                
                if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
                    if (!isSliding) {
                        isSliding = true;
                        carouselImage.style.transition = 'none';
                    }
                    e.preventDefault();
                    
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }
                    
                    animationFrame = requestAnimationFrame(() => {
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

        carouselImage.addEventListener('touchend', (e) => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const moveDistance = Math.sqrt(
                Math.pow(touchEndX - touchStartX, 2) + 
                Math.pow(touchEndY - touchStartY, 2)
            );
            
            // Gérer le slide
            if (isSliding && !isZoomed) {
                isSliding = false;
                carouselImage.style.willChange = 'auto';
                
                const deltaX = touchEndX - slideStartX;
                const deltaY = Math.abs(touchEndY - slideStartY);
                const velocityThreshold = 0.3;
                const hasVelocity = Math.abs(slideVelocity) > velocityThreshold;
                
                if ((Math.abs(deltaX) > slideThreshold && Math.abs(deltaX) > deltaY) || 
                    (hasVelocity && Math.abs(deltaX) > 20)) {
                    if (deltaX > 0) {
                        preloadState.lastDirection = 'prev';
                        carouselImage.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                        showImage(currentIndex - 1);
                    } else if (deltaX < 0) {
                        preloadState.lastDirection = 'next';
                        carouselImage.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                        showImage(currentIndex + 1);
                    } else {
                        carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        carouselImage.style.transform = 'scale(1) translateX(0)';
                        setTimeout(() => {
                            carouselImage.style.transition = '';
                        }, 300);
                    }
                } else {
                    carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    carouselImage.style.transform = 'scale(1) translateX(0)';
                    setTimeout(() => {
                        carouselImage.style.transition = '';
                    }, 300);
                }
                return;
            }
            
            // Gérer le pan
            if (isZoomed && isPanning) {
                isPanning = false;
                carouselImage.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                currentX = 0;
                currentY = 0;
                carouselImage.style.transform = 'scale(2) translate(0px, 0px)';
                carouselImage.style.transformOrigin = 'center center';
                
                setTimeout(() => {
                    carouselImage.style.transition = '';
                }, 300);
                
                if (moveDistance > 10) {
                    return;
                }
            }
            
            // Gérer le double tap (zoom)
            if (moveDistance < 10 && touchDuration < 300) {
                const currentTime = Date.now();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    
                    isSliding = false;
                    slideCurrentX = 0;
                    slideVelocity = 0;
                    
                    if (!isZoomed) {
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
        
        // Boutons de navigation
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
        
        // Gestion du clavier
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
        
        // Fermeture du carousel
        const closeCarousel = () => {
            if (preloadState.timeout) {
                clearTimeout(preloadState.timeout);
                preloadState.timeout = null;
            }
            preloadState.inProgress = false;
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyboard);
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

    // ==========================================
    // CENTRAGE DES VIGNETTES
    // ==========================================

    scrollThumbnailToCenter(thumbnailsContainer, activeIndex) {
        if (!thumbnailsContainer || activeIndex < 0) return;
        
        const thumbnails = thumbnailsContainer.children;
        if (!thumbnails || activeIndex >= thumbnails.length) return;
        
        const thumbnail = thumbnails[activeIndex];
        if (!thumbnail) return;
        
        // Annuler le centrage précédent si en cours
        if (thumbnailsContainer._centeringTimeout) {
            clearTimeout(thumbnailsContainer._centeringTimeout);
        }
        if (thumbnailsContainer._centeringAnimationFrame) {
            cancelAnimationFrame(thumbnailsContainer._centeringAnimationFrame);
        }
        
        thumbnailsContainer.isCentering = true;
        
        const centerThumbnail = () => {
            if (!thumbnailsContainer.contains(thumbnail)) {
                thumbnailsContainer.isCentering = false;
                return;
            }
            
            const containerWidth = thumbnailsContainer.clientWidth;
            const thumbnailWidth = thumbnail.offsetWidth;
            const thumbnailRect = thumbnail.getBoundingClientRect();
            const containerRect = thumbnailsContainer.getBoundingClientRect();
            
            if (containerWidth === 0 || thumbnailWidth === 0) {
                thumbnailsContainer._centeringAnimationFrame = requestAnimationFrame(centerThumbnail);
                return;
            }
            
            // Calculer la position relative de la vignette par rapport au conteneur
            const thumbnailCenter = thumbnailRect.left - containerRect.left + (thumbnailWidth / 2);
            const containerCenter = containerWidth / 2;
            const scrollDelta = thumbnailCenter - containerCenter;
            const currentScroll = thumbnailsContainer.scrollLeft;
            const finalScrollLeft = currentScroll + scrollDelta;
            const maxScroll = Math.max(0, thumbnailsContainer.scrollWidth - containerWidth);
            const clampedScrollLeft = Math.max(0, Math.min(finalScrollLeft, maxScroll));
            
            // Appliquer le scroll avec animation
            thumbnailsContainer.scrollTo({
                left: clampedScrollLeft,
                behavior: 'smooth'
            });
            
            thumbnailsContainer.lastScrollLeft = clampedScrollLeft;
            
            thumbnailsContainer._centeringTimeout = setTimeout(() => {
                thumbnailsContainer.isCentering = false;
                thumbnailsContainer.lastScrollLeft = thumbnailsContainer.scrollLeft;
            }, 600);
        };
        
        // Attendre que le DOM soit prêt
        thumbnailsContainer._centeringAnimationFrame = requestAnimationFrame(() => {
            thumbnailsContainer._centeringAnimationFrame = requestAnimationFrame(centerThumbnail);
        });
    }

    // ==========================================
    // PRÉCHARGEMENT DES IMAGES
    // ==========================================

    scheduleProgressivePreload(images, currentIndex, imageCache, preloadState, isSlowConnection, isFastConnection) {
        if (preloadState.timeout) {
            clearTimeout(preloadState.timeout);
            preloadState.timeout = null;
        }

        const preloadImage = (imageIndex, size) => {
            if (imageIndex < 0 || imageIndex >= images.length) return;
            
            const image = images[imageIndex];
            if (!image || !image.image) return;
            
            const cacheKey = `${imageIndex}_${size}`;
            if (imageCache.has(cacheKey)) {
                const cached = imageCache.get(cacheKey);
                if (cached.loaded) return;
            }
            
            imageCache.set(cacheKey, { loading: true });
            
            const img = new Image();
            img.fetchPriority = 'low';
            img.decoding = 'async';
            img.onload = () => {
                imageCache.set(cacheKey, { loaded: true, img: img });
            };
            img.onerror = () => {
                imageCache.delete(cacheKey);
            };
            img.src = image.image;
        };

        const preloadAdjacent = () => {
            if (currentIndex > 0) preloadImage(currentIndex - 1, 1200);
            if (currentIndex < images.length - 1) preloadImage(currentIndex + 1, 1200);
        };

        const preloadNearby = () => {
            [2, 3, 4, 5].forEach(offset => {
                if (currentIndex - offset >= 0) preloadImage(currentIndex - offset, 800);
                if (currentIndex + offset < images.length) preloadImage(currentIndex + offset, 800);
            });
        };

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
            
            distantIndices.sort((a, b) => a.distance - b.distance);
            
            const batchSize = 3;
            let batchIndex = 0;
            
            const processBatch = () => {
                const batch = distantIndices.slice(batchIndex, batchIndex + batchSize);
                if (batch.length === 0) {
                    preloadState.inProgress = false;
                    return;
                }
                
                batch.forEach(({ index }) => preloadImage(index, 800));
                batchIndex += batchSize;
                
                const scheduleNext = window.requestIdleCallback 
                    ? () => window.requestIdleCallback(processBatch, { timeout: 1000 })
                    : () => setTimeout(processBatch, 200);
                scheduleNext();
            };
            
            if (window.requestIdleCallback) {
                window.requestIdleCallback(processBatch, { timeout: 1000 });
            } else {
                setTimeout(processBatch, 200);
            }
        };

        preloadAdjacent();
        
        if (!isSlowConnection) {
            preloadState.timeout = setTimeout(() => {
                preloadNearby();
                if (isFastConnection) {
                    preloadState.timeout = setTimeout(preloadDistant, 300);
                }
            }, 100);
        }
    }
    
    upgradeAdjacentToFullscreen(images, currentIndex, imageCache) {
        const upgradeImage = (imageIndex) => {
            if (imageIndex < 0 || imageIndex >= images.length) return;
            
            const cacheKey1200 = `${imageIndex}_1200`;
            const cacheKey1920 = `${imageIndex}_1920`;
            
            if (imageCache.has(cacheKey1200)) {
                const cached1200 = imageCache.get(cacheKey1200);
                if (cached1200.loaded && !imageCache.has(cacheKey1920)) {
                    const image = images[imageIndex];
                    if (!image || !image.image) return;
                    
                    const img = new Image();
                    img.fetchPriority = 'low';
                    img.decoding = 'async';
                    img.onload = () => {
                        imageCache.set(cacheKey1920, { loaded: true, img: img });
                    };
                    img.src = image.image;
                }
            }
        };
        
        if (currentIndex > 0) upgradeImage(currentIndex - 1);
        if (currentIndex < images.length - 1) upgradeImage(currentIndex + 1);
    }
    
    preloadNextInFullscreen(images, currentIndex, imageCache, preloadState) {
        const nextIndex = preloadState.lastDirection === 'prev' && currentIndex > 0 
            ? currentIndex - 1 
            : currentIndex < images.length - 1 
                ? currentIndex + 1 
                : null;
        
        if (nextIndex === null) return;
        
        const cacheKey = `${nextIndex}_1920`;
        if (imageCache.has(cacheKey)) {
            const cached = imageCache.get(cacheKey);
            if (cached.loaded) return;
        }
        
        const image = images[nextIndex];
        if (!image || !image.image) return;
        
        const img = new Image();
        img.fetchPriority = 'high';
        img.decoding = 'async';
        img.onload = () => {
            imageCache.set(cacheKey, { loaded: true, img: img });
        };
        img.src = image.image;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.cmsLoader = new CMSContentLoader();
});
