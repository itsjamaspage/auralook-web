'use server';
/**
 * @fileOverview Template-based order notifications for Telegram.
 * Enhanced with server-side logging and robust delivery checks.
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

/**
 * Dispatches a notification to the Telegram Admin bot.
 * Uses a standard fetch call to bypass Genkit initialization overhead for faster delivery.
 */
export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  console.log(`[Telegram Protocol] Initiating notification for Order: ${input.orderId}`);
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.error("[Telegram Protocol] CRITICAL ERROR: Bot credentials missing from environment.");
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
    message += `O'lcham: <b>${input.physique?.size || 'Noma\'lum'}</b>\n`;
    message += `Holat: <b>${input.currentStatus}</b>\n`;
    message += `Vaqt: ${timestamp}\n`;

    if (input.physique?.height) {
      message += `\nQo'shimcha ma'lumotlar:\n`;
      message += `- Bo'yi: ${input.physique.height} sm\n`;
      message += `- Vazni: ${input.physique.weight} kg\n`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
    const viewOrderLink = `${baseUrl}/admin`;
    const finalCaption = `${message}\n\n<a href="${viewOrderLink}">🔗 Boshqaruv panelida ko'rish</a>`;

    // Only attempt photo if it's a real public URL. Telegram sendPhoto doesn't support local paths or data URIs.
    const isPublicUrl = input.imageUrl && 
                        !input.imageUrl.includes('picsum.photos') && 
                        !input.imageUrl.startsWith('data:') &&
                        input.imageUrl.startsWith('http');

    const method = isPublicUrl ? 'sendPhoto' : 'sendMessage';
    
    const payload: any = {
      chat_id: adminChatId,
      parse_mode: 'HTML',
    };

    if (isPublicUrl) {
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
      // Extend timeout for serverless environments
      signal: AbortSignal.timeout(10000)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`[Telegram Protocol] API ERROR: ${result.description}`);
    } else {
      console.log(`[Telegram Protocol] SUCCESS: Notification delivered.`);
    }
  } catch (error) {
    console.error("[Telegram Protocol] DELIVERY FAILURE:", error);
  }
}
