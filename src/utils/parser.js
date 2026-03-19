export function parseChatVocabulary(text) {
    const items = [];
    if (!text) return items;

    // Remove markdown code blocks
    const cleanText = text.replace(/```[a-z]*\n?|```/gi, '').trim();
    const lines = cleanText.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        // Remove markdown list numbers and bullet points (e.g "1. ", "- ", etc)
        line = line.replace(/^(\d+\.|[#*•-])\s*/, '').trim();
        if (!line) continue;

        let parts = [];
        // Support multiple delimiters: |, -, : with any spacing
        if (line.includes('|')) {
            parts = line.split('|').map(p => p.trim());
        } else if (line.includes(' - ')) {
            parts = line.split(' - ').map(p => p.trim());
        } else if (line.includes(' : ')) {
            parts = line.split(' : ').map(p => p.trim());
        }

        if (parts.length >= 2) {
            let category = "Ogólne";
            let word, translation, example, example_pl;

            if (parts.length >= 5) {
                // Formatting: CATEGORY | WORD | TRANSLATION | EX | EX_PL
                category = parts[0];
                word = parts[1];
                translation = parts[2];
                example = parts[3];
                example_pl = parts[4];
            } else {
                // Formatting: WORD | TRANSLATION | ... (fallback)
                word = parts[0];
                translation = parts[1];
                example = parts.length > 2 ? parts[2] : "";
                example_pl = parts.length > 3 ? parts[3] : "";
            }

            if (word && translation) {
                const cleanWord = word.replace(/\*|_|"/g, '').trim();
                const cleanTrans = translation.replace(/\*|_|"/g, '').trim();

                // Skip headers or meta-text
                const lowerWord = cleanWord.toLowerCase();
                if (lowerWord === "słówko" || lowerWord === "word" || lowerWord === "brak" || lowerWord.includes("kategoria")) continue;

                if (cleanWord.length >= 1 && cleanTrans.length >= 1) {
                    items.push({
                        category: (category || "Ogólne").replace(/\*|_|"/g, '').trim(),
                        word: cleanWord,
                        translation: cleanTrans,
                        example: (example || "").replace(/\*|_|"/g, '').trim(),
                        example_pl: (example_pl || "").replace(/\*|_|"/g, '').trim()
                    });
                }
            }
        }
    }

    return items;
}
