
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

/**
 * Genkit instance initialization.
 * Uses a safe fallback for the API key to prevent build-time or startup crashes.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey || 'missing-api-key',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
