'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating and SENDING AI-composed order status updates for Telegram.
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
  currentStatus: z.enum(['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']).describe("The current status of the order."),
  productName: z.string().describe("The name of the product(s) in the order."),
  phoneNumber: z.string().optional().describe("Customer's phone number."),
  telegramUsername: z.string().optional().describe("Customer's Telegram username."),
  imageUrl: z.string().optional().describe("URL or Data URI of the outfit image."),
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
  prompt: `Siz "Auralook.uz" do'konining yordamchisisiz. Buyurtma holati o'zgarganda Admin uchun o'zbek tilida xabar tayyorlang.

MUHIM: Agar buyurtma holati "Cancelled" bo'lsa, xabarni "⚠️ BUYURTMA BEKOR QILINDI" deb boshlang va adminni ogohlantiring.
Quyidagi ma'lumotlarni HTML formatida (Telegram uchun) aniq ko'rsating. 
Telegram username-ni mana bu formatda link qiling: <a href="https://t.me/{{{telegramUsername}}}">@{{{telegramUsername}}}</a>

Ma'lumotlar:
- Telegram: <a href="https://t.me/{{{telegramUsername}}}">@{{{telegramUsername}}}</a>
- Buyurtma ID: <code>{{{orderId}}}</code>
- Telefon raqami: {{{phoneNumber}}}
- Buyurtma holati: <b>{{{currentStatus}}}</b>
- Tanlangan Libos: <b>{{{productName}}}</b>

{{#if physique}}
O'lchamlar:
- Bo'yi: {{{physique.height}}} sm
- Vazni: {{{physique.weight}}} kg
- Tanlangan o'lcham: <b>{{{physique.size}}}</b>
{{/if}}

Xabar professional va tushunarli bo'lishi kerak.`,
});

const aiTelegramOrderStatusNotificationFlow = ai.defineFlow(
  {
    name: 'aiTelegramOrderStatusNotificationFlow',
    inputSchema: AiTelegramOrderStatusNotificationInputSchema,
    outputSchema: AiTelegramOrderStatusNotificationOutputSchema,
  },
  async (input) => {
    try {
      // Clean username for URL construction
      const cleanUsername = input.telegramUsername?.replace(/^@/, '') || 'username';
      
      const {output} = await prompt({
        ...input,
        telegramUsername: cleanUsername
      });
      return output!;
    } catch (error) {
      console.error('Flow execution error:', error);
      const cleanUsername = input.telegramUsername?.replace(/^@/, '') || 'username';
      const statusIcon = input.currentStatus === 'Cancelled' ? '⚠️' : '📦';
      let fallbackMsg = `<b>${statusIcon} Buyurtma Yangilandi!</b>\n\n`;
      fallbackMsg += `Telegram: <a href="https://t.me/${cleanUsername}">@${cleanUsername}</a>\n`;
      fallbackMsg += `Telefon: ${input.phoneNumber || 'Noma\'lum'}\n`;
      fallbackMsg += `Mahsulot: ${input.productName}\n`;
      fallbackMsg += `Holat: <b>${input.currentStatus}</b>\n`;
      fallbackMsg += `\nID: <code>${input.orderId}</code>`;
      return { message: fallbackMsg };
    }
  }
);

export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  try {
    const { message } = await aiTelegramOrderStatusNotificationFlow(input);
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-2916828899-aeb98.web.app';

    if (!token || !adminChatId) {
      console.warn("Telegram configuration is missing. Notification skipped.");
      return;
    }

    const viewOrderLink = `${baseUrl}/admin`;
    const finalCaption = `${message}\n\n<a href="${viewOrderLink}">🔗 Boshqaruv panelida ko'rish</a>`;

    // Handle Image: Data URI vs Remote URL
    if (input.imageUrl && input.imageUrl.startsWith('data:')) {
      const [meta, base64Data] = input.imageUrl.split(',');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const formData = new FormData();
      formData.append('chat_id', adminChatId);
      formData.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'look.jpg');
      formData.append('caption', finalCaption);
      formData.append('parse_mode', 'HTML');

      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
    } else if (input.imageUrl && (input.imageUrl.startsWith('http://') || input.imageUrl.startsWith('https://'))) {
      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          photo: input.imageUrl,
          caption: finalCaption,
          parse_mode: 'HTML',
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: finalCaption,
          parse_mode: 'HTML',
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}

export async function aiTelegramOrderStatusNotification(input: AiTelegramOrderStatusNotificationInput): Promise<AiTelegramOrderStatusNotificationOutput> {
  return aiTelegramOrderStatusNotificationFlow(input);
}
