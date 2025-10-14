const axios = require('axios');  // Utilisation d'Axios pour faire des requêtes HTTP

const { GITHUB_TOKEN } = process.env;  // Récupérer le token GitHub depuis les variables d'environnement de Netlify

exports.handler = async (event, context) => {
    const section = event.queryStringParameters.section;  // On récupère la section demandée (portrait, mariage, etc.)
    const apiUrl = `https://api.github.com/repos/Jiji344/Code-Site-webmaximeV2/contents/content/portfolio/${section}`;

    try {
        // Requête à l'API GitHub avec authentification via le token
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`  // Utilisation du token GitHub pour l'authentification
            }
        });

        // Retourner les fichiers récupérés par GitHub sous forme de JSON
        return {
            statusCode: 200,
            body: JSON.stringify(response.data)  // On retourne les données JSON contenant les fichiers Markdown
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des fichiers GitHub:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur serveur' })  // Retourner une erreur serveur en cas de problème
        };
    }
};
