// Utilisation du fetch natif de Node.js 18+ (disponible dans Netlify Functions)

// Helper pour déterminer le format d'authentification GitHub
function getGitHubAuthHeader(githubToken) {
  // Fine-grained tokens (github_pat_...) utilisent Bearer, classic tokens (ghp_...) utilisent token
  return githubToken.startsWith('github_pat_') 
    ? `Bearer ${githubToken}`
    : `token ${githubToken}`;
}

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
            'Authorization': getGitHubAuthHeader(githubToken),
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
    const categories = ['Portrait', 'Mariage', 'Immobilier', 'Événementiel'];
    const validEntries = [];
    const validImagePaths = new Set();
    const validMdPaths = new Set();
    
    for (const category of categories) {
      const categoryPath = `content/portfolio/${category.toLowerCase()}`;
      console.log(`🔍 Vérification de ${category}...`);
      
      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${categoryPath}?ref=${branch}`,
          {
            headers: {
              'Authorization': getGitHubAuthHeader(githubToken),
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
                    'Authorization': getGitHubAuthHeader(githubToken),
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
                        // Vérifier si c'est une URL externe (Cloudflare CDN ou Cloudinary legacy)
                        const isExternalUrl = data.image.startsWith('http') && 
                                             (data.image.includes('cloudinary.com') || 
                                              data.image.includes('cloudflare') || 
                                              data.image.includes('cdn'));
                        
                        if (isExternalUrl) {
                          // URL externe (Cloudflare CDN ou Cloudinary) - considérer comme valide sans vérifier dans GitHub
                          validEntries.push(data);
                          validMdPaths.add(albumItem.path);
                          console.log(`✅ Entrée externe valide: ${data.title}`);
                        } else {
                          // Image locale - vérifier qu'elle existe dans GitHub
                          const imagePath = data.image.startsWith('/') ? data.image.substring(1) : data.image;
                          const imageResponse = await fetch(
                            `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`,
                            {
                              headers: {
                                'Authorization': getGitHubAuthHeader(githubToken),
                                'Accept': 'application/vnd.github.v3+json'
                              }
                            }
                          );
                          
                          if (imageResponse.ok) {
                            validEntries.push(data);
                            validImagePaths.add(imagePath);
                            validMdPaths.add(albumItem.path);
                            console.log(`✅ Entrée locale valide: ${data.title}`);
                          } else {
                            console.log(`❌ Image locale manquante: ${data.title} (${imagePath})`);
                          }
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
            'Authorization': getGitHubAuthHeader(githubToken),
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
  
  const categories = ['Portrait', 'Mariage', 'Immobilier', 'Événementiel'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const imageDir = `static/img/${category.toLowerCase()}`;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${imageDir}?ref=${branch}`,
        {
          headers: {
            'Authorization': getGitHubAuthHeader(githubToken),
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
                  'Authorization': getGitHubAuthHeader(githubToken),
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
                            'Authorization': getGitHubAuthHeader(githubToken),
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
  
  const categories = ['Portrait', 'Mariage', 'Immobilier', 'Événementiel'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category.toLowerCase()}`;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${categoryPath}?ref=${branch}`,
        {
          headers: {
            'Authorization': getGitHubAuthHeader(githubToken),
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
                  'Authorization': getGitHubAuthHeader(githubToken),
                  'Accept': 'application/vnd.github.v3+json'
                }
              }
            );
            
            if (albumResponse.ok) {
              const albumItems = await albumResponse.json();
              
              for (const albumItem of albumItems) {
                if (albumItem.type === 'file' && albumItem.name.endsWith('.md')) {
                  const mdPath = albumItem.path;
                  
                  // Vérifier si le fichier .md est référencé dans validMdPaths
                  if (!validMdPaths.has(mdPath)) {
                    // Vérifier si le fichier contient une URL externe (Cloudflare CDN ou Cloudinary) avant de le supprimer
                    try {
                      const mdResponse = await fetch(albumItem.download_url);
                      if (mdResponse.ok) {
                        const content = await mdResponse.text();
                        const data = parseMarkdownFrontmatter(content);
                        
                        // Si le fichier référence une URL externe (Cloudflare CDN ou Cloudinary), ne pas le supprimer
                        if (data && data.image && data.image.startsWith('http') && 
                            (data.image.includes('cloudinary.com') || data.image.includes('cloudflare') || data.image.includes('cdn'))) {
                          console.log(`✅ Fichier externe conservé: ${mdPath}`);
                          continue; // Passer au fichier suivant
                        }
                      }
                    } catch (checkError) {
                      console.log(`⚠️ Erreur vérification ${mdPath}: ${checkError.message}`);
                    }
                    
                    // Fichier .md orphelin (pas d'URL externe) - le supprimer
                    console.log(`🗑️ Suppression fichier .md orphelin: ${mdPath}`);
                    
                    try {
                      await fetch(
                        `https://api.github.com/repos/${owner}/${repo}/contents/${mdPath}`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Authorization': getGitHubAuthHeader(githubToken),
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
                      console.log(`⚠️ Erreur suppression ${mdPath}: ${deleteError.message}`);
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
  
  const categories = ['Portrait', 'Mariage', 'Immobilier', 'Événementiel'];
  let deletedCount = 0;
  
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category.toLowerCase()}`;
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${categoryPath}?ref=${branch}`,
        {
          headers: {
            'Authorization': getGitHubAuthHeader(githubToken),
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
                  'Authorization': getGitHubAuthHeader(githubToken),
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
                        'Authorization': getGitHubAuthHeader(githubToken),
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
        let value = line.substring(colonIndex + 1).trim();
        
        // Convertir les valeurs booléennes
        if (value === 'true' || value === 'True') {
          value = true;
        } else if (value === 'false' || value === 'False') {
          value = false;
        }
        // Garder les autres valeurs comme strings (dates, URLs, etc.)
        
        data[key] = value;
      }
    });
    
    // S'assurer que isCover est toujours présent (false par défaut)
    if (data.isCover === undefined) {
      data.isCover = false;
    }

    return data;
  }

  return null;
}

// Fonction pour vider complètement l'index
async function resetPortfolioIndex(owner, repo, branch, githubToken) {
  console.log('🗑️ Vidage complet de l\'index portfolio...');
  
  try {
    // Créer un index vide
    const emptyIndex = JSON.stringify([], null, 2);
    const base64Content = Buffer.from(emptyIndex).toString('base64');

    // Vérifier si le fichier existe déjà (pour obtenir le SHA)
    let sha = null;
    try {
      const existingFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
        {
          method: 'GET',
          headers: {
            'Authorization': getGitHubAuthHeader(githubToken),
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (existingFileResponse.ok) {
        const existingFile = await existingFileResponse.json();
        sha = existingFile.sha;
      }
    } catch (error) {
      // Fichier n'existe pas encore, c'est OK
    }

    // Créer ou mettre à jour le fichier
    const updatePayload = {
      message: `🗑️ Vidage complet de l'index portfolio`,
      content: base64Content,
      branch: branch
    };

    if (sha) {
      updatePayload.sha = sha; // Nécessaire pour update
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
      throw new Error(`Échec vidage index: ${errorData.message}`);
    }

    console.log('✅ Index portfolio vidé complètement');
    return {
      before: 0,
      after: 0,
      cleaned: 0,
      reset: true
    };

  } catch (error) {
    console.error('❌ Erreur lors du vidage:', error);
    throw error;
  }
}

// Exporter la fonction pour l'utiliser dans batch-upload.js
exports.cleanPortfolioIndex = cleanPortfolioIndex;

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

    // Vérifier l'action demandée
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      body = {};
    }

    let result;
    if (body.action === 'reset') {
      // Vider complètement l'index
      result = await resetPortfolioIndex(owner, repo, branch, githubToken);
    } else {
      // Nettoyage normal
      result = await cleanPortfolioIndex(owner, repo, branch, githubToken);
    }

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
