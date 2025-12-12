// Upload vers Backblaze B2 avec authentification
// Les images seront servies via Cloudflare CDN

const crypto = require('crypto');

// Fonction pour obtenir l'autorisation B2
async function getB2Authorization(applicationKeyId, applicationKey) {
  const authString = Buffer.from(`${applicationKeyId}:${applicationKey}`).toString('base64');
  
  const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur authentification B2: ${errorText}`);
  }

  return await response.json();
}

// Fonction pour obtenir l'URL d'upload
async function getUploadUrl(apiUrl, authorizationToken, bucketId) {
  const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bucketId })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur récupération URL upload B2: ${errorText}`);
  }

  return await response.json();
}

// Fonction pour uploader un fichier vers B2
async function uploadToB2(uploadUrl, uploadAuthorizationToken, fileName, fileBuffer, contentType) {
  // Calculer le SHA1 du fichier
  const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': uploadAuthorizationToken,
      'X-Bz-File-Name': fileName,
      'Content-Type': contentType,
      'X-Bz-Content-Sha1': sha1,
      'X-Bz-Info-Author': 'portfolio-upload'
    },
    body: fileBuffer
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur upload B2: ${errorText}`);
  }

  return await response.json();
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    // Parser le body avec gestion d'erreur
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Erreur parsing JSON du body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Données invalides',
          message: 'Le corps de la requête n\'est pas un JSON valide'
        })
      };
    }
    
    const { imageBase64, folder, fileName, tags } = requestData;
    
    // Valider les données requises
    if (!imageBase64) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Données manquantes',
          message: 'Le champ imageBase64 est requis'
        })
      };
    }
    
    // Configuration B2
    const applicationKeyId = process.env.B2_APPLICATION_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY;
    const bucketName = process.env.B2_BUCKET_NAME;
    const cloudflareCdnUrl = process.env.CLOUDFLARE_CDN_URL; // URL du CDN Cloudflare

    if (!applicationKeyId || !applicationKey || !bucketName) {
      throw new Error('Configuration B2 manquante. Vérifiez B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY et B2_BUCKET_NAME');
    }

    if (!cloudflareCdnUrl) {
      throw new Error('Configuration Cloudflare manquante. Vérifiez CLOUDFLARE_CDN_URL');
    }

    // Convertir base64 en buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Déterminer le type MIME et l'extension
    let contentType = 'image/jpeg';
    let extension = 'jpg';
    
    // Détecter le format depuis le base64 ou utiliser le nom de fichier
    if (fileName) {
      const lowerName = fileName.toLowerCase();
      if (lowerName.endsWith('.png')) {
        contentType = 'image/png';
        extension = 'png';
      } else if (lowerName.endsWith('.webp')) {
        contentType = 'image/webp';
        extension = 'webp';
      }
    }

    // Générer un nom de fichier unique si non fourni
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const finalFileName = fileName || `image-${timestamp}-${randomString}.${extension}`;
    
    // Construire le chemin du fichier
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    // 1. Obtenir l'autorisation B2
    const authData = await getB2Authorization(applicationKeyId, applicationKey);
    const { apiUrl, authorizationToken, downloadUrl } = authData;

    // 2. Obtenir le bucket ID
    const bucketResponse = await fetch(`${apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        'Authorization': authorizationToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountId: authData.accountId,
        bucketName: bucketName
      })
    });

    if (!bucketResponse.ok) {
      const errorText = await bucketResponse.text();
      throw new Error(`Erreur récupération bucket B2: ${errorText}`);
    }

    const buckets = await bucketResponse.json();
    const bucket = buckets.buckets.find(b => b.bucketName === bucketName);
    
    if (!bucket) {
      throw new Error(`Bucket "${bucketName}" introuvable dans votre compte B2`);
    }

    // 3. Obtenir l'URL d'upload
    const uploadUrlData = await getUploadUrl(apiUrl, authorizationToken, bucket.bucketId);

    // 4. Uploader le fichier
    const uploadResult = await uploadToB2(
      uploadUrlData.uploadUrl,
      uploadUrlData.authorizationToken,
      filePath,
      imageBuffer,
      contentType
    );

    // Construire l'URL finale via Cloudflare CDN avec le format Friendly URL B2
    // Format: https://cdn.votredomaine.com/file/bucket-name/folder/filename.jpg
    const publicUrl = `${cloudflareCdnUrl.replace(/\/$/, '')}/file/${bucketName}/${filePath}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: publicUrl,
        publicId: uploadResult.fileId,
        fileName: filePath,
        size: uploadResult.contentLength
      })
    };

  } catch (error) {
    console.error('Erreur upload B2:', error);
    console.error('Stack trace:', error.stack);
    
    // S'assurer que le message d'erreur est toujours du JSON valide
    const errorMessage = error.message || 'Erreur inconnue lors de l\'upload';
    const errorResponse = {
      error: 'Erreur upload',
      message: errorMessage
    };
    
    try {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(errorResponse)
      };
    } catch (jsonError) {
      // En cas d'erreur lors de la sérialisation JSON (ne devrait jamais arriver)
      console.error('Erreur critique lors de la création de la réponse JSON:', jsonError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Erreur serveur',
          message: 'Une erreur inattendue s\'est produite'
        })
      };
    }
  }
};


