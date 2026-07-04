// netlify/functions/parse-pdf.js
const pdf = require('pdf-parse');

exports.handler = async function(event, context) {
    console.log('📄 PDF Parse function called');
    
    // Handle OPTIONS preflight request
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
        // Get the file from the request body
        const { file, filename } = JSON.parse(event.body);
        
        if (!file) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'No file provided' 
                })
            };
        }

        console.log(`📄 Parsing PDF: ${filename || 'unnamed'}`);

        // Convert base64 to buffer
        const buffer = Buffer.from(file, 'base64');
        
        // Parse the PDF
        const data = await pdf(buffer);
        
        console.log(`✅ PDF parsed: ${data.numpages} pages, ${data.text.length} characters`);

        // Return the extracted text
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                text: data.text,
                pages: data.numpages,
                info: data.info,
                filename: filename || 'unknown'
            })
        };

    } catch (error) {
        console.error('❌ PDF parsing error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                success: false,
                error: error.message || 'Failed to parse PDF',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};