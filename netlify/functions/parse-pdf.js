// netlify/functions/parse-pdf.js
const pdfParse = require('pdf-parse');

exports.handler = async function(event, context) {
    // Handle OPTIONS preflight
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
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { file, filename } = JSON.parse(event.body);
        
        if (!file) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'No file provided' })
            };
        }

        console.log(`📄 Processing PDF: ${filename || 'unnamed'}`);
        
        // Convert base64 to buffer
        const buffer = Buffer.from(file, 'base64');
        
        // Parse PDF with pdf-parse
        const data = await pdfParse(buffer);
        
        // Extract name from first non-empty line
        const lines = data.text.split('\n').filter(line => line.trim());
        let name = 'Unknown';
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine.length > 0 && firstLine.length < 100) {
                name = firstLine;
            }
        }
        
        console.log(`✅ PDF parsed: ${filename || 'unknown'} (${data.numpages} pages, ${data.text.length} chars)`);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                text: data.text,
                name: name,
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
                error: error.message || 'Failed to parse PDF'
            })
        };
    }
};