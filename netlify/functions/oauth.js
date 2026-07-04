// netlify/functions/oauth.js
exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

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

        console.log('🔄 Exchanging code for token...');

        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'Ov23liJgU37OwHPDdT1l',  // ← NEW Client ID
                client_secret: '24b5e9033a16e581cdf93e9177b005470231a6ea',  // ← NEW Client Secret
                code: code,
                redirect_uri: redirect_uri || 'https://cerulean-cendol-f25f21.netlify.app/callback.html'
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