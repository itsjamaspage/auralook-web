'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating and SENDING AI-composed, real-time order status updates for Telegram.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhysiqueSchema = z.object({
  height: z.string().optional().describe("Customer's height in cm"),
  weight: z.string().optional().describe("Customer's weight in kg"),
  size: z.string().optional().describe("Customer's preferred size"),
});

const AiTelegramOrderStatusNotificationInputSchema = z.object({
  customerName: z.string().describe("The name of the customer."),
  orderId: z.string().describe("The unique identifier for the order."),
  currentStatus: z.enum(['New', 'Confirmed', 'Shipped', 'Delivered']).describe("The current status of the order."),
  productName: z.string().describe("The name of the product(s) in the order."),
  phoneNumber: z.string().optional().describe("Customer's phone number."),
  estimatedDeliveryDate: z.string().nullable().optional().describe("The estimated delivery date."),
  language: z.enum(['uz']).describe("The desired language for the notification. Only 'uz' is supported."),
  physique: PhysiqueSchema.optional().describe("Customer's physical measurements for size advisory."),
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
  prompt: `Siz "Auralook.uz" do'konining yordamchisisiz. Yangi buyurtma haqida Admin uchun o'zbek tilida batafsil hisobot tayyorlang.

MUHIM: Quyidagi barcha ma'lumotlarni xabarda aniq ko'rsating.

Buyurtma ma'lumotlari:
- Mijoz ismi: {{{customerName}}}
- Buyurtma ID: {{{orderId}}}
- Telefon raqami: {{{phoneNumber}}}
- Buyurtma holati: {{{currentStatus}}}
- Mahsulot: {{{productName}}}

{{#if physique}}
Mijoz o'lchamlari (Menejer maslahati uchun):
- Bo'yi: {{{physique.height}}} sm
- Vazni: {{{physique.weight}}} kg
- Tanlangan o'lcham: {{{physique.size}}}
{{/if}}

Xabar qisqa, professional va tushunarli bo'lishi kerak. Admin ushbu ma'lumotlar asosida mijoz bilan bog'lanishi va o'lchamni tasdiqlashi kerak.`,
});

const aiTelegramOrderStatusNotificationFlow = ai.defineFlow(
  {
    name: 'aiTelegramOrderStatusNotificationFlow',
    inputSchema: AiTelegramOrderStatusNotificationInputSchema,
    outputSchema: AiTelegramOrderStatusNotificationOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error('Flow execution error:', error);
      let fallbackMsg = `<b>Yangi Buyurtma Keldi!</b>\n\n`;
      fallbackMsg += `Mijoz: ${input.customerName}\n`;
      fallbackMsg += `Telefon: ${input.phoneNumber || 'Noma\'lum'}\n`;
      fallbackMsg += `Mahsulot: ${input.productName}\n`;
      if (input.physique) {
        fallbackMsg += `\n<b>O'lchamlar:</b>\n`;
        fallbackMsg += `Bo'y: ${input.physique.height}cm\n`;
        fallbackMsg += `Vazn: ${input.physique.weight}kg\n`;
        fallbackMsg += `O'lcham: ${input.physique.size || 'Tanlanmagan'}\n`;
      }
      fallbackMsg += `\nID: ${input.orderId}`;
      return { message: fallbackMsg };
    }
  }
);

export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  try {
    const { message } = await aiTelegramOrderStatusNotificationFlow(input);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !adminChatId) {
      console.warn("Telegram configuration is missing.");
      return;
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function aiTelegramOrderStatusNotification(input: AiTelegramOrderStatusNotificationInput): Promise<AiTelegramOrderStatusNotificationOutput> {
  return aiTelegramOrderStatusNotificationFlow(input);
}