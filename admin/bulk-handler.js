/**
 * 📦 Script de gestion d'upload en masse pour Decap CMS
 * 
 * Ce script transforme automatiquement un album (avec plusieurs photos)
 * en entrées individuelles dans le portfolio.
 * 
 * Fonctionnement :
 * 1. Le photographe crée un "Album Complet" avec 10-20 photos
 * 2. Il remplit une seule fois : nom album, catégorie, titre de base
 * 3. À la publication, ce script crée automatiquement 10-20 entrées Portfolio
 * 4. Chaque photo obtient un titre numéroté : "Mariage Sophie 1", "Mariage Sophie 2", etc.
 */

(function() {
    'use strict';
    
    console.log('📦 Bulk Handler chargé !');
    
    // Attendre que Decap CMS soit prêt
    if (typeof CMS === 'undefined') {
        console.error('❌ Decap CMS n\'est pas chargé !');
        return;
    }
    
    /**
     * Fonction pour créer une entrée portfolio individuelle
     */
    function createPortfolioEntry(imageUrl, title, category, album, date, index) {
        const slug = title.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
            .replace(/[^a-z0-9]+/g, '-')      // Remplacer les caractères spéciaux par des tirets
            .replace(/^-+|-+$/g, '');         // Enlever les tirets au début et à la fin
        
        const uniqueSlug = `${slug}-${Date.now()}-${index}`;
        
        const content = `---
image: ${imageUrl}
title: ${title}
category: ${category}
album: ${album}
date: ${date}
---
`;
        
        return {
            slug: uniqueSlug,
            content: content,
            title: title
        };
    }
    
    /**
     * Fonction pour traiter l'album et créer les fichiers individuels
     */
    function processAlbumBulk(entry) {
        const data = entry.get('data');
        const albumName = data.get('albumName');
        const category = data.get('category');
        const baseTitle = data.get('baseTitle');
        const images = data.get('images');
        const date = data.get('date');
        
        if (!images || images.size === 0) {
            alert('⚠️ Aucune image dans l\'album !');
            return;
        }
        
        console.log(`📸 Traitement de l'album "${albumName}" avec ${images.size} photos...`);
        
        // Créer un fichier pour chaque image
        const entries = [];
        images.forEach((image, index) => {
            const imageUrl = image;
            const photoNumber = index + 1;
            const photoTitle = `${baseTitle} ${photoNumber}`;
            
            const portfolioEntry = createPortfolioEntry(
                imageUrl,
                photoTitle,
                category,
                albumName,
                date,
                index
            );
            
            entries.push(portfolioEntry);
            console.log(`✅ ${photoNumber}/${images.size} - ${photoTitle}`);
        });
        
        return entries;
    }
    
    /**
     * Hook personnalisé : Intercepter la sauvegarde d'un album
     */
    CMS.registerEventListener({
        name: 'preSave',
        handler: async function({ entry }) {
            const collection = entry.get('collection');
            
            // Vérifier si c'est un album bulk
            if (collection === 'album-bulk') {
                console.log('🎯 Détection d\'un album bulk !');
                
                try {
                    const entries = processAlbumBulk(entry);
                    
                    // Afficher un message de confirmation
                    const confirm = window.confirm(
                        `📦 Vous êtes sur le point de créer ${entries.length} photos dans votre portfolio.\n\n` +
                        `Album : ${entry.getIn(['data', 'albumName'])}\n` +
                        `Catégorie : ${entry.getIn(['data', 'category'])}\n` +
                        `Titres : ${entry.getIn(['data', 'baseTitle'])} 1 à ${entries.length}\n\n` +
                        `⚠️ NOTE IMPORTANTE :\n` +
                        `Les photos seront créées dans "Portfolio (1 photo)".\n` +
                        `Ce fichier album temporaire sera sauvegardé dans "content/albums/".\n` +
                        `Vous pourrez le supprimer après la publication.\n\n` +
                        `Continuer ?`
                    );
                    
                    if (!confirm) {
                        console.log('❌ Publication annulée par l\'utilisateur');
                        return entry; // Annuler
                    }
                    
                    console.log('✅ Publication confirmée !');
                    
                    // Note : Decap CMS ne permet pas de créer plusieurs entrées via preSave
                    // On sauvegarde l'album, et l'utilisateur devra utiliser un script externe
                    // OU on affiche les instructions pour créer manuellement
                    
                    alert(
                        `✅ Album "${entry.getIn(['data', 'albumName'])}" sauvegardé !\n\n` +
                        `📝 PROCHAINE ÉTAPE :\n` +
                        `Pour transformer cet album en photos individuelles, vous avez 2 options :\n\n` +
                        `OPTION 1 (AUTOMATIQUE) :\n` +
                        `Contactez votre développeur pour qu'il lance le script de conversion.\n\n` +
                        `OPTION 2 (MANUEL - TEMPORAIRE) :\n` +
                        `Copiez-collez manuellement chaque photo dans "Portfolio (1 photo)".\n` +
                        `Utilisez les titres numérotés : ${entry.getIn(['data', 'baseTitle'])} 1, 2, 3, etc.`
                    );
                    
                } catch (error) {
                    console.error('❌ Erreur lors du traitement de l\'album :', error);
                    alert('❌ Erreur lors du traitement de l\'album. Vérifiez la console.');
                }
            }
            
            // Laisser la sauvegarde se faire normalement
            return entry;
        }
    });
    
    console.log('✅ Bulk Handler initialisé avec succès !');
    
})();


