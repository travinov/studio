'use server';

/**
 * @fileOverview AI-powered image caption generator.
 *
 * - generateImageCaption - A function that generates a relevant caption for an image.
 * - GenerateImageCaptionInput - The input type for the generateImagecaption function.
 * - GenerateImageCaptionOutput - The return type for the generateImageCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateImageCaptionInputSchema = z.object({
  imageDescription: z
    .string()
    .describe('A description of the image to generate a caption for.'),
});
export type GenerateImageCaptionInput = z.infer<typeof GenerateImageCaptionInputSchema>;

const GenerateImageCaptionOutputSchema = z.object({
  caption: z.string().describe('A relevant caption for the image.'),
});
export type GenerateImageCaptionOutput = z.infer<typeof GenerateImageCaptionOutputSchema>;

export async function generateImageCaption(input: GenerateImageCaptionInput): Promise<GenerateImageCaptionOutput> {
  return generateImageCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageCaptionPrompt',
  input: { schema: GenerateImageCaptionInputSchema },
  output: { schema: GenerateImageCaptionOutputSchema },
  prompt: `You are a professional travel blogger. Based on the provided image description, write a medium-length travel blog style text (4–6 sentences) that clearly describes what is shown in the image, mentions the name of the city or landmark, adds 2–3 interesting historical, cultural, or geographical facts about this place, and keeps the tone engaging, inspiring, easy to read, with a more human and relaxed storytelling style, use emojis but without including hashtags. Detect lamguage and written in the same language as the Image description: {{{imageDescription}}}`,
  model: googleAI.model('gemini-1.5-flash-latest'),
});

const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema,
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }
    return output;
  }
);
