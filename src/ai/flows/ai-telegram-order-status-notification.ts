'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI-composed, real-time order status updates for Telegram in Uzbek.
 *
 * - aiTelegramOrderStatusNotification - A function that generates an order status notification.
 * - AiTelegramOrderStatusNotificationInput - The input type for the notification generation.
 * - AiTelegramOrderStatusNotificationOutput - The return type for the notification generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTelegramOrderStatusNotificationInputSchema = z.object({
  customerName: z.string().describe("The name of the customer."),
  orderId: z.string().describe("The unique identifier for the order."),
  currentStatus: z.enum(['New', 'Confirmed', 'Shipped', 'Delivered']).describe("The current status of the order."),
  productName: z.string().describe("The name of the product(s) in the order."),
  estimatedDeliveryDate: z.string().nullable().optional().describe("The estimated delivery date."),
  language: z.enum(['uz']).describe("The desired language for the notification. Only 'uz' is supported."),
});
export type AiTelegramOrderStatusNotificationInput = z.infer<typeof AiTelegramOrderStatusNotificationInputSchema>;

const AiTelegramOrderStatusNotificationOutputSchema = z.object({
  message: z.string().describe("The AI-composed order status notification message in Uzbek."),
});
export type AiTelegramOrderStatusNotificationOutput = z.infer<typeof AiTelegramOrderStatusNotificationOutputSchema>;

export async function aiTelegramOrderStatusNotification(input: AiTelegramOrderStatusNotificationInput): Promise<AiTelegramOrderStatusNotificationOutput> {
  return aiTelegramOrderStatusNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'telegramOrderStatusPrompt',
  input: {schema: AiTelegramOrderStatusNotificationInputSchema},
  output: {schema: AiTelegramOrderStatusNotificationOutputSchema},
  prompt: `Siz "Auralook.uz" do'konining yordamchisisiz. Mijoz uchun o'zbek tilida buyurtma holati haqida xabar tayyorlang.

Buyurtma ma'lumotlari:
- Mijoz ismi: {{{customerName}}}
- Buyurtma ID: {{{orderId}}}
- Holati: {{{currentStatus}}}
- Mahsulot: {{{productName}}}
- Taxminiy yetkazib berish: {{{estimatedDeliveryDate}}}

Xabar xushmuomala va ma'lumotga boy bo'lishi kerak. Mijoz ismini, buyurtma ID raqamini va mahsulot nomini kiriting.`,
});

const aiTelegramOrderStatusNotificationFlow = ai.defineFlow(
  {
    name: 'aiTelegramOrderStatusNotificationFlow',
    inputSchema: AiTelegramOrderStatusNotificationInputSchema,
    outputSchema: AiTelegramOrderStatusNotificationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
