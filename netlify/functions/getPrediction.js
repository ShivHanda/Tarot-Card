// netlify/functions/getPrediction.js
exports.handler = async (event) => {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "API Key missing in Netlify Dashboard" }) 
        };
    }

    // Google Gemini API v1 URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body // Frontend se bheja JSON payload yahan se jayega
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Server Error", message: error.message }) 
        };
    }
};
