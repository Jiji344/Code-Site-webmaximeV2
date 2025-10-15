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
        
        // Grouper les images par catégorie
        const imagesByCategory = {};
        this.portfolioData.forEach(item => {
            if (item.category && item.image) {
                if (!imagesByCategory[item.category]) {
                    imagesByCategory[item.category] = [];
                }
                imagesByCategory[item.category].push(item);
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

        // Remplacer les images
        imagesContainer.innerHTML = '';
        images.forEach((item, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = item.image;
            imgElement.alt = item.title || item.description || '';
            imgElement.loading = 'lazy';
            imgElement.className = 'portfolio-image';
            
            // Ajouter l'événement de clic pour la modal
            imgElement.addEventListener('click', () => {
                this.openImageModal(item.image, item.title || '');
            });
            
            imagesContainer.appendChild(imgElement);
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
