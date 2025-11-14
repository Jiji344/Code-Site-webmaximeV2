const fetch = require('node-fetch');

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

  // Vérifier si le fichier existe déjà (pour obtenir le SHA)
  let sha = null;
  try {
    const authHeader = getGitHubAuthHeader(githubToken);
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/portfolio-index.json`,
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
    }
  } catch (error) {
    // Fichier n'existe pas encore, c'est OK
  }

  // Créer ou mettre à jour le fichier
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

  return allPhotos.length;
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

    const photosCount = await regenerateIndex(owner, repo, branch || 'main', githubToken);
    
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
      coverCount = indexContent.filter(photo => photo.isCover === true).length;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Index régénéré avec succès (${photosCount} photos, ${coverCount} couvertures définies)`,
        photosCount: photosCount,
        coverCount: coverCount
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

