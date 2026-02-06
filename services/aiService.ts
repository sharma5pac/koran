import { getGenerativeModel, getVertexAI } from "firebase/vertex-ai";
import app from "./firebase";

// Initialize Vertex AI through Firebase
const vertexAI = getVertexAI(app);

const getModel = () => {
    try {
        // No more API key check needed here, it uses Firebase credentials
        return getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });
    } catch (e) {
        console.error("Vertex AI Initialization Error:", e);
        return null;
    }
};

let cachedModel: any = null;
const getCachedModel = () => {
    if (!cachedModel) cachedModel = getModel();
    return cachedModel;
};

/**
 * Explains a specific verse from the Quran.
 */
export const explainVerse = async (surahName: string, verseNumber: number, verseText: string) => {
    try {
        const prompt = `You are a knowledgeable Quranic scholar. Provide a VERY BRIEF, short, and spiritual insight (Tafsir) for Verse ${verseNumber} of Surah ${surahName}. 
        Arabic Text: ${verseText}
        INSTRUCTION: Keep your response extremely concise (max 3 sentences). Focus only on the core spiritual wisdom or context.
        MANDATORY: Respond in the same language used by the user in their request.`;

        const model = getCachedModel();
        if (!model) return "AI service is currently unavailable. Please ensure Vertex AI is enabled in Firebase.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Explanation Error:', error);
        return `I'm sorry, I'm having trouble with my knowledge base. (Error: ${error.message || 'Unknown'}). Please check if Vertex AI is enabled in your Firebase Console.`;
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

        const model = getCachedModel();
        if (!model) return "AI service is currently unavailable. Please ensure Vertex AI is enabled in Firebase.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        const errMsg = error.message || '';

        if (errMsg.includes('403') || errMsg.includes('permission')) {
            return "ERROR: Access Denied. Have you enabled 'Vertex AI for Firebase' in your Firebase Console? It can take 5 minutes to activate.";
        }

        return `I'm sorry, I'm having trouble connecting to my divine knowledge base. (Error: ${errMsg || 'Unknown error'}). Please try again or check your Firebase configuration.`;
    }
};
