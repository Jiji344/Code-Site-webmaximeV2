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
            // Charger les données du portfolio depuis le dossier content/portfolio
            const response = await fetch('/content/portfolio/');
            if (!response.ok) {
                console.log('Dossier content/portfolio non trouvé, utilisation des données statiques');
                return;
            }

            // Pour l'instant, on va utiliser des données statiques
            // Plus tard, on pourra charger dynamiquement depuis les fichiers YAML
            this.portfolioData = [
                // Exemple de données - à remplacer par le chargement dynamique
            ];
        } catch (error) {
            console.log('Erreur lors du chargement des données CMS:', error);
        }
    }

    displayPortfolioImages() {
        // Cette fonction sera appelée pour mettre à jour l'affichage
        // Pour l'instant, on va juste préparer la structure
        console.log('Affichage des images du portfolio...');
    }

    // Méthode pour ajouter une nouvelle image au portfolio
    addPortfolioImage(imageData) {
        this.portfolioData.push(imageData);
        this.displayPortfolioImages();
    }
}

// Initialiser le loader CMS
document.addEventListener('DOMContentLoaded', () => {
    window.cmsLoader = new CMSContentLoader();
});
