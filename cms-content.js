// Chargement et affichage du contenu du CMS
class CMSContentLoader {
    constructor() {
        this.portfolioData = [];
        this.config = {
            owner: 'Jiji344',
            repo: 'Code-Site-webmaximeV2',
            basePath: 'content/portfolio',
            // Liste des catégories à scanner
            categories: ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle']
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
                    const categoryPath = `${this.config.basePath}/${category}`;
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
            
            const response = await fetch(indexUrl);
            if (response.ok) {
                const photos = await response.json();
                this.portfolioData = photos;
                console.log('📦 Index chargé depuis portfolio-index.json');
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
        imageCard.style.cursor = 'pointer';
        
        const imgElement = document.createElement('img');
        imgElement.src = item.image;
        imgElement.alt = item.title || item.description || '';
        imgElement.loading = 'lazy';
        imgElement.width = 400;
        imgElement.height = 600;
        
        // Clic simple pour ouvrir la modal
        imageCard.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            const modalClose = document.getElementById('modal-close');
            
            if (modal && modalImg) {
                modalImg.src = item.image;
                modalImg.alt = item.title || item.description || '';
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
        
        let currentIndex = 0;
        let isZoomed = false;
        let lastTap = 0;
        
        const showImage = (index) => {
            currentIndex = index;
            const image = images[index];
            
            // Réinitialiser le zoom lors du changement d'image
            carouselImage.style.transform = 'scale(1)';
            carouselImage.style.cursor = 'pointer';
            isZoomed = false;
            
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
        
        // Gestion du zoom au double tap sur mobile
        carouselImage.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Détection du double tap (moins de 300ms entre deux taps)
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                
                if (!isZoomed) {
                    // Zoom
                    carouselImage.style.transform = 'scale(2)';
                    carouselImage.style.cursor = 'zoom-out';
                    isZoomed = true;
                } else {
                    // Dézoom
                    carouselImage.style.transform = 'scale(1)';
                    carouselImage.style.cursor = 'pointer';
                    isZoomed = false;
                }
            }
            
            lastTap = currentTime;
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
