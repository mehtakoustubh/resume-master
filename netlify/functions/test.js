exports.handler = async function(event, context) {
    console.log('✅ Test function called!');
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Netlify function is working! 🎉',
            time: new Date().toISOString(),
            path: event.path,
            method: event.httpMethod,
            headers: event.headers
        })
    };
};