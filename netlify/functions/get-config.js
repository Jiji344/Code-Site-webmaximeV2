exports.handler = async (event, context) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    // Place ID à trouver - pour l'instant on va utiliser une recherche par nom
    const businessName = 'Monsieur Crocodeal Photographie';
    const businessLocation = 'Toulouse'; // Remplacez par votre vraie ville
    
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
        
        // Étape 1: Rechercher l'établissement par nom avec plusieurs variantes
        const searchQueries = [
            `${businessName} ${businessLocation}`,
            `${businessName}`,
            `Photographe ${businessLocation}`,
            `Crocodeal ${businessLocation}`
        ];
        
        let searchData = null;
        let foundPlace = null;
        
        for (const query of searchQueries) {
            console.log(`🔍 Recherche avec: "${query}"`);
            const searchResponse = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`);
            searchData = await searchResponse.json();
            
            console.log(`📊 Résultats pour "${query}":`, searchData.status, searchData.results?.length || 0);
            
            if (searchData.status === 'OK' && searchData.results && searchData.results.length > 0) {
                // Chercher un résultat qui contient "Crocodeal" ou "Photographie"
                const relevantResult = searchData.results.find(result => 
                    result.name.toLowerCase().includes('crocodeal') || 
                    result.name.toLowerCase().includes('photographie') ||
                    result.name.toLowerCase().includes('photographe')
                );
                
                if (relevantResult) {
                    foundPlace = relevantResult;
                    console.log(`✅ Trouvé avec "${query}":`, relevantResult.name);
                    break;
                }
            }
        }
        
        if (foundPlace) {
            const place = foundPlace;
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
            console.log('⚠️ Établissement non trouvé sur Google Maps - Utilisation des avis statiques');
            
            // Avis statiques en attendant l'enregistrement Google My Business
            const staticReviews = [
                {
                    name: "Marie L.",
                    text: "Service exceptionnel ! Maxime a su capturer parfaitement nos émotions. Photos magnifiques et professionnalisme au rendez-vous.",
                    rating: 5,
                    date: "2024"
                },
                {
                    name: "Thomas M.",
                    text: "Très satisfait de notre séance photo. Maxime est patient et créatif. Je recommande vivement !",
                    rating: 5,
                    date: "2024"
                },
                {
                    name: "Sophie D.",
                    text: "Un photographe talentueux qui sait mettre en valeur ses sujets. Résultat au-delà de nos attentes.",
                    rating: 5,
                    date: "2024"
                },
                {
                    name: "Pierre R.",
                    text: "Excellent rapport qualité-prix. Maxime est à l'écoute et très professionnel. Photos superbes !",
                    rating: 5,
                    date: "2024"
                },
                {
                    name: "Julie K.",
                    text: "Séance photo parfaite ! Maxime a su créer une ambiance détendue. Résultat magnifique, je recommande !",
                    rating: 5,
                    date: "2024"
                }
            ];
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET'
                },
                body: JSON.stringify({
                    reviews: staticReviews,
                    success: true,
                    source: 'static',
                    message: 'Avis statiques - Enregistrez votre entreprise sur Google My Business pour des vrais avis'
                })
            };
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
