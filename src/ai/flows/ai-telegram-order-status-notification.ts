'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating and SENDING AI-composed, real-time order status updates for Telegram.
 *
 * - aiTelegramOrderStatusNotification - Generates the message text.
 * - notifyAdminOfOrder - Sends the generated message to the Admin via Telegram Bot API.
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
  physique: z.object({
    height: z.string().optional(),
    weight: z.string().optional(),
    size: z.string().optional(),
  }).optional().describe("Customer's physical measurements."),
});
export type AiTelegramOrderStatusNotificationInput = z.infer<typeof AiTelegramOrderStatusNotificationInputSchema>;

const AiTelegramOrderStatusNotificationOutputSchema = z.object({
  message: z.string().describe("The AI-composed order status notification message in Uzbek."),
});
export type AiTelegramOrderStatusNotificationOutput = z.infer<typeof AiTelegramOrderStatusNotificationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'telegramOrderStatusPrompt',
  input: {schema: AiTelegramOrderStatusNotificationInputSchema},
  output: {schema: AiTelegramOrderStatusNotificationOutputSchema},
  prompt: `Siz "Auralook.uz" do'konining yordamchisisiz. Yangi buyurtma haqida Admin uchun o'zbek tilida hisobot tayyorlang.

Buyurtma ma'lumotlari:
- Mijoz ismi: {{{customerName}}}
- Buyurtma ID: {{{orderId}}}
- Holati: {{{currentStatus}}}
- Mahsulot: {{{productName}}}
{{#if physique}}
- O'lchamlari: Bo'y: {{{physique.height}}}cm, Vazn: {{{physique.weight}}}kg, Tanlangan o'lcham: {{{physique.size}}}
{{/if}}

Xabar qisqa va tushunarli bo'lishi kerak. Admin ushbu ma'lumotlar asosida mijozga libos tanlab beradi.`,
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

/**
 * Sends a notification message to the Telegram Admin via the Bot API.
 */
export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  const { message } = await aiTelegramOrderStatusNotificationFlow(input);
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.warn("Telegram Bot Token or Admin Chat ID is not configured in environment variables.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API Error:", errorData);
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function aiTelegramOrderStatusNotification(input: AiTelegramOrderStatusNotificationInput): Promise<AiTelegramOrderStatusNotificationOutput> {
  return aiTelegramOrderStatusNotificationFlow(input);
}
