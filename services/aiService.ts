/**
 * NurAI Chat Service
 * 
 * This service now uses a secure backend proxy (/api/chat) to talk to Gemini.
 * This prevents our API keys from being visible in the browser/frontend code.
 */

/**
 * Explains a specific verse from the Quran.
 */
export const explainVerse = async (surahName: string, verseNumber: number, verseText: string) => {
    try {
        const prompt = `You are a knowledgeable Quranic scholar. Provide a VERY BRIEF, short, and spiritual insight (Tafsir) for Verse ${verseNumber} of Surah ${surahName}. 
        Arabic Text: ${verseText}
        INSTRUCTION: Keep your response extremely concise (max 3 sentences). Focus only on the core spiritual wisdom or context.
        MANDATORY: Respond in the same language used by the user in their request.`;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to connect to AI');
        }

        const data = await response.json();
        return data.text;
    } catch (error: any) {
        console.error('AI Explanation Error:', error);
        return `I'm sorry, I'm having trouble with my knowledge base. (Error: ${error.message || 'Unknown'}).`;
    }
};

/**
 * Answers a general question about the Quran.
 */
export const askQuranAI = async (question: string) => {
    try {
        const prompt = `You are NurAI, a concise Quranic assistant.
GUIDELINES:
1. MANDATORY: Keep your response very short, brief, and to the point.
2. Use minimal formatting.
3. Use blockquotes (>) for direct translations.
4. IMPORTANT: Always format references as [[Surah Name:Verse Number]] (e.g., [[Surah Al-Baqarah:255]]).
5. Aim for a total response length that is very brief and concise (max 1-2 small paragraphs).
6. MANDATORY: Respond in the same language used by the user (e.g., if they ask in Arabic, reply in Arabic).

Question: ${question}`;

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to connect to AI');
        }

        const data = await response.json();
        return data.text;
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        const errMsg = error.message || '';

        return `I'm sorry, I'm having trouble connecting to my divine knowledge base. (Error: ${errMsg || 'Unknown error'}). Please check your Vercel Environment Variables if this persists.`;
    }
};
