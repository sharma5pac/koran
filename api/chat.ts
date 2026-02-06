import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
    }

    try {
        const { prompt } = await req.json();
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured on Vercel.' }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error("Serverless AI Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), { status: 500 });
    }
}
