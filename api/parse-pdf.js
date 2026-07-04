// Vercel Serverless Function - PDF Parsing
import { PDFPlumber } from 'node-pdfplumber';

export default async function handler(req, res) {
    console.log('📄 PDF Parse function called');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(204)
            .setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Headers', 'Content-Type')
            .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            .end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { file, filename } = req.body;
        
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
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
        
        return res.status(200).json({
            success: true,
            text: fullText,
            name: name,
            pages: pageCount,
            filename: filename || 'unknown'
        });
        
    } catch (error) {
        console.error('❌ PDF parsing error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to parse PDF'
        });
    }
};