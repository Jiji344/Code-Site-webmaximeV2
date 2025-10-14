const axios = require('axios');

exports.handler = async (event, context) => {
    // Récupérer le nom de la section depuis les paramètres de la requête (ex: portrait, paysage, etc.)
    const section = event.queryStringParameters.section;

    // Vérifie que le paramètre 'section' est bien présent
    if (!section) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Le paramètre "section" est requis' }),
        };
    }

    // Construire l'URL de l'API GitHub pour récupérer les fichiers du dossier spécifique
    const apiUrl = `https://api.github.com/repos/Jiji344/Code-Site-webmaximeV2/contents/content/portfolio/${section}`;

    try {
        // Effectuer la requête GET à l'API GitHub pour obtenir les fichiers du portfolio
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`,  // Utiliser un token GitHub valide
            },
        });

        // Retourner une réponse réussie avec les données récupérées
        return {
            statusCode: 200,
            body: JSON.stringify(response.data),  // Données sous forme JSON
            headers: {
                'Access-Control-Allow-Origin': '*',  // Autoriser les appels depuis n'importe quelle origine (CORS)
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        // Gestion des erreurs si l'API GitHub retourne un problème
        console.error('Erreur lors de la récupération des fichiers GitHub:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur lors de la récupération des fichiers Markdown' }),
        };
    }
};
