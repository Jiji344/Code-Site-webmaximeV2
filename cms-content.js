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
            const portfolioFiles = await this.getPortfolioFiles();
            
            for (const file of portfolioFiles) {
                const response = await fetch(`/content/portfolio/${file}`);
                if (response.ok) {
                    const content = await response.text();
                    const data = this.parseMarkdownFrontmatter(content);
                    if (data) {
                        this.portfolioData.push(data);
                    }
                }
            }
            
            console.log('Données portfolio chargées:', this.portfolioData);
        } catch (error) {
            console.log('Erreur lors du chargement des données CMS:', error);
        }
    }

    async getPortfolioFiles() {
        try {
            // Essayer de lister les fichiers du dossier portfolio
            const response = await fetch('/content/portfolio/');
            if (response.ok) {
                const html = await response.text();
                // Parser le HTML pour extraire les liens vers les fichiers .md
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = doc.querySelectorAll('a[href$=".md"]');
                return Array.from(links).map(link => link.href.split('/').pop());
            }
        } catch (error) {
            console.log('Impossible de lister les fichiers, utilisation des fichiers connus');
        }
        
        // Fallback : utiliser les fichiers connus
        return ['test.md'];
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
        
        // Ajouter un bouton de rechargement manuel
        this.addRefreshButton();
    }
    
    addRefreshButton() {
        // Vérifier si le bouton existe déjà
        if (document.getElementById('cms-refresh-btn')) return;
        
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'cms-refresh-btn';
        refreshBtn.innerHTML = '🔄 Recharger le contenu';
        refreshBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: #4A90E2;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        refreshBtn.addEventListener('click', async () => {
            console.log('Rechargement manuel du contenu CMS...');
            await this.loadPortfolioData();
            this.displayPortfolioImages();
        });
        
        document.body.appendChild(refreshBtn);
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
    
    // Recharger le contenu toutes les 30 secondes pour détecter les nouvelles images
    setInterval(async () => {
        if (window.cmsLoader) {
            console.log('Rechargement automatique du contenu CMS...');
            await window.cmsLoader.loadPortfolioData();
            window.cmsLoader.displayPortfolioImages();
        }
    }, 30000); // 30 secondes
});
