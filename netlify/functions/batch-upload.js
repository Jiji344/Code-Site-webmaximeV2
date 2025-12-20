// Utilisation du fetch natif de Node.js 18+ (disponible dans Netlify Functions)

// Helper pour déterminer le format d'authentification GitHub
function getGitHubAuthHeader(githubToken) {
  // Fine-grained tokens (github_pat_...) utilisent Bearer, classic tokens (ghp_...) utilisent token
  return githubToken.startsWith('github_pat_') 
    ? `Bearer ${githubToken}`
    : `token ${githubToken}`;
}

// Fonction pour régénérer l'index portfolio
async function regenerateIndex(owner, repo, branch, githubToken) {
  const categories = ['Portrait', 'Mariage', 'Immobilier', 'Événementiel', 'Voyage', 'Animalier'];
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
    message: `🔄 Auto-update portfolio index (${allPhotos.length} photos)`,
    content: base64Content,
    branch: branch
  };

  if (sha) {
    updatePayload.sha = sha; // Nécessaire pour update
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
      return photos; // Dossier vide ou n'existe pas
    }

    const items = await response.json();
    console.log(`📁 Scan ${path}: ${items.length} éléments trouvés`);

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
    'https://monsieurcrocodealphotographie.netlify.app',
    'https://monsieurcrocodealphotographie.fr',
    'https://www.monsieurcrocodealphotographie.fr',
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
                   !referer.includes('monsieurcrocodealphotographie.netlify.app') &&
                   !referer.includes('monsieurcrocodealphotographie.fr') &&
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

  // S'assurer que le corps est présent
  if (!event.body) {
    console.error('Requête sans corps reçu');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Corps de requête manquant',
        message: 'Aucune donnée reçue'
      })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (parseError) {
    console.error('Erreur parsing JSON:', parseError.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Données invalides',
        message: 'Impossible de parser les données envoyées'
      })
    };
  }

  try {
    // Parser les données
    const { albumTitle, category, files } = data;
    console.log(`Requête upload reçue: album="${albumTitle}", catégorie="${category}", fichiers=${files?.length || 0}`);

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
          message: 'Le token GitHub n\'est pas configuré. Veuillez configurer la variable d\'environnement GITHUB_TOKEN dans Netlify.'
        })
      };
    }
    
    // Vérifier le format du token
    const tokenPrefix = githubToken.substring(0, 4);
    const isValidFormat = githubToken.startsWith('ghp_') || githubToken.startsWith('github_pat_');
    
    if (!isValidFormat) {
      console.error(`Token GitHub format invalide (préfixe: ${tokenPrefix})`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Token GitHub invalide',
          message: `Le format du token GitHub est invalide. Format attendu: ghp_... ou github_pat_... (reçu: ${tokenPrefix}...). Veuillez vérifier la variable GITHUB_TOKEN dans Netlify.`
        })
      };
    }
    
    console.log(`🔑 Token GitHub configuré (longueur: ${githubToken.length}, préfixe: ${tokenPrefix}...)`);

    // Configuration du repo
    const owner = 'Jiji344';
    const repo = 'Code-Site-webmaximeV2';
    const branch = 'main';
    
    // Tester la validité du token avec une requête simple
    try {
      const authHeader = getGitHubAuthHeader(githubToken);
      const testResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json().catch(() => ({ message: testResponse.statusText }));
        console.error(`❌ Token GitHub invalide ou sans permissions:`, {
          status: testResponse.status,
          error: errorData
        });
        
        if (testResponse.status === 401) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Token GitHub invalide ou expiré',
              message: 'Le token GitHub n\'est pas valide ou a expiré. Veuillez créer un nouveau token et le mettre à jour dans Netlify (Site settings > Environment variables > GITHUB_TOKEN).'
            })
          };
        } else if (testResponse.status === 403) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Permissions insuffisantes',
              message: 'Le token GitHub n\'a pas les permissions nécessaires. Assurez-vous que le token a les scopes: repo (pour les tokens classiques) ou les permissions Repository access (pour les fine-grained tokens).'
            })
          };
        }
      } else {
        console.log('✅ Token GitHub valide et fonctionnel');
      }
    } catch (tokenTestError) {
      console.error('❌ Erreur lors de la vérification du token:', tokenTestError.message);
      // Ne pas bloquer si c'est juste un problème réseau, mais logger l'erreur
    }

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
        console.log(`Traitement fichier ${counter}/${files.length}:`, {
          name: file.name,
          url: file.url,
          publicId: file.publicId
        });

        // Date incrémentée pour éviter les conflits
        const photoDate = new Date(now.getTime() + (counter * 2000));
        const formattedDate = photoDate.toISOString();

        // Obtenir le nom de catégorie complet
        const categoryNames = {
          'portrait': 'Portrait',
          'mariage': 'Mariage',
          'immobilier': 'Immobilier',
          'événementiel': 'Événementiel',
          'voyage': 'Voyage',
          'animalier': 'Animalier'
        };
        const categoryName = categoryNames[category] || category;

        // Utiliser l'URL Cloudflare CDN (toujours fournie maintenant)
        if (!file.url || !file.url.startsWith('http')) {
          console.error(`URL Cloudflare CDN manquante pour ${photoTitle}:`, file);
          throw new Error(`URL Cloudflare CDN manquante pour ${photoTitle}. Reçu: ${JSON.stringify(file)}`);
        }
        
        const imagePath = file.url;
        console.log(`✅ URL Cloudflare CDN trouvée pour ${photoTitle}: ${imagePath}`);

        // Déterminer si c'est la photo de couverture (première photo = index 0)
        const isCover = i === 0; // La première photo est automatiquement la couverture

        // Créer le fichier markdown avec l'URL Cloudflare CDN
        const mdContent = `---
image: ${imagePath}
title: ${photoTitle}
category: ${categoryName}
album: ${albumTitle}
date: ${formattedDate}
isCover: ${isCover}
---`;

        const mdPath = `content/portfolio/${category}/${baseSlug}/${slug}.md`;
        console.log(`📝 Création markdown: ${mdPath}`);

        const authHeader = getGitHubAuthHeader(githubToken);
        console.log(`🔐 Format auth: ${authHeader.substring(0, 15)}...`);
        
        const mdUploadResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${mdPath}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
              'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
              message: `Add photo: ${photoTitle}`,
              content: Buffer.from(mdContent).toString('base64'),
              branch: branch
            })
          }
        );

        if (!mdUploadResponse.ok) {
          const errorText = await mdUploadResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { message: errorText };
          }
          
          console.error(`❌ Erreur upload markdown pour ${photoTitle}:`, {
            status: mdUploadResponse.status,
            statusText: mdUploadResponse.statusText,
            error: errorData
          });
          
          // Messages d'erreur plus clairs selon le code HTTP
          let errorMessage = `Upload markdown échoué (${mdUploadResponse.status}): ${errorData.message || errorText}`;
          
          if (mdUploadResponse.status === 401) {
            errorMessage = `Token GitHub invalide ou expiré. Veuillez mettre à jour GITHUB_TOKEN dans Netlify.`;
          } else if (mdUploadResponse.status === 403) {
            errorMessage = `Permissions insuffisantes. Le token GitHub n'a pas les droits nécessaires pour écrire dans le dépôt.`;
          } else if (mdUploadResponse.status === 404) {
            errorMessage = `Dépôt non trouvé. Vérifiez que le dépôt ${owner}/${repo} existe et que le token y a accès.`;
          }
          
          throw new Error(errorMessage);
        }
        
        const mdResult = await mdUploadResponse.json();
        console.log(`✅ Réponse GitHub API complète pour ${mdPath}:`, JSON.stringify(mdResult, null, 2));
        
        // Vérifier que le commit existe vraiment
        if (!mdResult.commit || !mdResult.commit.sha) {
          console.error(`⚠️ Réponse GitHub suspecte - pas de commit SHA pour ${mdPath}`);
          throw new Error(`Réponse GitHub invalide: pas de commit créé`);
        }
        
        console.log(`✅ Markdown créé avec succès: ${mdPath}`, {
          sha: mdResult.commit.sha,
          commit: mdResult.commit.html_url,
          contentSha: mdResult.content?.sha
        });

        results.push({
          title: photoTitle,
          path: mdPath,
          success: true,
          commitSha: mdResult.commit.sha,
          contentSha: mdResult.content?.sha
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
    // Attendre un peu pour que GitHub synchronise les fichiers créés
    console.log('⏳ Attente de 3 secondes pour synchronisation GitHub...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔄 Régénération de l\'index portfolio...');
    try {
      const photosCount = await regenerateIndex(owner, repo, branch, githubToken);
      console.log(`✅ Index portfolio régénéré: ${photosCount} photos trouvées`);
      
      if (photosCount === 0) {
        console.warn('⚠️ Aucune photo trouvée dans l\'index. Les fichiers viennent d\'être créés, GitHub peut mettre quelques secondes à les synchroniser.');
      }
    } catch (indexError) {
      console.error('⚠️ Erreur lors de la régénération de l\'index:', indexError.message);
      console.error('Stack:', indexError.stack);
      // Ne pas bloquer la réponse si l'index échoue
    }

    // Nettoyer automatiquement l'index des entrées orphelines
    console.log('🧹 Nettoyage automatique de l\'index...');
    try {
      const { cleanPortfolioIndex } = require('./clean-portfolio');
      await cleanPortfolioIndex(owner, repo, branch, githubToken);
      console.log('✅ Index portfolio nettoyé automatiquement');
    } catch (cleanError) {
      console.error('⚠️ Erreur lors du nettoyage automatique:', cleanError.message);
      // Ne pas bloquer la réponse si le nettoyage échoue
    }

    // Réponse finale
    console.log(`📊 Résumé final: ${results.length} réussis, ${errors.length} échecs sur ${files.length} fichiers`);
    
    const response = {
      success: errors.length === 0,
      total: files.length,
      uploaded: results.length,
      failed: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    };
    
    console.log('📤 Envoi de la réponse:', JSON.stringify(response, null, 2));

    return {
      statusCode: errors.length === 0 ? 200 : 207, // 207 = Multi-Status
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Erreur générale:', error?.stack || error);
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

