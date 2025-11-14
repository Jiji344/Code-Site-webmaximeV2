// Utilisation du fetch natif de Node.js 18+ (disponible dans Netlify Functions)

// Helper pour déterminer le format d'authentification GitHub
function getGitHubAuthHeader(githubToken) {
  return githubToken.startsWith('github_pat_') 
    ? `Bearer ${githubToken}`
    : `token ${githubToken}`;
}

// Parser le frontmatter YAML
function parseMarkdownFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatter = match[1];
    const data = {};

    frontmatter.split('\n').forEach(line => {
      // Ignorer les lignes vides ou les commentaires
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();
        
        // Retirer les guillemets si présents
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Convertir les valeurs booléennes
        if (value === 'true' || value === 'True') {
          value = true;
        } else if (value === 'false' || value === 'False') {
          value = false;
        }
        
        // Toujours inclure le champ, même s'il est false
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

// Fonction pour scanner un dossier récursivement
async function scanDirectory(owner, repo, branch, githubToken, path) {
  const photos = [];

  try {
    const authHeader = getGitHubAuthHeader(githubToken);
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!response.ok) {
      console.log(`⚠️ Dossier ${path} non accessible (${response.status}): ${response.statusText}`);
      return photos;
    }

    const items = await response.json();

    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        const fileResponse = await fetch(item.download_url);
        if (fileResponse.ok) {
          const content = await fileResponse.text();
          const data = parseMarkdownFrontmatter(content);
          if (data) {
            photos.push(data);
          }
        }
      } else if (item.type === 'dir') {
        const subPhotos = await scanDirectory(owner, repo, branch, githubToken, item.path);
        photos.push(...subPhotos);
      }
    }
  } catch (error) {
    console.debug(`Dossier ${path} non accessible`);
  }

  return photos;
}

// Fonction pour régénérer l'index portfolio
async function regenerateIndex(owner, repo, branch, githubToken) {
  const categories = ['Portrait', 'Mariage', 'Immobilier', 'Paysage', 'Macro', 'Lifestyle'];
  const allPhotos = [];

  // Scanner tous les dossiers de catégories
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category.toLowerCase()}`;
    const photos = await scanDirectory(owner, repo, branch, githubToken, categoryPath);
    allPhotos.push(...photos);
  }

  // Créer le contenu JSON
  const indexContent = JSON.stringify(allPhotos, null, 2);
  const base64Content = Buffer.from(indexContent).toString('base64');

  // Vérifier si le fichier existe déjà (pour obtenir le SHA et comparer le contenu)
  let sha = null;
  let contentChanged = true;
  try {
    const authHeader = getGitHubAuthHeader(githubToken);
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json?ref=${branch}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
    
    if (existingFileResponse.ok) {
      const existingFile = await existingFileResponse.json();
      sha = existingFile.sha;
      
      // Comparer le contenu pour éviter les commits inutiles
      const existingContent = Buffer.from(existingFile.content, 'base64').toString('utf-8');
      const existingPhotos = JSON.parse(existingContent);
      
      // Comparer les deux tableaux (normalisés pour éviter les différences d'ordre)
      const normalizePhoto = (photo) => ({
        title: photo.title,
        album: photo.album,
        imageUrl: photo.imageUrl,
        date: photo.date,
        isCover: photo.isCover === true || photo.isCover === 'true' || photo.isCover === 'True' || photo.isCover === 1 || photo.isCover === '1'
      });
      
      const existingNormalized = existingPhotos.map(normalizePhoto).sort((a, b) => 
        `${a.album}-${a.title}`.localeCompare(`${b.album}-${b.title}`)
      );
      const newNormalized = allPhotos.map(normalizePhoto).sort((a, b) => 
        `${a.album}-${a.title}`.localeCompare(`${b.album}-${b.title}`)
      );
      
      contentChanged = JSON.stringify(existingNormalized) !== JSON.stringify(newNormalized);
      
      if (!contentChanged) {
        console.log('ℹ️ Aucun changement détecté, pas de commit nécessaire');
        return { count: allPhotos.length, changed: false };
      }
    }
  } catch (error) {
    // Fichier n'existe pas encore, c'est OK, on va le créer
    console.log('ℹ️ Fichier index inexistant, création nécessaire');
  }

  // Créer ou mettre à jour le fichier uniquement si le contenu a changé
  const updatePayload = {
    message: `🔄 Régénération de l'index portfolio (${allPhotos.length} photos)`,
    content: base64Content,
    branch: branch
  };

  if (sha) {
    updatePayload.sha = sha;
  }

  const authHeader = getGitHubAuthHeader(githubToken);
  const updateResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
    {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(updatePayload)
    }
  );

  if (!updateResponse.ok) {
    const errorData = await updateResponse.json();
    throw new Error(`Échec update index: ${errorData.message}`);
  }

  return { count: allPhotos.length, changed: true };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    const { owner, repo, branch } = JSON.parse(event.body || '{}');
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'GITHUB_TOKEN non configuré' })
      };
    }

    if (!owner || !repo) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'owner et repo requis' })
      };
    }

    const result = await regenerateIndex(owner, repo, branch || 'main', githubToken);
    
    // Si aucun changement, retourner immédiatement
    if (!result.changed) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: `Aucun changement détecté (${result.count} photos)`,
          photosCount: result.count,
          coverCount: 0,
          changed: false
        })
      };
    }
    
    // Vérifier combien de photos ont le champ isCover
    const indexResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json?ref=${branch || 'main'}`,
      {
        headers: {
          'Authorization': getGitHubAuthHeader(githubToken),
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
    
    let coverCount = 0;
    if (indexResponse.ok) {
      const indexFile = await indexResponse.json();
      const indexContent = JSON.parse(Buffer.from(indexFile.content, 'base64').toString());
      // Compter toutes les photos avec isCover === true (booléen ou string)
      coverCount = indexContent.filter(photo => 
        photo.isCover === true || 
        photo.isCover === 'true' || 
        photo.isCover === 'True' ||
        photo.isCover === 1 ||
        photo.isCover === '1'
      ).length;
      
      // Log pour déboguer
      const coverPhotos = indexContent.filter(photo => 
        photo.isCover === true || 
        photo.isCover === 'true' || 
        photo.isCover === 'True' ||
        photo.isCover === 1 ||
        photo.isCover === '1'
      );
      console.log(`📸 Photos de couverture trouvées: ${coverCount}`);
      coverPhotos.forEach(photo => {
        console.log(`  - ${photo.title} (album: ${photo.album}, isCover: ${photo.isCover})`);
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Index régénéré avec succès (${result.count} photos, ${coverCount} couvertures définies)`,
        photosCount: result.count,
        coverCount: coverCount,
        changed: true
      })
    };
  } catch (error) {
    console.error('Erreur lors de la régénération de l\'index:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur lors de la régénération de l\'index',
        details: error.message 
      })
    };
  }
};

