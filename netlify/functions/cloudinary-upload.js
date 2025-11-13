const fetch = require('node-fetch');

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
    const { imageBase64, folder, publicId } = JSON.parse(event.body);
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    // Utiliser le preset depuis les variables d'environnement, ou 'ml_default' par défaut
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    if (!cloudName) {
      throw new Error('Configuration Cloudinary manquante: CLOUDINARY_CLOUD_NAME non défini');
    }

    if (!uploadPreset) {
      throw new Error('Upload preset Cloudinary manquant: CLOUDINARY_UPLOAD_PRESET non défini');
    }

    // Upload vers Cloudinary avec le preset unsigned
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const formData = new URLSearchParams();
    formData.append('file', `data:image/jpeg;base64,${imageBase64}`);
    formData.append('upload_preset', uploadPreset);
    
    if (folder) {
      formData.append('folder', folder);
    }
    
    if (publicId) {
      formData.append('public_id', publicId);
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur Cloudinary: ${errorText}`;
      
      // Message d'erreur plus clair pour le preset manquant
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message && errorJson.error.message.includes('preset')) {
          errorMessage = `Preset Cloudinary "${uploadPreset}" introuvable. Vérifiez que le preset existe dans votre dashboard Cloudinary et que CLOUDINARY_UPLOAD_PRESET est correctement configuré dans Netlify.`;
        }
      } catch (e) {
        // Garder le message d'erreur original si le parsing échoue
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erreur upload',
        message: error.message 
      })
    };
  }
};

