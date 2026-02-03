
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI service
// NOTE: This uses the direct Google AI API, which often has a free tier that doesn't strictly require a credit card in some regions/usages.
// HOWEVER, it works best with a dedicated API Key from AI Studio.
// We are temporarily trying the unused Firebase API key, but the User might need to generate a new one at aistudio.google.com if this fails.
const API_KEY = "AIzaSyCb6TW4k_WQd8iF2aaWBCGVTMnU8ktrP1Y";

const genAI = new GoogleGenerativeAI(API_KEY);

// Using gemini-1.5-flash with the project key
// Using gemini-flash-latest as it is compatible with this key
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        if (error.message?.includes('API key not valid') || error.message?.includes('blocked')) {
            return "Please create a free API Key at https://aistudio.google.com/app/apikey (no credit card needed) and update services/aiService.ts";
        }
        throw error;
    }
};
