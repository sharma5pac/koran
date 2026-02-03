
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI service
// NOTE: This uses the direct Google AI API, which often has a free tier that doesn't strictly require a credit card in some regions/usages.
// HOWEVER, it works best with a dedicated API Key from AI Studio.
// We are temporarily trying the unused Firebase API key, but the User might need to generate a new one at aistudio.google.com if this fails.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const getModel = () => {
    try {
        if (!API_KEY) return null;
        const genAI = new GoogleGenerativeAI(API_KEY);
        return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (e) {
        console.error("AI Initialization Error:", e);
        return null;
    }
};

// Lazily get the model inside the functions instead of top-level
let cachedModel: any = null;
const getCachedModel = () => {
    if (!cachedModel) cachedModel = getModel();
    return cachedModel;
};

/**
 * Explains a specific verse from the Quran.
 * @param surahName Name of the Surah
 * @param verseNumber Verse number
 * @param verseText Arabic text of the verse
 */
export const explainVerse = async (surahName: string, verseNumber: number, verseText: string) => {
    try {
        const prompt = `You are a knowledgeable Quranic scholar. Provide a VERY BRIEF, short, and spiritual insight (Tafsir) for Verse ${verseNumber} of Surah ${surahName}. 
        Arabic Text: ${verseText}
        INSTRUCTION: Keep your response extremely concise (max 3 sentences). Focus only on the core spiritual wisdom or context.`;

        const model = getCachedModel();
        if (!model) return "Please add your Gemini API Key to continue.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Explanation Error:', error);
        if (error.message?.includes('API key not valid') || error.message?.includes('blocked')) {
            return "Please create a free API Key at https://aistudio.google.com/app/apikey (no credit card needed) and update services/aiService.ts";
        }
        throw error;
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

Question: ${question}`;

        const model = getCachedModel();
        if (!model) return "ERROR: No Gemini API Key found. Please add EXPO_PUBLIC_GEMINI_API_KEY to your environment variables.";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        const errMsg = error.message || '';

        if (errMsg.includes('API key not valid')) {
            return "ERROR: Your Gemini API Key is invalid. Please update it in your Vercel Environment Variables or services/aiService.ts.";
        }
        if (errMsg.includes('429') || errMsg.includes('quota')) {
            return "ERROR: AI Quota exceeded. Using the free tier? Try again in a minute, or check your usage at AI Studio.";
        }
        if (errMsg.includes('blocked') || errMsg.includes('safety')) {
            return "ERROR: My apologies, but I cannot answer this specific question due to safety filters. Please ask something else.";
        }

        return "I'm sorry, I'm having trouble connecting to my divine knowledge base right now. Please try again or check your API key.";
    }
};
