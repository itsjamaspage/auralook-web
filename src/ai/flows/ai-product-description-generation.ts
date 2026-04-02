'use server';
/**
 * @fileOverview Instant product description generator.
 * Replaced AI description with a professional template system to remove Gemini dependency.
 */

import { z } from 'genkit';

const AiProductDescriptionGenerationInputSchema = z.object({
  keywords: z.string(),
  languages: z.array(z.enum(['uz'])),
});
export type AiProductDescriptionGenerationInput = z.infer<typeof AiProductDescriptionGenerationInputSchema>;

export async function aiProductDescriptionGeneration(input: AiProductDescriptionGenerationInput): Promise<Record<string, string>> {
  const { keywords } = input;
  
  const desc = `Auralook kolleksiyasining yangi qismi. ${keywords} asosida yaratilgan ushbu techwear libosi ham qulaylik, ham yuqori texnologiyali estetikani birlashtiradi. Har bir detal shahar sharoitida maksimal harakatlanish erkinligi uchun o'ylangan. Premium sifat va zamonaviy ko'rinish kafolatlangan.`;

  return {
    'uz': desc
  };
}
