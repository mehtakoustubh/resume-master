const { PDFPlumber } = require('node-pdfplumber');

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
        
        // Open PDF with node-pdfplumber
        const pdf = await PDFPlumber.fromBuffer(buffer);
        
        let fullText = '';
        let pageCount = pdf.pageCount || 0;
        
        // Extract text from all pages
        for (let i = 0; i < pageCount; i++) {
            const page = pdf.pages[i];
            const text = await page.extractText();
            if (text) {
                fullText += text + '\n';
            }
        }
        
        // Clean up
        pdf.close();
        
        // Extract name from first non-empty line
        const lines = fullText.split('\n').filter(line => line.trim());
        let name = 'Unknown';
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            if (firstLine.length > 0 && firstLine.length < 100) {
                name = firstLine;
            }
        }
        
        console.log(`✅ PDF parsed: ${filename || 'unknown'} (${pageCount} pages, ${fullText.length} chars)`);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                text: fullText,
                name: name,
                pages: pageCount,
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