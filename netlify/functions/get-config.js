exports.handler = async (event, context) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const placeId = '0x12b44191280072c5:0x4ca0a65562f95654';
    
    try {
        // Récupérer les avis depuis l'API Google
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            const reviews = data.result.reviews || [];
            const formattedReviews = reviews.map(review => ({
                name: review.author_name,
                text: review.text,
                rating: review.rating,
                date: new Date(review.time * 1000).getFullYear().toString()
            }));
            
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
                    success: true
                })
            };
        } else {
            throw new Error('Erreur API Google: ' + data.status);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des avis:', error);
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
                error: error.message
            })
        };
    }
};
