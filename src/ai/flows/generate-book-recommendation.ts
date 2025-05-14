// Use server directive is required for all Genkit flows.
'use server';

/**
 * @fileOverview A book recommendation AI agent.
 *
 * - generateBookRecommendation - A function that handles the book recommendation process.
 * - GenerateBookRecommendationInput - The input type for the generateBookRecommendation function.
 * - GenerateBookRecommendationOutput - The return type for the generateBookRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBookRecommendationInputSchema = z.object({
  titles: z.array(z.string()).describe('A list of book titles the user has read or wants to read.'),
  authors: z.array(z.string()).describe('A list of authors the user enjoys reading.'),
  genres: z.array(z.string()).describe('A list of genres the user is interested in.'),
});
export type GenerateBookRecommendationInput = z.infer<
  typeof GenerateBookRecommendationInputSchema
>;

const GenerateBookRecommendationOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of recommended book titles.'),
});
export type GenerateBookRecommendationOutput = z.infer<
  typeof GenerateBookRecommendationOutputSchema
>;

export async function generateBookRecommendation(
  input: GenerateBookRecommendationInput
): Promise<GenerateBookRecommendationOutput> {
  return generateBookRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBookRecommendationPrompt',
  input: {schema: GenerateBookRecommendationInputSchema},
  output: {schema: GenerateBookRecommendationOutputSchema},
  prompt: `You are a book recommendation expert. Based on the user's reading preferences, you will provide a list of recommended book titles.

  The user enjoys the following books: {{titles}}
  The user enjoys the following authors: {{authors}}
  The user enjoys the following genres: {{genres}}

  Please provide a list of book recommendations that the user might enjoy. Only return the book titles.`,
});

const generateBookRecommendationFlow = ai.defineFlow(
  {
    name: 'generateBookRecommendationFlow',
    inputSchema: GenerateBookRecommendationInputSchema,
    outputSchema: GenerateBookRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
