// Script pour générer portfolio-index.json
const fs = require('fs');
const path = require('path');

function parseMarkdown(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
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

function scanDirectory(dir, results = []) {
    if (!fs.existsSync(dir)) return results;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Scan récursif
            scanDirectory(fullPath, results);
        } else if (item.endsWith('.md')) {
            // Lire le fichier markdown
            const content = fs.readFileSync(fullPath, 'utf-8');
            const data = parseMarkdown(content);
            
            if (data) {
                results.push(data);
            }
        }
    }
    
    return results;
}

// Scanner tous les dossiers de portfolio
const portfolioPath = path.join(__dirname, 'content', 'portfolio');
const categories = ['portrait', 'mariage', 'immobilier', 'événementiel', 'voyage', 'animalier'];

let allPhotos = [];

for (const category of categories) {
    const categoryPath = path.join(portfolioPath, category);
    const photos = scanDirectory(categoryPath);
    allPhotos = allPhotos.concat(photos);
}

// Écrire le fichier JSON
const outputPath = path.join(__dirname, 'portfolio-index.json');
fs.writeFileSync(outputPath, JSON.stringify(allPhotos, null, 2), 'utf-8');

console.log(`✅ Index généré : ${allPhotos.length} photos dans portfolio-index.json`);

// Générer le cache des images de couverture
function generateCoverImagesCache(photos) {
    const cache = {
        version: Date.now(),
        covers: []
    };

    // Grouper par catégorie et album
    const albumsByCategory = {};
    photos.forEach(photo => {
        if (photo.category && photo.album && photo.image) {
            const category = photo.category;
            const album = photo.album;
            
            if (!albumsByCategory[category]) {
                albumsByCategory[category] = {};
            }
            if (!albumsByCategory[category][album]) {
                albumsByCategory[category][album] = [];
            }
            albumsByCategory[category][album].push(photo);
        }
    });

    // Identifier les images de couverture
    Object.keys(albumsByCategory).forEach(category => {
        Object.keys(albumsByCategory[category]).forEach(album => {
            const albumPhotos = albumsByCategory[category][album];
            
            // Chercher une image avec isCover === true
            let coverPhoto = albumPhotos.find(photo => {
                const isCover = photo.isCover === true || 
                               photo.isCover === 'true' || 
                               photo.isCover === 'True' ||
                               photo.isCover === 1 ||
                               photo.isCover === '1';
                return isCover;
            });
            
            // Si pas de couverture définie, utiliser la première
            if (!coverPhoto && albumPhotos.length > 0) {
                coverPhoto = albumPhotos[0];
            }
            
            if (coverPhoto && coverPhoto.image) {
                cache.covers.push({
                    category: category,
                    album: album,
                    imageUrl: coverPhoto.image,
                    optimizedUrl: coverPhoto.image
                });
            }
        });
    });

    return cache;
}

const coverCache = generateCoverImagesCache(allPhotos);
const coverCachePath = path.join(__dirname, 'cover-images-cache.json');
fs.writeFileSync(coverCachePath, JSON.stringify(coverCache, null, 2), 'utf-8');

console.log(`✅ Cache des couvertures généré : ${coverCache.covers.length} images dans cover-images-cache.json`);


