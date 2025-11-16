exports.handler = async (event, context) => {
  // Vérifier que la requête vient bien de votre domaine
  const referer = event.headers.referer || event.headers.Referer || '';
  const allowedDomains = [
    'photographemonsieurcrocodeal.netlify.app',
    'monsieurcrocodealphotographie.netlify.app',
    'code-site-webmaximev2.netlify.app',
    'localhost:8888'
  ];
  
  const isAllowed = allowedDomains.some(domain => referer.includes(domain));
  
  if (!isAllowed && referer) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/javascript' },
      body: 'console.error("Accès non autorisé");'
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;

  if (!cloudName || !apiKey) {
    console.error('Variables Cloudinary manquantes');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/javascript' },
      body: 'console.error("Configuration Cloudinary manquante");'
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    },
    body: `
      (function() {
        window.CLOUDINARY_CONFIG = {
          cloud_name: '${cloudName}',
          api_key: '${apiKey}'
        };
      })();
    `
  };
};






