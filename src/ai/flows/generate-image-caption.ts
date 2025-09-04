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
  input: {schema: GenerateImageCaptionInputSchema},
  output: {schema: GenerateImageCaptionOutputSchema},
  prompt: `You are a professional travel blogger with a knack for storytelling. Your goal is to write a medium-length travel blog style text (4–6 sentences) based on the provided image description.

Your writing style should be human, relaxed, engaging, and inspiring, as if you're sharing a travel memory with a friend.

Your caption must:
1.  Clearly describe what is shown in the image.
2.  Mention the name of the city or landmark.
3.  Add 2-3 interesting historical, cultural, or geographical facts about this place.
4.  Be in the same language as the provided Image Context.
5.  Not include any hashtags or emojis.

Description: {{{imageDescription}}}`,
});

const generateImageCaptionFlow = ai.defineFlow(
  {
    name: 'generateImageCaptionFlow',
    inputSchema: GenerateImageCaptionInputSchema,
    outputSchema: GenerateImageCaptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
