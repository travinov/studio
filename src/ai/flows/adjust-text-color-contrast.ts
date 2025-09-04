'use server';
/**
 * @fileOverview An AI agent that adjusts text color and contrast based on the image background for optimal legibility.
 *
 * - adjustTextColorContrast - A function that handles the text color/contrast adjustment process.
 * - AdjustTextColorContrastInput - The input type for the adjustTextColorContrast function.
 * - AdjustTextColorContrastOutput - The return type for the adjustTextColorContrast function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustTextColorContrastInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo with text overlays, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  textColor: z.string().describe('The current color of the text overlay.'),
});
export type AdjustTextColorContrastInput = z.infer<typeof AdjustTextColorContrastInputSchema>;

const AdjustTextColorContrastOutputSchema = z.object({
  adjustedTextColor: z
    .string()
    .describe(
      'The suggested text color that provides optimal contrast with the image background.'
    ),
});
export type AdjustTextColorContrastOutput = z.infer<typeof AdjustTextColorContrastOutputSchema>;

export async function adjustTextColorContrast(
  input: AdjustTextColorContrastInput
): Promise<AdjustTextColorContrastOutput> {
  return adjustTextColorContrastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustTextColorContrastPrompt',
  input: {schema: AdjustTextColorContrastInputSchema},
  output: {schema: AdjustTextColorContrastOutputSchema},
  prompt: `You are an AI assistant that analyzes an image with text overlays and suggests an appropriate text color for optimal contrast and legibility.

Analyze the image provided and consider the current text color: {{{textColor}}}.
Suggest a new text color that will ensure the text is easily readable against the background.

Here is the image to analyze: {{media url=photoDataUri}}

Considerations:
*   Ensure the suggested color is significantly different from the background colors behind the text.
*   Prioritize common color pairings that enhance readability (e.g., white text on a dark background, black text on a light background).
*   If the background has varying lightness, suggest a color that works well across the majority of the background.
`,
});

const adjustTextColorContrastFlow = ai.defineFlow(
  {
    name: 'adjustTextColorContrastFlow',
    inputSchema: AdjustTextColorContrastInputSchema,
    outputSchema: AdjustTextColorContrastOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      model: geminiPro,
      input,
    });
    return output!;
  }
);
