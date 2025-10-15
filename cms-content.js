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
            let currentKey = null;
            let currentList = null;
            let currentObject = null;
            
            // Parser le frontmatter YAML avec support des listes
            frontmatter.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                
                // Détecter un nouveau champ de liste
                if (trimmedLine.endsWith(':') && !trimmedLine.startsWith('-')) {
                    currentKey = trimmedLine.slice(0, -1).trim();
                    currentList = null;
                    currentObject = null;
                } 
                // Détecter un item de liste
                else if (trimmedLine.startsWith('- ')) {
                    if (currentKey === 'photos') {
                        if (!data.photos) data.photos = [];
                        currentObject = {};
                        data.photos.push(currentObject);
                        
                        // Parser l'item si c'est un objet simple
                        const itemContent = trimmedLine.substring(2);
                        if (itemContent.includes(':')) {
                            const [key, value] = itemContent.split(':', 2);
                            currentObject[key.trim()] = value.trim();
                        }
                    }
                }
                // Détecter une propriété d'objet dans une liste
                else if (trimmedLine.includes(':') && currentObject) {
                    const colonIndex = trimmedLine.indexOf(':');
                    const key = trimmedLine.substring(0, colonIndex).trim();
                    const value = trimmedLine.substring(colonIndex + 1).trim();
                    currentObject[key] = value;
                }
                // Détecter un champ simple
                else if (trimmedLine.includes(':') && !currentList) {
                    const colonIndex = trimmedLine.indexOf(':');
                    const key = trimmedLine.substring(0, colonIndex).trim();
                    const value = trimmedLine.substring(colonIndex + 1).trim();
                    data[key] = value;
                }
            });
            
            return data;
        }
        
        return null;
    }

    displayPortfolioImages() {
        console.log('Affichage des images du portfolio...', this.portfolioData);
        
        // Grouper les images par catégorie
        const imagesByCategory = {};
        this.portfolioData.forEach(item => {
            if (item.category) {
                if (!imagesByCategory[item.category]) {
                    imagesByCategory[item.category] = [];
                }
                
                // Gérer le nouveau format avec liste de photos
                if (item.photos) {
                    // Nouveau format : liste de photos
                    item.photos.forEach(photo => {
                        if (photo.image) {
                            imagesByCategory[item.category].push({
                                image: photo.image,
                                title: photo.title || item.title || '',
                                description: photo.description || item.description || ''
                            });
                        }
                    });
                } else if (item.image) {
                    // Ancien format : une seule photo
                    imagesByCategory[item.category].push(item);
                }
            }
        });

        // Remplacer les images dans chaque section
        Object.keys(imagesByCategory).forEach(category => {
            this.updateCategoryImages(category, imagesByCategory[category]);
        });
    }

    updateCategoryImages(category, images) {
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

        // Ajouter les images du CMS (ne pas supprimer les images existantes)
        images.forEach((item, index) => {
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
            overlay.innerHTML = `
                <button class="image-expand" aria-label="Agrandir l'image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                </button>
            `;
            
            // Ajouter l'événement de clic pour la modal
            overlay.querySelector('.image-expand').addEventListener('click', () => {
                const modal = document.getElementById('modal');
                const modalImage = document.getElementById('modal-image');
                modal.classList.add('show-modal');
                modalImage.src = item.image;
                modalImage.alt = item.title || item.description || '';
            });
            
            imageCard.appendChild(imgElement);
            imageCard.appendChild(overlay);
            imagesContainer.appendChild(imageCard);
        });
    }

    openImageModal(imageSrc, title) {
        // Créer la modal pour l'image
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="${imageSrc}" alt="${title}" class="modal-image">
                <div class="modal-caption">${title}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Événements pour fermer la modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}

// Initialiser le loader CMS
document.addEventListener('DOMContentLoaded', () => {
    window.cmsLoader = new CMSContentLoader();
});
