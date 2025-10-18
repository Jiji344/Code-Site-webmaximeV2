const fetch = require('node-fetch');

// Fonction pour régénérer l'index portfolio
async function regenerateIndex(owner, repo, branch, githubToken) {
  const categories = ['portrait', 'mariage', 'immobilier', 'paysage', 'macro', 'lifestyle'];
  const allPhotos = [];

  // Scanner tous les dossiers de catégories
  for (const category of categories) {
    const categoryPath = `content/portfolio/${category}`;
    const photos = await scanDirectory(owner, repo, branch, githubToken, categoryPath);
    allPhotos.push(...photos);
  }

  // Créer le contenu JSON
  const indexContent = JSON.stringify(allPhotos, null, 2);
  const base64Content = Buffer.from(indexContent).toString('base64');

  // Vérifier si le fichier existe déjà (pour obtenir le SHA)
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
    // Fichier n'existe pas encore, c'est OK
  }

  // Créer ou mettre à jour le fichier
  const updatePayload = {
    message: `🔄 Auto-update portfolio index (${allPhotos.length} photos)`,
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
    throw new Error(`Échec update index: ${errorData.message}`);
  }

  return allPhotos.length;
}

// Fonction pour scanner un dossier récursivement
async function scanDirectory(owner, repo, branch, githubToken, path) {
  const photos = [];

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      return photos; // Dossier vide ou n'existe pas
    }

    const items = await response.json();

    for (const item of items) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        // Lire le fichier markdown
        const fileResponse = await fetch(item.download_url);
        if (fileResponse.ok) {
          const content = await fileResponse.text();
          const data = parseMarkdownFrontmatter(content);
          if (data) {
            photos.push(data);
          }
        }
      } else if (item.type === 'dir') {
        // Scanner récursivement
        const subPhotos = await scanDirectory(owner, repo, branch, githubToken, item.path);
        photos.push(...subPhotos);
      }
    }
  } catch (error) {
    console.debug(`Dossier ${path} non accessible`);
  }

  return photos;
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

  // SÉCURITÉ RENFORCÉE : Vérifier l'authentification
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const userAgent = event.headers['user-agent'] || '';
  const origin = event.headers.origin || event.headers.Origin;
  const referer = event.headers.referer || event.headers.Referer;
  
  
  // Vérifier l'origine
  const allowedOrigins = [
    'https://photographemonsieurcrocodeal.netlify.app',
    'https://code-site-webmaximev2.netlify.app',
    'http://localhost:8888'
  ];
  
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Origine non autorisée.' })
    };
  }
  
  // Vérifier que la requête vient bien du domaine autorisé
  if (!referer || (!referer.includes('photographemonsieurcrocodeal.netlify.app') && 
                   !referer.includes('code-site-webmaximev2.netlify.app') && 
                   !referer.includes('localhost:8888'))) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Accès non autorisé. Referer non autorisé.' })
    };
  }
  
  // Vérifier le User-Agent (bloquer les requêtes suspectes)
  if (!userAgent || userAgent.includes('curl') || userAgent.includes('wget') || userAgent.includes('bot')) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'User-Agent non autorisé.' })
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
    // Parser les données
    const data = JSON.parse(event.body);
    const { albumTitle, category, files } = data;

    // Validation des données
    if (!albumTitle || !category || !files || !Array.isArray(files) || files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Données invalides',
          message: 'Veuillez fournir un titre, une catégorie et au moins une photo'
        })
      };
    }

    // Vérifier le token GitHub
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error('GITHUB_TOKEN non configuré');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuration serveur manquante',
          message: 'Le token GitHub n\'est pas configuré'
        })
      };
    }

    // Configuration du repo
    const owner = 'Jiji344';
    const repo = 'Code-Site-webmaximeV2';
    const branch = 'main';

    // Générer un slug de base (URL-friendly)
    const baseSlug = albumTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const now = new Date();
    const results = [];
    const errors = [];

    // Traiter chaque fichier
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const counter = i + 1;
      const photoTitle = `${albumTitle} ${counter}`;
      const slug = `${baseSlug}-${counter}`;

      try {
        // Date incrémentée pour éviter les conflits
        const photoDate = new Date(now.getTime() + (counter * 2000));
        const formattedDate = photoDate.toISOString();

        // Obtenir le nom de catégorie complet
        const categoryNames = {
          'portrait': 'Portrait',
          'mariage': 'Mariage',
          'immobilier': 'Immobilier',
          'paysage': 'Paysage',
          'macro': 'Macro',
          'lifestyle': 'Lifestyle'
        };
        const categoryName = categoryNames[category] || category;

        // 1. Upload de l'image dans static/img/{category}/{album}/
        const imageExtension = file.name.split('.').pop().toLowerCase();
        const imageName = `${baseSlug}-${counter}.${imageExtension}`;
        const imagePath = `static/img/${category}/${baseSlug}/${imageName}`;

        const imageUploadResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${imagePath}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Upload image: ${photoTitle}`,
              content: file.data, // Base64
              branch: branch
            })
          }
        );

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.json();
          throw new Error(`Upload image échoué: ${errorData.message}`);
        }

        // 2. Créer le fichier markdown dans content/portfolio/{category}/{album}/
        const mdContent = `---
image: /${imagePath}
title: ${photoTitle}
category: ${categoryName}
album: ${albumTitle}
date: ${formattedDate}
---`;

        const mdPath = `content/portfolio/${category}/${baseSlug}/${slug}.md`;

        const mdUploadResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${mdPath}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Add photo: ${photoTitle}`,
              content: Buffer.from(mdContent).toString('base64'),
              branch: branch
            })
          }
        );

        if (!mdUploadResponse.ok) {
          const errorData = await mdUploadResponse.json();
          throw new Error(`Upload markdown échoué: ${errorData.message}`);
        }

        const mdResult = await mdUploadResponse.json();
        results.push({
          title: photoTitle,
          path: mdPath,
          success: true
        });

        console.log(`✅ Photo ${counter}/${files.length} uploadée: ${photoTitle}`);

      } catch (error) {
        console.error(`❌ Erreur photo ${counter}:`, error.message);
        errors.push({
          index: counter,
          title: photoTitle,
          error: error.message
        });
      }
    }

    // Régénérer automatiquement l'index portfolio
    console.log('🔄 Régénération de l\'index portfolio...');
    try {
      await regenerateIndex(owner, repo, branch, githubToken);
      console.log('✅ Index portfolio régénéré');
    } catch (indexError) {
      console.error('⚠️ Erreur lors de la régénération de l\'index:', indexError.message);
      // Ne pas bloquer la réponse si l'index échoue
    }

    // Réponse finale
    const response = {
      success: errors.length === 0,
      total: files.length,
      uploaded: results.length,
      failed: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    };

    return {
      statusCode: errors.length === 0 ? 200 : 207, // 207 = Multi-Status
      headers,
      body: JSON.stringify(response)
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

