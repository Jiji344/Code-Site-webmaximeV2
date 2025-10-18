const fetch = require('node-fetch');

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
        const mdContent = `image: /${imagePath}
title: ${photoTitle}
category: ${categoryName}
album: ${albumTitle}
date: ${formattedDate}`;

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

