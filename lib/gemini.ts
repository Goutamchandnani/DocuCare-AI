import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';

if (!GOOGLE_GEMINI_API_KEY) {
  console.warn('GOOGLE_GEMINI_API_KEY is not set. Gemini API will not be available.');
}

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);

export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
