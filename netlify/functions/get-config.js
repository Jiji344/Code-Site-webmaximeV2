exports.handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET'
        },
        body: JSON.stringify({
            googleApiKey: process.env.GOOGLE_API_KEY
        })
    };
};
