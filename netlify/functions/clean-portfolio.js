const fetch = require('node-fetch');

// Fonction pour nettoyer l'index portfolio en supprimant les entrées orphelines
async function cleanPortfolioIndex(owner, repo, branch, githubToken) {
  console.log('🧹 Début du nettoyage de l\'index portfolio...');
  
  try {
    // 1. Récupérer l'index actuel
    let currentIndex = [];
    try {
      const indexResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (indexResponse.ok) {
        const indexData = await indexResponse.json();
        const indexContent = Buffer.from(indexData.content, 'base64').toString();
        currentIndex = JSON.parse(indexContent);
        console.log(`📋 Index actuel: ${currentIndex.length} entrées`);
      }
    } catch (error) {
      console.log('📋 Aucun index existant trouvé');
    }

    // 2. Scanner les dossiers de contenu pour vérifier les fichiers existants
    const categories = ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle'];
    const validEntries = [];
    
    for (const category of categories) {
      const categoryPath = `content/portfolio/${category}`;
      console.log(`🔍 Vérification de ${category}...`);
      
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${categoryPath}?ref=${branch}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (response.ok) {
          const items = await response.json();
          
          for (const item of items) {
            if (item.type === 'dir') {
              // Scanner le dossier d'album
              const albumPath = item.path;
              const albumResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${albumPath}?ref=${branch}`,
                {
                  headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                  }
                }
              );
              
              if (albumResponse.ok) {
                const albumItems = await albumResponse.json();
                
                for (const albumItem of albumItems) {
                  if (albumItem.type === 'file' && albumItem.name.endsWith('.md')) {
                    // Vérifier que le fichier markdown existe
                    const mdResponse = await fetch(albumItem.download_url);
                    if (mdResponse.ok) {
                      const content = await mdResponse.text();
                      const data = parseMarkdownFrontmatter(content);
                      if (data && data.image) {
                        // Vérifier que l'image existe
                        const imagePath = data.image.startsWith('/') ? data.image.substring(1) : data.image;
                        const imageResponse = await fetch(
                          `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`,
                          {
                            headers: {
                              'Authorization': `token ${githubToken}`,
                              'Accept': 'application/vnd.github.v3+json'
                            }
                          }
                        );
                        
                        if (imageResponse.ok) {
                          validEntries.push(data);
                          console.log(`✅ Entrée valide: ${data.title}`);
                        } else {
                          console.log(`❌ Image manquante: ${data.title}`);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Erreur lors de la vérification de ${category}: ${error.message}`);
      }
    }

    // 3. Créer le nouvel index nettoyé
    const cleanedIndex = JSON.stringify(validEntries, null, 2);
    const base64Content = Buffer.from(cleanedIndex).toString('base64');

    // 4. Obtenir le SHA du fichier existant
    let sha = null;
    try {
      const existingFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
        {
          method: 'GET',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (existingFileResponse.ok) {
        const existingFile = await existingFileResponse.json();
        sha = existingFile.sha;
      }
    } catch (error) {
      // Fichier n'existe pas encore
    }

    // 5. Mettre à jour le fichier
    const updatePayload = {
      message: `🧹 Auto-cleanup portfolio index (${validEntries.length} entrées valides)`,
      content: base64Content,
      branch: branch
    };

    if (sha) {
      updatePayload.sha = sha;
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(updatePayload)
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Échec update index: ${errorData.message}`);
    }

    console.log(`✅ Index nettoyé: ${currentIndex.length} → ${validEntries.length} entrées`);
    return {
      before: currentIndex.length,
      after: validEntries.length,
      cleaned: currentIndex.length - validEntries.length
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Parser le frontmatter YAML
function parseMarkdownFrontmatter(content) {
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

exports.handler = async (event, context) => {
  // Configuration CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    // Configuration du repo
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration serveur manquante',
          message: 'Le token GitHub n\'est pas configuré'
        })
      };
    }

    const owner = 'Jiji344';
    const repo = 'Code-Site-webmaximeV2';
    const branch = 'main';

    // Exécuter le nettoyage
    const result = await cleanPortfolioIndex(owner, repo, branch, githubToken);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Index portfolio nettoyé avec succès',
        result: result
      })
    };

  } catch (error) {
    console.error('Erreur générale:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        message: error.message
      })
    };
  }
};
