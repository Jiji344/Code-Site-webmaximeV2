// Chargement et affichage du contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2',
            path: 'content/portfolio'
        };
        this.init();
    }

    async init() {
        await this.loadPortfolioData();
        this.displayPortfolioImages();
    }

    async loadPortfolioData() {
        try {
            const portfolioFiles = await this.getPortfolioFiles();
            
            for (const file of portfolioFiles) {
                const { owner, repo, path } = this.config;
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
                    console.warn(`Impossible de charger ${file}`);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données CMS:', error);
        }
    }

    async getPortfolioFiles() {
        try {
            const { owner, repo, path } = this.config;
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
            );
            
            if (response.ok) {
                const files = await response.json();
                return files
                    .filter(file => file.name.endsWith('.md'))
                    .map(file => file.name);
            }
            return [];
        } catch (error) {
            console.error('Erreur lors du chargement de la liste des fichiers:', error);
            return [];
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
                    const value = line.substring(colonIndex + 1).trim();
                    data[key] = value;
                }
            });
            
            return data;
        }
        
        return null;
    }

    displayPortfolioImages() {
        const dataByCategory = this.groupByCategory(this.portfolioData);
        Object.keys(dataByCategory).forEach(category => {
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

    updateCategoryContent(category, data) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) return;

        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) return;

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
    }

    createAlbumCard(albumName, images) {
        const albumCard = document.createElement('div');
        albumCard.className = 'album-card';
        
        const coverImage = document.createElement('img');
        coverImage.className = 'album-card-image';
        coverImage.src = images[0].image;
        coverImage.alt = albumName;
        coverImage.loading = 'lazy';
        
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
        
        albumCard.addEventListener('click', () => {
            this.openAlbumCarousel(albumName, images);
        });
        
        return albumCard;
    }

    createImageCard(item) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        
        const imgElement = document.createElement('img');
        imgElement.src = item.image;
        imgElement.alt = item.title || item.description || '';
        imgElement.loading = 'lazy';
        imgElement.width = 400;
        imgElement.height = 600;
        
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
        
        expandButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const modalClose = document.getElementById('modal-close');
            
            if (modal && modalImg) {
                modalImg.src = item.image;
                modalImg.alt = item.title || item.description || '';
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
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
        
        // Fonctionnalité plein écran sur mobile avec zoom
        const isMobile = window.innerWidth <= 768;
        if (isMobile && carouselImage) {
            let isFullscreen = false;
            let startDistance = 0;
            let startScale = 1;
            let currentScale = 1;
            let startX = 0;
            let startY = 0;
            let currentX = 0;
            let currentY = 0;
            let isDragging = false;
            
            // Entrer en plein écran
            carouselImage.addEventListener('click', () => {
                if (!isFullscreen) {
                    if (carouselImage.requestFullscreen) {
                        carouselImage.requestFullscreen();
                    } else if (carouselImage.webkitRequestFullscreen) {
                        carouselImage.webkitRequestFullscreen();
                    } else if (carouselImage.msRequestFullscreen) {
                        carouselImage.msRequestFullscreen();
                    }
                }
            });
            
            // Détecter l'entrée/sortie du plein écran
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.addEventListener('msfullscreenchange', handleFullscreenChange);
            
            function handleFullscreenChange() {
                isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
                
                if (isFullscreen) {
                    // Ajouter les styles de zoom
                    carouselImage.style.transform = 'scale(1)';
                    carouselImage.style.transformOrigin = 'center center';
                    carouselImage.style.transition = 'transform 0.3s ease';
                } else {
                    // Réinitialiser
                    carouselImage.style.transform = '';
                    carouselImage.style.transformOrigin = '';
                    carouselImage.style.transition = '';
                    currentScale = 1;
                    currentX = 0;
                    currentY = 0;
                }
            }
            
            // Gestion du zoom et pan
            if (isFullscreen) {
                // Zoom avec pincement
                carouselImage.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        startDistance = Math.hypot(
                            e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY
                        );
                        startScale = currentScale;
                    } else if (e.touches.length === 1) {
                        isDragging = true;
                        startX = e.touches[0].clientX - currentX;
                        startY = e.touches[0].clientY - currentY;
                    }
                });
                
                carouselImage.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    
                    if (e.touches.length === 2) {
                        // Zoom
                        const currentDistance = Math.hypot(
                            e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY
                        );
                        const scale = Math.max(1, Math.min(3, (currentDistance / startDistance) * startScale));
                        currentScale = scale;
                        carouselImage.style.transform = `scale(${scale}) translate(${currentX}px, ${currentY}px)`;
                    } else if (e.touches.length === 1 && isDragging) {
                        // Pan
                        currentX = e.touches[0].clientX - startX;
                        currentY = e.touches[0].clientY - startY;
                        carouselImage.style.transform = `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`;
                    }
                });
                
                carouselImage.addEventListener('touchend', () => {
                    isDragging = false;
                });
                
                // Double tap pour reset
                carouselImage.addEventListener('touchend', (e) => {
                    if (e.changedTouches.length === 1) {
                        const touch = e.changedTouches[0];
                        const now = Date.now();
                        if (now - (carouselImage.lastTouchEnd || 0) < 300) {
                            // Double tap - reset zoom
                            currentScale = 1;
                            currentX = 0;
                            currentY = 0;
                            carouselImage.style.transform = 'scale(1) translate(0px, 0px)';
                        }
                        carouselImage.lastTouchEnd = now;
                    }
                });
            }
        }
        
        if (!modal) return;
        
        let currentIndex = 0;
        
        const showImage = (index) => {
            currentIndex = index;
            const image = images[index];
            
            carouselImage.style.animation = 'none';
            void carouselImage.offsetWidth;
            carouselImage.style.animation = 'carouselImageZoom 0.4s ease-out';
            
            carouselImage.src = image.image;
            carouselImage.alt = image.title || image.description || '';
            albumCurrentTitle.textContent = image.title || 'Sans titre';
            albumCounter.textContent = `${index + 1} / ${images.length}`;
            
            const imageContainer = document.querySelector('.carousel-image-container');
            if (imageContainer) {
                imageContainer.setAttribute('data-title', image.title || 'Sans titre');
            }
            
            prevButton.disabled = index === 0;
            nextButton.disabled = index === images.length - 1;
            
            document.querySelectorAll('.carousel-thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        };
        
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'carousel-thumbnail';
            thumbnail.src = image.image;
            thumbnail.alt = image.title || '';
            thumbnail.addEventListener('click', () => showImage(index));
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        albumTitle.textContent = albumName;
        showImage(0);
        
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
