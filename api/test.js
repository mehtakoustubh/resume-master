// Vercel Serverless Function - Test
export default async function handler(req, res) {
    console.log('✅ Test function called!');
    
    return res.status(200).json({
        message: 'Vercel function is working! 🎉',
        time: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers
    });
};