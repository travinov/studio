'use server';
/**
 * @fileOverview Generates relevant hashtags for an image using AI.
 *
 * - generateRelevantHashtags - A function that generates relevant hashtags for an image.
 * - GenerateRelevantHashtagsInput - The input type for the generateRelevantHashtags function.
 * - GenerateRelevantHashtagsOutput - The return type for the generateRelevantHashtags function.
 */

import {ai, geminiPro} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRelevantHashtagsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a subject, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the image.'),
});
export type GenerateRelevantHashtagsInput = z.infer<typeof GenerateRelevantHashtagsInputSchema>;

const GenerateRelevantHashtagsOutputSchema = z.object({
  hashtags: z.array(z.string()).describe('An array of relevant hashtags for the image.'),
});
export type GenerateRelevantHashtagsOutput = z.infer<typeof GenerateRelevantHashtagsOutputSchema>;

export async function generateRelevantHashtags(input: GenerateRelevantHashtagsInput): Promise<GenerateRelevantHashtagsOutput> {
  return generateRelevantHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRelevantHashtagsPrompt',
  input: {schema: GenerateRelevantHashtagsInputSchema},
  output: {schema: GenerateRelevantHashtagsOutputSchema},
  prompt: `You are an expert in social media marketing, specializing in hashtag generation for Instagram.

  Based on the image and its description, generate a list of relevant hashtags to maximize the visibility of the post.

  Image Description: {{{description}}}
  Image: {{media url=photoDataUri}}

  Hashtags:`,
});

const generateRelevantHashtagsFlow = ai.defineFlow(
  {
    name: 'generateRelevantHashtagsFlow',
    inputSchema: GenerateRelevantHashtagsInputSchema,
    outputSchema: GenerateRelevantHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      model: geminiPro,
      input,
    });
    return output!;
  }
);
