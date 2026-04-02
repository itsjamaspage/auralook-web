'use server';
/**
 * @fileOverview Template-based order notifications for Telegram.
 * Removed Gemini dependency for guaranteed delivery and faster response.
 */

import { z } from 'genkit';

const PhysiqueSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  size: z.string().optional(),
});

const AiTelegramOrderStatusNotificationInputSchema = z.object({
  customerName: z.string(),
  orderId: z.string(),
  currentStatus: z.enum(['New', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']),
  productName: z.string(),
  phoneNumber: z.string().optional(),
  telegramUsername: z.string().optional(),
  imageUrl: z.string().optional(),
  estimatedDeliveryDate: z.string().nullable().optional(),
  language: z.enum(['uz']),
  physique: PhysiqueSchema.optional(),
  timestamp: z.string().optional(),
});
export type AiTelegramOrderStatusNotificationInput = z.infer<typeof AiTelegramOrderStatusNotificationInputSchema>;

export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  try {
    const cleanUsername = input.telegramUsername?.replace(/^@/, '') || 'user';
    const timestamp = input.timestamp || new Date().toLocaleString('uz-UZ');
    
    let statusIcon = '📦';
    let statusTitle = 'YANGI BUYURTMA';
    
    if (input.currentStatus === 'Cancelled') {
      statusIcon = '⚠️';
      statusTitle = 'BUYURTMA BEKOR QILINDI';
    } else if (input.currentStatus === 'Confirmed') {
      statusIcon = '✅';
      statusTitle = 'BUYURTMA TASDIQLANDI';
    }

    let message = `<b>${statusIcon} ${statusTitle}</b>\n\n`;
    message += `Telegram: <a href="https://t.me/${cleanUsername}">@${cleanUsername}</a>\n`;
    message += `Buyurtma ID: <code>${input.orderId}</code>\n`;
    message += `Telefon: ${input.phoneNumber || 'Noma\'lum'}\n`;
    message += `Mahsulot: <b>${input.productName}</b>\n`;
    message += `Tanlangan O'lcham: <b>${input.physique?.size || 'Noma\'lum'}</b>\n`;
    message += `Holat: <b>${input.currentStatus}</b>\n`;
    message += `Vaqt: ${timestamp}\n`;

    if (input.physique?.height) {
      message += `\nQo'shimcha ma'lumotlar:\n`;
      message += `- Bo'yi: ${input.physique.height} sm\n`;
      message += `- Vazni: ${input.physique.weight} kg\n`;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-2916828899-aeb98.web.app';

    if (!token || !adminChatId) {
      console.warn("Telegram configuration is missing. Notification skipped.");
      return;
    }

    const viewOrderLink = `${baseUrl}/admin`;
    const finalCaption = `${message}\n\n<a href="${viewOrderLink}">🔗 Boshqaruv panelida ko'rish</a>`;

    // Send logic (Photo or Message)
    if (input.imageUrl && !input.imageUrl.includes('picsum.photos')) {
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
