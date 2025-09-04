import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const geminiPro = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [
    googleAI({
      // apiKey: process.env.GEMINI_API_KEY, // Uncomment to use a specific API key
    }),
  ],
});
