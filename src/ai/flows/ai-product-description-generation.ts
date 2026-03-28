'use server';
/**
 * @fileOverview Generates professional, SEO-friendly Uzbek product descriptions for clothing 'Looks' from keywords.
 *
 * - aiProductDescriptionGeneration - A function that handles the AI product description generation process.
 * - AiProductDescriptionGenerationInput - The input type for the aiProductDescriptionGeneration function.
 * - AiProductDescriptionGenerationOutput - The return type for the aiProductDescriptionGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductDescriptionGenerationInputSchema = z.object({
  keywords: z.string().describe('Comma-separated keywords describing the product.'),
  languages: z.array(z.enum(['uz'])).describe('Array of target language codes. Currently only "uz" is supported.'),
});
export type AiProductDescriptionGenerationInput = z.infer<typeof AiProductDescriptionGenerationInputSchema>;

const AiProductDescriptionGenerationOutputSchema = z.record(z.string(), z.string()).describe('An object where keys are language codes and values are the generated product descriptions.');
export type AiProductDescriptionGenerationOutput = z.infer<typeof AiProductDescriptionGenerationOutputSchema>;

const generateProductDescriptionPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {
    schema: z.object({
      keywords: z.string().describe('Comma-separated keywords describing the product.'),
    }),
  },
  output: {
    schema: z.string().describe('The generated product description.'),
  },
  prompt: `Siz kiyim-kechak do'koni uchun professional kopiraytersiz. Berilgan kalit so'zlar asosida kiyim uchun jozibali, SEO-do'st va professional tavsifni o'zbek tilida yarating.\n\nKalit so'zlar: {{{keywords}}}\n\nTavsif kamida 100 ta so'zdan iborat bo'lishi va mijozlarni jalb qilishi kerak.`,
});

const aiProductDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionGenerationFlow',
    inputSchema: AiProductDescriptionGenerationInputSchema,
    outputSchema: AiProductDescriptionGenerationOutputSchema,
  },
  async (input) => {
    const { keywords } = input;
    const descriptions: { [key: string]: string } = {};

    const { output } = await generateProductDescriptionPrompt({ keywords });
    descriptions['uz'] = output!;

    return descriptions;
  }
);

export async function aiProductDescriptionGeneration(input: AiProductDescriptionGenerationInput): Promise<AiProductDescriptionGenerationOutput> {
  return aiProductDescriptionGenerationFlow(input);
}
