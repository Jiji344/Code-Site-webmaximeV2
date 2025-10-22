exports.handler = async (event, context) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // Place ID à trouver - pour l'instant on va utiliser une recherche par nom
    const businessName = 'Monsieur Crocodeal Photographie';
    const businessLocation = 'France'; // ou votre ville spécifique
    
    console.log('🔍 Debug - API Key exists:', !!apiKey);
    console.log('🔍 Debug - Business Name:', businessName);
    
    if (!apiKey) {
        console.error('❌ GOOGLE_API_KEY not found in environment variables');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET'
            },
            body: JSON.stringify({
                reviews: [],
                success: false,
                error: 'API Key not configured'
            })
        };
    }
    
    try {
        console.log('🔄 Recherche de l\'établissement...');
        
        // Étape 1: Rechercher l'établissement par nom
        const searchResponse = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(businessName + ' ' + businessLocation)}&key=${apiKey}`);
        const searchData = await searchResponse.json();
        
        console.log('📊 Résultats de recherche:', searchData);
        
        if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
            // Prendre le premier résultat (le plus pertinent)
            const place = searchData.results[0];
            const placeId = place.place_id;
            
            console.log('✅ Établissement trouvé:', place.name, 'Place ID:', placeId);
            
            // Étape 2: Récupérer les avis avec le bon Place ID
            console.log('🔄 Récupération des avis...');
            const detailsResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`);
            const detailsData = await detailsResponse.json();
            
            console.log('📊 Détails de l\'établissement:', detailsData);
            
            if (detailsData.status === 'OK') {
                const reviews = detailsData.result.reviews || [];
                const formattedReviews = reviews.map(review => ({
                    name: review.author_name,
                    text: review.text,
                    rating: review.rating,
                    date: new Date(review.time * 1000).getFullYear().toString()
                }));
                
                console.log('✅ Avis récupérés:', formattedReviews.length);
                
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET'
                    },
                    body: JSON.stringify({
                        reviews: formattedReviews,
                        success: true,
                        placeInfo: {
                            name: place.name,
                            placeId: placeId,
                            address: place.formatted_address
                        }
                    })
                };
            } else {
                throw new Error('Erreur lors de la récupération des détails: ' + detailsData.status);
            }
        } else {
            throw new Error('Établissement non trouvé: ' + (searchData.error_message || 'Aucun résultat'));
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des avis:', error);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET'
            },
            body: JSON.stringify({
                reviews: [],
                success: false,
                error: error.message,
                debug: {
                    apiKeyExists: !!apiKey,
                    businessName: businessName,
                    businessLocation: businessLocation
                }
            })
        };
    }
};
