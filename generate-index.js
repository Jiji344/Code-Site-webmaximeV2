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


