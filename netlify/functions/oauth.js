// Netlify function to handle GitHub OAuth
exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { code, redirect_uri } = JSON.parse(event.body);
        
        if (!code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No code provided' })
            };
        }

        // Exchange code for token
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'Ov23lidNmqhDkj3hgHtg',
                client_secret: '168b493868c5c289ce38fe37ce4d7cfae4c065b0',
                code: code,
                redirect_uri: redirect_uri || 'https://serene-peony-d4f686.netlify.app/callback.html'
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: data.error_description || data.error })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};