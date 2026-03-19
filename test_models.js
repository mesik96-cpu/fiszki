const apiKey = process.env.VITE_GEMINI_API_KEY; // I'll pass this via CLI

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
}

listModels();
