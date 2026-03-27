'use server';
/**
 * @fileOverview Generates professional, SEO-friendly multi-language product descriptions for clothing 'Looks' from keywords.
 *
 * - aiProductDescriptionGeneration - A function that handles the AI product description generation process.
 * - AiProductDescriptionGenerationInput - The input type for the aiProductDescriptionGeneration function.
 * - AiProductDescriptionGenerationOutput - The return type for the aiProductDescriptionGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductDescriptionGenerationInputSchema = z.object({
  keywords: z.string().describe('Comma-separated keywords describing the product.'),
  languages: z.array(z.string()).describe('Array of target language codes (e.g., "en", "ru", "uz").'),
});
export type AiProductDescriptionGenerationInput = z.infer<typeof AiProductDescriptionGenerationInputSchema>;

const AiProductDescriptionGenerationOutputSchema = z.record(z.string(), z.string()).describe('An object where keys are language codes and values are the generated product descriptions.');
export type AiProductDescriptionGenerationOutput = z.infer<typeof AiProductDescriptionGenerationOutputSchema>;

// Define the prompt for generating a single product description in a specific language.
const generateProductDescriptionPrompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {
    schema: z.object({
      keywords: z.string().describe('Comma-separated keywords describing the product.'),
      language: z.string().describe('The target language for the description (e.g., "English", "Russian", "Uzbek").'),
    }),
  },
  output: {
    schema: z.string().describe('The generated product description.'),
  },
  prompt: `As a professional e-commerce copywriter, generate a creative, SEO-friendly, and engaging product description in {{language}} for a clothing item.\n\nThe description should highlight the key features and benefits of the clothing item based on the following keywords:\nKeywords: {{{keywords}}}\n\nThe description should be at least 100 words long and appeal to potential customers, incorporating relevant fashion terminology and calls to action where appropriate.`,
});

const aiProductDescriptionGenerationFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionGenerationFlow',
    inputSchema: AiProductDescriptionGenerationInputSchema,
    outputSchema: AiProductDescriptionGenerationOutputSchema,
  },
  async (input) => {
    const { keywords, languages } = input;
    const descriptions: { [key: string]: string } = {};

    // Use Promise.all to generate descriptions in parallel for all requested languages
    const generationPromises = languages.map(async (langCode) => {
      let languageFullName = '';
      switch (langCode.toLowerCase()) {
        case 'en':
          languageFullName = 'English';
          break;
        case 'ru':
          languageFullName = 'Russian';
          break;
        case 'uz':
          languageFullName = 'Uzbek';
          break;
        default:
          languageFullName = langCode; // Fallback for other languages if needed
      }

      const { output } = await generateProductDescriptionPrompt({ keywords, language: languageFullName });
      descriptions[langCode] = output!;
    });

    await Promise.all(generationPromises);

    return descriptions;
  }
);

export async function aiProductDescriptionGeneration(input: AiProductDescriptionGenerationInput): Promise<AiProductDescriptionGenerationOutput> {
  return aiProductDescriptionGenerationFlow(input);
}
