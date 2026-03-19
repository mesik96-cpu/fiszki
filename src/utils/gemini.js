export const callGeminiApi = async (apiKey, model, contents, systemInstruction = null) => {
    if (!apiKey) throw new Error("Brak klucza API Gemini");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = { contents };

    if (systemInstruction) {
        payload.system_instruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        const errMsg = data.error?.message || response.statusText;
        throw new Error(`Błąd API: ${errMsg}`);
    }

    const candidates = data.candidates || [];
    if (candidates.length === 0) {
        const blockReason = data.promptFeedback?.blockReason;
        if (blockReason) throw new Error(`Google zablokowało odpowiedź. Powód: ${blockReason}`);
        throw new Error("Pusta odpowiedź od AI.");
    }

    const candidate = candidates[0];
    if (candidate.finishReason === "SAFETY") {
        throw new Error("Odpowiedź AI zablokowana przez filtry bezpieczeństwa Google.");
    }

    const text = candidate.content?.parts?.[0]?.text;
    if (!text) throw new Error("Pusty tekst odpowiedzi AI.");

    return text;
};
