'use server';
/**
 * @fileOverview Template-based order notifications for Telegram.
 * Enhanced with server-side logging to debug delivery issues.
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
  console.log(`[Telegram Protocol] Initiating notification for Order: ${input.orderId}`);
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.error("[Telegram Protocol] CRITICAL ERROR: TELEGRAM_BOT_TOKEN or ADMIN_CHAT_ID is missing from environment variables.");
    return;
  }

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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-2916828899-aeb98.web.app';
    const viewOrderLink = `${baseUrl}/admin`;
    const finalCaption = `${message}\n\n<a href="${viewOrderLink}">🔗 Boshqaruv panelida ko'rish</a>`;

    const usePhoto = input.imageUrl && !input.imageUrl.includes('picsum.photos') && !input.imageUrl.startsWith('data:');
    const method = usePhoto ? 'sendPhoto' : 'sendMessage';
    
    const payload: any = {
      chat_id: adminChatId,
      parse_mode: 'HTML',
    };

    if (usePhoto) {
      payload.photo = input.imageUrl;
      payload.caption = finalCaption;
    } else {
      payload.text = finalCaption;
    }

    console.log(`[Telegram Protocol] Dispatching ${method} to API...`);
    
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[Telegram Protocol] API ERROR: ${result.description}`);
    } else {
      console.log(`[Telegram Protocol] SUCCESS: Notification delivered to Telegram.`);
    }
  } catch (error) {
    console.error("[Telegram Protocol] NETWORK ERROR:", error);
  }
}
