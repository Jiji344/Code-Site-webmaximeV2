const fetch = require('node-fetch');

// Fonction pour nettoyer complètement le portfolio (index + fichiers orphelins)
async function cleanPortfolioIndex(owner, repo, branch, githubToken) {
  console.log('🧹 Début du nettoyage complet du portfolio...');
  
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
    const validImagePaths = new Set();
    const validMdPaths = new Set();
    
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
                          validImagePaths.add(imagePath);
                          validMdPaths.add(albumItem.path);
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

    // 3. NETTOYAGE COMPLET : Supprimer tous les fichiers orphelins
    console.log('🗑️ Suppression des fichiers orphelins...');
    
    // 3.1. Supprimer les images orphelines
    await deleteOrphanImages(owner, repo, branch, githubToken, validImagePaths);
    
    // 3.2. Supprimer les fichiers .md orphelins
    await deleteOrphanMarkdowns(owner, repo, branch, githubToken, validMdPaths);
    
    // 3.3. Supprimer les dossiers vides
    await deleteEmptyDirectories(owner, repo, branch, githubToken);

    // 4. Créer le nouvel index nettoyé
    const cleanedIndex = JSON.stringify(validEntries, null, 2);
    const base64Content = Buffer.from(cleanedIndex).toString('base64');

    // 5. Obtenir le SHA du fichier existant
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

    // 6. Mettre à jour le fichier index
    const updatePayload = {
      message: `🧹 Nettoyage complet portfolio (${validEntries.length} entrées valides)`,
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

    console.log(`✅ Nettoyage complet terminé: ${currentIndex.length} → ${validEntries.length} entrées`);
    return {
      before: currentIndex.length,
      after: validEntries.length,
      cleaned: currentIndex.length - validEntries.length,
      orphanImagesDeleted: true,
      orphanMarkdownsDeleted: true,
      emptyDirectoriesDeleted: true
    };

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Fonction pour supprimer les images orphelines
async function deleteOrphanImages(owner, repo, branch, githubToken, validImagePaths) {
  console.log('🖼️ Suppression des images orphelines...');
  
  const categories = ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const imageDir = `static/img/${category}`;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${imageDir}?ref=${branch}`,
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
                if (albumItem.type === 'file' && 
                    (albumItem.name.endsWith('.jpg') || 
                     albumItem.name.endsWith('.jpeg') || 
                     albumItem.name.endsWith('.png') || 
                     albumItem.name.endsWith('.webp'))) {
                  
                  // Vérifier si l'image est référencée
                  if (!validImagePaths.has(albumItem.path)) {
                    console.log(`🗑️ Suppression image orpheline: ${albumItem.path}`);
                    
                    try {
                      await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${albumItem.path}`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                          },
                          body: JSON.stringify({
                            message: `🗑️ Suppression image orpheline: ${albumItem.name}`,
                            sha: albumItem.sha,
                            branch: branch
                          })
                        }
                      );
                      deletedCount++;
                    } catch (deleteError) {
                      console.log(`⚠️ Erreur suppression ${albumItem.path}: ${deleteError.message}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la vérification des images ${category}: ${error.message}`);
    }
  }
  
  console.log(`✅ ${deletedCount} images orphelines supprimées`);
}

// Fonction pour supprimer les fichiers .md orphelins
async function deleteOrphanMarkdowns(owner, repo, branch, githubToken, validMdPaths) {
  console.log('📄 Suppression des fichiers .md orphelins...');
  
  const categories = ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category}`;
    
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
                  
                  // Vérifier si le fichier .md est référencé
                  if (!validMdPaths.has(albumItem.path)) {
                    console.log(`🗑️ Suppression fichier .md orphelin: ${albumItem.path}`);
                    
                    try {
                      await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${albumItem.path}`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `token ${githubToken}`,
                            'Accept': 'application/vnd.github.v3+json'
                          },
                          body: JSON.stringify({
                            message: `🗑️ Suppression fichier .md orphelin: ${albumItem.name}`,
                            sha: albumItem.sha,
                            branch: branch
                          })
                        }
                      );
                      deletedCount++;
                    } catch (deleteError) {
                      console.log(`⚠️ Erreur suppression ${albumItem.path}: ${deleteError.message}`);
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la vérification des .md ${category}: ${error.message}`);
    }
  }
  
  console.log(`✅ ${deletedCount} fichiers .md orphelins supprimés`);
}

// Fonction pour supprimer les dossiers vides
async function deleteEmptyDirectories(owner, repo, branch, githubToken) {
  console.log('📁 Suppression des dossiers vides...');
  
  const categories = ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category}`;
    
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
            // Vérifier si le dossier d'album est vide
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
              
              // Si le dossier est vide, le supprimer
              if (albumItems.length === 0) {
                console.log(`🗑️ Suppression dossier vide: ${albumPath}`);
                
                try {
                  await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/contents/${albumPath}`,
                    {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                      },
                      body: JSON.stringify({
                        message: `🗑️ Suppression dossier vide: ${item.name}`,
                        sha: item.sha,
                        branch: branch
                      })
                    }
                  );
                  deletedCount++;
                } catch (deleteError) {
                  console.log(`⚠️ Erreur suppression dossier ${albumPath}: ${deleteError.message}`);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Erreur lors de la vérification des dossiers ${category}: ${error.message}`);
    }
  }
  
  console.log(`✅ ${deletedCount} dossiers vides supprimés`);
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
