exports.handler = async (event, context) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const placeId = '0x12b44191280072c5:0x4ca0a65562f95654';
    
    console.log('🔍 Debug - API Key exists:', !!apiKey);
    console.log('🔍 Debug - Place ID:', placeId);
    
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
        console.log('🔄 Fetching reviews from Google API...');
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`);
        const data = await response.json();
        
        console.log('📊 Google API Response Status:', data.status);
        console.log('📊 Google API Response:', JSON.stringify(data, null, 2));
        
        if (data.status === 'OK') {
            const reviews = data.result.reviews || [];
            console.log('📝 Found reviews:', reviews.length);
            
            const formattedReviews = reviews.map(review => ({
                name: review.author_name,
                text: review.text,
                rating: review.rating,
                date: new Date(review.time * 1000).getFullYear().toString()
            }));
            
            console.log('✅ Formatted reviews:', formattedReviews.length);
            
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
                    debug: {
                        apiStatus: data.status,
                        reviewsCount: reviews.length
                    }
                })
            };
        } else {
            console.error('❌ Google API Error:', data.status, data.error_message);
            throw new Error(`Erreur API Google: ${data.status} - ${data.error_message || 'Unknown error'}`);
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
                    placeId: placeId
                }
            })
        };
    }
};
