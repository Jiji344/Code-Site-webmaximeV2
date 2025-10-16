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
            if (item.category && item.image) {
                if (!dataByCategory[item.category]) {
                    dataByCategory[item.category] = {
                        albums: {},
                        singleImages: []
                    };
                }
                
                // Si l'image a un album, la grouper par album
                if (item.album) {
                    if (!dataByCategory[item.category].albums[item.album]) {
                        dataByCategory[item.category].albums[item.album] = [];
                    }
                    dataByCategory[item.category].albums[item.album].push(item);
                } else {
                    // Sinon, l'ajouter aux images individuelles
                    dataByCategory[item.category].singleImages.push(item);
                }
            }
        });

        // Afficher les données dans chaque section
        Object.keys(dataByCategory).forEach(category => {
            this.updateCategoryContent(category, dataByCategory[category]);
        });
    }

    updateCategoryContent(category, data) {
        // Trouver la section correspondante
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (!categorySection) {
            console.log(`Section ${category} non trouvée`);
            return;
        }

        // Trouver le conteneur d'images
        const imagesContainer = categorySection.querySelector('.category-images');
        if (!imagesContainer) {
            console.log(`Conteneur d'images pour ${category} non trouvé`);
            return;
        }

        // Ajouter d'abord les cartes d'albums
        Object.keys(data.albums).forEach(albumName => {
            const albumImages = data.albums[albumName];
            const albumCard = this.createAlbumCard(albumName, albumImages);
            imagesContainer.appendChild(albumCard);
        });

        // Puis ajouter les images individuelles
        data.singleImages.forEach((item) => {
            const imageCard = this.createImageCard(item);
            imagesContainer.appendChild(imageCard);
        });
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
        const albumCounter = document.getElementById('album-counter');
        const carouselImage = document.getElementById('carousel-image');
        const carouselImageTitle = document.getElementById('carousel-image-title');
        const carouselImageDescription = document.getElementById('carousel-image-description');
        const thumbnailsContainer = document.getElementById('carousel-thumbnails');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');
        
        if (!modal) return;
        
        // État du carousel
        let currentIndex = 0;
        
        // Fonction pour afficher une image
        const showImage = (index) => {
            currentIndex = index;
            const image = images[index];
            
            carouselImage.src = image.image;
            carouselImage.alt = image.title || image.description || '';
            carouselImageTitle.textContent = image.title || '';
            carouselImageDescription.textContent = image.description || '';
            albumCounter.textContent = `${index + 1} / ${images.length}`;
            
            // Mettre à jour les boutons
            prevButton.disabled = index === 0;
            nextButton.disabled = index === images.length - 1;
            
            // Mettre à jour les miniatures actives
            document.querySelectorAll('.carousel-thumbnail').forEach((thumb, i) => {
                thumb.classList.toggle('active', i === index);
            });
        };
        
        // Générer les miniatures
        thumbnailsContainer.innerHTML = '';
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'carousel-thumbnail';
            thumbnail.src = image.image;
            thumbnail.alt = image.title || '';
            thumbnail.addEventListener('click', () => showImage(index));
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // Configuration du carousel
        albumTitle.textContent = albumName;
        showImage(0);
        
        // Navigation
        prevButton.onclick = () => {
            if (currentIndex > 0) showImage(currentIndex - 1);
        };
        
        nextButton.onclick = () => {
            if (currentIndex < images.length - 1) showImage(currentIndex + 1);
        };
        
        // Navigation au clavier
        const handleKeyboard = (e) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                showImage(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                showImage(currentIndex + 1);
            } else if (e.key === 'Escape') {
                closeCarousel();
            }
        };
        
        // Fermer le carousel
        const closeCarousel = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyboard);
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
