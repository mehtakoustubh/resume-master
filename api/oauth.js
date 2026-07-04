// Vercel Serverless Function - GitHub OAuth
export default async function handler(req, res) {
    console.log('🔐 OAuth function called');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(204)
            .setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Headers', 'Content-Type')
            .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            .end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code, redirect_uri } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'No code provided' });
        }

        // Get your Vercel URL
        const VERCEL_URL = process.env.VERCEL_URL || 'resume-master-tau.vercel.app';
        const redirectUri = redirect_uri || `https://${VERCEL_URL}/callback.html`;

        console.log('🔄 Exchanging code for token...');
        console.log('📡 Redirect URI:', redirectUri);

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
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('❌ OAuth error:', data);
            return res.status(400).json({ error: data.error_description || data.error });
        }

        console.log('✅ OAuth successful');
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ OAuth error:', error);
        return res.status(500).json({ error: error.message });
    }
};