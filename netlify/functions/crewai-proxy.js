// Netlify function to proxy CrewAI API calls
exports.handler = async function(event, context) {
    console.log('🚀 CrewAI Proxy function called');
    console.log('📝 Method:', event.httpMethod);
    console.log('📝 Path:', event.path);
    
    // Handle OPTIONS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            }
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Method not allowed. Use POST.' 
            })
        };
    }

    try {
        // Your CrewAI credentials
        const CREWAI_API_URL = 'https://resume-screening-platform-v1-575d3ff6-3f24--ff3ea2f1.crewai.com';
        const CREWAI_API_KEY = 'cd19e1ca8d33';
        const CREWAI_ORG_ID = '7f687ea5-3f59-47a8-875c-5a9d07a3cb83';
        
        // Get the request body
        const requestBody = JSON.parse(event.body);
        
        console.log('📡 Proxying request to CrewAI...');
        console.log('📡 URL:', CREWAI_API_URL);
        console.log('📡 Body:', JSON.stringify(requestBody, null, 2));
        
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
        console.log('📡 CrewAI Response Headers:', Object.fromEntries(response.headers));
        
        // Get the response and normalize non-JSON bodies to a JSON object
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { html: text };
        }
        
        console.log('📡 CrewAI Response Data:', data);
        
        // If the response is not OK, return the error
        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: data,
                    status: response.status,
                    statusText: response.statusText,
                    url: CREWAI_API_URL
                })
            };
        }

        // Return the successful response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('❌ Proxy error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                error: error.message,
                stack: error.stack,
                message: 'Internal proxy error'
            })
        };
    }
};