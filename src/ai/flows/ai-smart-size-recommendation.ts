'use server';
/**
 * @fileOverview A Genkit flow for an AI Smart Size Advisor.
 *
 * - smartSizeRecommendation - A function that handles the AI-powered clothing size recommendation process.
 * - SmartSizeRecommendationInput - The input type for the smartSizeRecommendation function.
 * - SmartSizeRecommendationOutput - The return type for the smartSizeRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartSizeRecommendationInputSchema = z.object({
  heightCm: z.number().describe('The user\'s height in centimeters.'),
  weightKg: z.number().describe('The user\'s weight in kilograms.'),
  gender: z.enum(['male', 'female', 'other']).describe('The user\'s gender.'),
  desiredFit: z.enum(['tight', 'regular', 'loose']).describe('The user\'s desired clothing fit.'),
});
export type SmartSizeRecommendationInput = z.infer<typeof SmartSizeRecommendationInputSchema>;

const SmartSizeRecommendationOutputSchema = z.object({
  recommendedSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']).describe('The AI-recommended clothing size.'),
  explanation: z.string().describe('A brief explanation for the recommended size.'),
});
export type SmartSizeRecommendationOutput = z.infer<typeof SmartSizeRecommendationOutputSchema>;

export async function smartSizeRecommendation(input: SmartSizeRecommendationInput): Promise<SmartSizeRecommendationOutput> {
  return smartSizeRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartSizeRecommendationPrompt',
  input: { schema: SmartSizeRecommendationInputSchema },
  output: { schema: SmartSizeRecommendationOutputSchema },
  prompt: `You are an AI-powered smart size advisor for clothing.
Your task is to recommend the optimal clothing size (XS, S, M, L, XL, XXL) based on the user's provided details.

Here are the user's details:
- Height: {{{heightCm}}} cm
- Weight: {{{weightKg}}} kg
- Gender: {{{gender}}}
- Desired Fit: {{{desiredFit}}}

Consider these factors carefully and provide a recommended size and a concise explanation for your choice.
Be precise and consider the nuances of how height, weight, gender, and desired fit influence clothing size.`,
});

const smartSizeRecommendationFlow = ai.defineFlow(
  {
    name: 'smartSizeRecommendationFlow',
    inputSchema: SmartSizeRecommendationInputSchema,
    outputSchema: SmartSizeRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
