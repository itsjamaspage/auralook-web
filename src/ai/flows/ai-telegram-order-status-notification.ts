
'use server';
/**
 * @fileOverview Template-based order notifications for Telegram.
 * Enhanced with support for Photo delivery (URLs and Data URIs).
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
 * Now supports Photo delivery for outfit visuals.
 */
export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.warn("[Telegram Protocol] ABORTED: Credentials missing.");
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
    const finalCaption = `${message}\n\n<a href="${baseUrl}/admin">🔗 Boshqaruv panelida ko'rish</a>`;

    const isDataUri = input.imageUrl?.startsWith('data:');

    if (input.imageUrl) {
      if (isDataUri) {
        // Multi-part form data for Base64/Data URI uploads
        const formData = new FormData();
        formData.append('chat_id', adminChatId);
        formData.append('parse_mode', 'HTML');
        formData.append('caption', finalCaption);
        
        const [meta, base64] = input.imageUrl.split(',');
        const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const binary = Buffer.from(base64, 'base64');
        const blob = new Blob([binary], { type: mime });
        
        formData.append('photo', blob, 'outfit.jpg');

        await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(15000)
        });
      } else {
        // Standard JSON for external URLs
        await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: adminChatId,
            photo: input.imageUrl,
            caption: finalCaption,
            parse_mode: 'HTML'
          }),
          signal: AbortSignal.timeout(10000)
        });
      }
    } else {
      // Fallback to simple text if no image provided
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: finalCaption,
          parse_mode: 'HTML'
        })
      });
    }
  } catch (error) {
    console.error("[Telegram Protocol] CRITICAL FAILURE:", error);
  }
}
