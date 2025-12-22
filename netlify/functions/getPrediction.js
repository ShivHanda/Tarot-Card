// netlify/functions/getPrediction.js
exports.handler = async (event) => {
    // Forcefully env variable ko read karna
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY || API_KEY.length < 10) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Key not found or too short" }) 
        };
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body
        });

        const data = await response.json();
        
        // Agar Google ne error bheja hai toh use directly pass karein
        if (data.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: data.error })
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Server side crash", details: error.message }) 
        };
    }
};
