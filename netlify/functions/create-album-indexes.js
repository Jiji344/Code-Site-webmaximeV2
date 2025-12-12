// Fonction pour créer les fichiers _index.md manquants pour les albums existants
// Nécessaire pour que Decap CMS reconnaisse correctement les collections nested

// Helper pour déterminer le format d'authentification GitHub
function getGitHubAuthHeader(githubToken) {
  return githubToken.startsWith('github_pat_') 
    ? `Bearer ${githubToken}`
    : `token ${githubToken}`;
}

// Fonction pour scanner les dossiers d'albums et créer les _index.md manquants
async function createMissingIndexes(owner, repo, branch, githubToken) {
  const categories = ['portrait', 'mariage', 'immobilier', 'événementiel'];
  const categoryNames = {
    'portrait': 'Portrait',
    'mariage': 'Mariage',
    'immobilier': 'Immobilier',
    'événementiel': 'Événementiel'
  };
  
  const authHeader = getGitHubAuthHeader(githubToken);
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const category of categories) {
    const categoryPath = `content/portfolio/${category}`;
    console.log(`📂 Scan de la catégorie: ${category}`);

    try {
      // Lister tous les dossiers dans la catégorie
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${categoryPath}?ref=${branch}`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ Erreur lors du scan de ${categoryPath}:`, response.status);
        continue;
      }

      const items = await response.json();
      
      // Filtrer uniquement les dossiers (type === 'dir')
      const albums = items.filter(item => item.type === 'dir');
      console.log(`  📁 ${albums.length} albums trouvés dans ${category}`);

      for (const album of albums) {
        const albumPath = album.path;
        const indexPath = `${albumPath}/_index.md`;
        
        try {
          // Vérifier si _index.md existe déjà
          const checkResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}?ref=${branch}`,
            {
              headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version': '2022-11-28'
              }
            }
          );

          if (checkResponse.ok) {
            console.log(`  ✓ _index.md existe déjà pour: ${album.name}`);
            skipped++;
            continue;
          }

          // Si le fichier n'existe pas (404), le créer
          if (checkResponse.status === 404) {
            // Extraire le nom de l'album depuis le chemin
            // Format: content/portfolio/category/album-slug
            const albumName = album.name
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            const categoryName = categoryNames[category] || category;
            
            const indexContent = `---
title: ${albumName}
album: ${albumName}
category: ${categoryName}
date: ${new Date().toISOString()}
---
`;

            const createResponse = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contents/${indexPath}`,
              {
                method: 'PUT',
                headers: {
                  'Authorization': authHeader,
                  'Content-Type': 'application/json',
                  'Accept': 'application/vnd.github.v3+json',
                  'X-GitHub-Api-Version': '2022-11-28'
                },
                body: JSON.stringify({
                  message: `Create album index: ${albumName}`,
                  content: Buffer.from(indexContent).toString('base64'),
                  branch: branch
                })
              }
            );

            if (createResponse.ok) {
              console.log(`  ✅ _index.md créé pour: ${album.name}`);
              created++;
            } else {
              const errorData = await createResponse.json();
              console.error(`  ❌ Erreur création _index.md pour ${album.name}:`, errorData.message);
              errors++;
            }
          }
        } catch (albumError) {
          console.error(`  ❌ Erreur traitement album ${album.name}:`, albumError.message);
          errors++;
        }
      }
    } catch (categoryError) {
      console.error(`❌ Erreur catégorie ${category}:`, categoryError.message);
      errors++;
    }
  }

  return { created, skipped, errors };
}

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Vérifier que c'est une requête POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  // Vérifier l'origine (sécurité)
  const origin = event.headers.origin || event.headers.referer || '';
  const allowedOrigins = [
    'https://photographemonsieurcrocodeal.netlify.app',
    'https://monsieurcrocodealphotographie.netlify.app',
    'https://code-site-webmaximev2.netlify.app',
    'https://monsieurcrocodealphotographie.fr',
    'https://www.monsieurcrocodealphotographie.fr',
    'http://localhost:8888'
  ];

  if (!allowedOrigins.some(allowed => origin.includes(allowed))) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Origine non autorisée' })
    };
  }

  try {
    // Récupérer les variables d'environnement
    const githubToken = process.env.GITHUB_TOKEN;
    const repoInfo = process.env.GITHUB_REPO || 'JO-Webmaxime/Code-Site-webmaximeV2';
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!githubToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration manquante',
          message: 'GITHUB_TOKEN n\'est pas configuré dans Netlify'
        })
      };
    }

    const [owner, repo] = repoInfo.split('/');
    if (!owner || !repo) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration invalide',
          message: 'GITHUB_REPO doit être au format owner/repo'
        })
      };
    }

    console.log(`🚀 Création des fichiers _index.md manquants...`);
    console.log(`📦 Dépôt: ${owner}/${repo}, Branche: ${branch}`);

    const result = await createMissingIndexes(owner, repo, branch, githubToken);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Création terminée: ${result.created} créés, ${result.skipped} déjà existants, ${result.errors} erreurs`,
        stats: result
      })
    };

  } catch (error) {
    console.error('❌ Erreur:', error);
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

