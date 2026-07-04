// Vercel Serverless Function - CrewAI Proxy
export default async function handler(req, res) {
    console.log('🚀 CrewAI Proxy function called');
    console.log('📝 Method:', req.method);
    console.log('📝 Path:', req.url);

    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            .end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed. Use POST.' 
        });
    }

    try {
        // Your CrewAI credentials
        const CREWAI_API_URL = 'https://resume-screening-platform-v1-575d3ff6-3f24--ff3ea2f1.crewai.com';
        const CREWAI_API_KEY = 'cd19e1ca8d33';
        const CREWAI_ORG_ID = '7f687ea5-3f59-47a8-875c-5a9d07a3cb83';
        
        // Get the request body
        const requestBody = req.body;
        
        console.log('📡 Proxying request to CrewAI...');
        console.log('📡 URL:', CREWAI_API_URL);
        
        // Forward the request to CrewAI
        const response = await fetch(`${CREWAI_API_URL}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CREWAI_API_KEY}`,
                'X-Crewai-Organization-Id': CREWAI_ORG_ID
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 CrewAI Response Status:', response.status);
        
        // Get the response
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { html: text };
        }
        
        // If the response is not OK, return the error
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data,
                status: response.status,
                statusText: response.statusText
            });
        }

        // Return the successful response
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ Proxy error:', error);
        return res.status(500).json({ 
            error: error.message,
            message: 'Internal proxy error'
        });
    }
};