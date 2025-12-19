// netlify/functions/getPrediction.js
exports.handler = async (event) => {
    try {
        const { prompt } = JSON.parse(event.body);
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "API Key missing in Netlify Dashboard" })
            };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
            body: JSON.stringify({ error: "Function failed", details: error.message })
        };
    }
};
