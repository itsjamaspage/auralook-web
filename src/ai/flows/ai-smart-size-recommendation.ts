'use server';
/**
 * @fileOverview A deterministic size advisor flow.
 * Replaced AI logic with a robust algorithm to remove Gemini dependency.
 */

import { z } from 'genkit';

const SmartSizeRecommendationInputSchema = z.object({
  heightCm: z.number(),
  weightKg: z.number(),
  gender: z.enum(['male', 'female', 'other']),
  desiredFit: z.enum(['tight', 'regular', 'loose']),
});
export type SmartSizeRecommendationInput = z.infer<typeof SmartSizeRecommendationInputSchema>;

const SmartSizeRecommendationOutputSchema = z.object({
  recommendedSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  explanation: z.string(),
});
export type SmartSizeRecommendationOutput = z.infer<typeof SmartSizeRecommendationOutputSchema>;

/**
 * Deterministic algorithm for size recommendation.
 * Uses BMI and Height thresholds to suggest the optimal techwear fit.
 */
export async function smartSizeRecommendation(input: SmartSizeRecommendationInput): Promise<SmartSizeRecommendationOutput> {
  const { heightCm, weightKg, desiredFit } = input;
  
  // Basic BMI calculation for mass estimation
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  let size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' = 'M';
  
  // Height-based base sizing
  if (heightCm < 165) size = 'S';
  else if (heightCm < 175) size = 'M';
  else if (heightCm < 185) size = 'L';
  else size = 'XL';

  // Weight/BMI adjustments
  if (bmi < 18.5) {
    if (size === 'M') size = 'S';
    if (size === 'S') size = 'XS';
  } else if (bmi > 25) {
    if (size === 'M') size = 'L';
    else if (size === 'L') size = 'XL';
    else if (size === 'XL') size = 'XXL';
  }

  // Fit adjustments
  if (desiredFit === 'loose') {
    if (size === 'S') size = 'M';
    else if (size === 'M') size = 'L';
    else if (size === 'L') size = 'XL';
    else if (size === 'XL') size = 'XXL';
  } else if (desiredFit === 'tight') {
    if (size === 'M') size = 'S';
    else if (size === 'S') size = 'XS';
  }

  const explanation = `Sizning bo'yingiz (${heightCm}sm) va vazningiz (${weightKg}kg) hamda ${desiredFit === 'loose' ? 'kengroq' : desiredFit === 'tight' ? 'yopishib turadigan' : 'o\'rtacha'} kiyinish uslubingizga ko'ra, biz ${size} o'lchamini tavsiya qilamiz.`;

  return {
    recommendedSize: size,
    explanation
  };
}
