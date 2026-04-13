'use server';
/**
 * @fileOverview Template-based order and broadcast notifications for Telegram.
 * Enhanced with Multi-Admin Protocol and Channel Broadcast Engine.
 */

import { z } from 'genkit';
import { getProductDeepLink } from '@/lib/telegram-link';

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
  customerTelegramId: z.number().optional(),
  imageUrl: z.string().optional(),
  estimatedDeliveryDate: z.string().nullable().optional(),
  language: z.enum(['uz']),
  physique: PhysiqueSchema.optional(),
  timestamp: z.string().optional(),
});
export type AiTelegramOrderStatusNotificationInput = z.infer<typeof AiTelegramOrderStatusNotificationInputSchema>;

/**
 * Dispatches a notification to the Telegram Admin bot.
 */
export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!token || adminChatIds.length === 0) {
    console.warn("[Telegram Protocol] ABORTED: Admin credentials missing.");
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
    const finalCaption = `${message}\n\n<a href="${baseUrl}/admin">🔗 Boshqaruv panelida ko'rish</a>`;

    for (const chatId of adminChatIds) {
      await sendTelegramMessage(token, chatId, finalCaption, input.imageUrl);
    }
  } catch (error) {
    console.error("[Telegram Protocol] ADMIN NOTIFY FAILURE:", error);
  }
}

/**
 * Dispatches a confirmation message to the CUSTOMER.
 */
export async function notifyCustomerOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !input.customerTelegramId) return;

  try {
    let message = `<b>✅ Buyurtmangiz qabul qilindi!</b>\n\n`;
    message += `Hurmatli ${input.customerName},\n`;
    message += `Sizning <code>${input.orderId.substring(0, 8)}</code> raqamli buyurtmangiz tahlil qilinmoqda.\n\n`;
    message += `<b>Mahsulot:</b> ${input.productName}\n`;
    message += `<b>Holat:</b> Kutilmoqda\n\n`;
    message += `⚡️ Menejerimiz tez orada siz bilan bog'lanib, to'lov turlari va yetkazib berish tafsilotlarini muhokama qiladi.\n\n`;
    message += `<i>Auralook — Kelajak uslubini tanlaganingiz uchun rahmat!</i>`;

    await sendTelegramMessage(token, input.customerTelegramId.toString(), message);
  } catch (error) {
    console.error("[Telegram Protocol] CUSTOMER NOTIFY FAILURE:", error);
  }
}

/**
 * AUTOMATED BROADCAST: Posts a new look to the Telegram channel.
 * FIXED: Uses web_app button type for Telegram Web compatibility.
 */
export async function postNewLookToChannel(look: { id: string, name: string, price: number, currency: string, description: string, imageUrl: string }): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || '@auralook_uz';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';

  if (!token) return;

  const formattedPrice = new Intl.NumberFormat('uz-UZ').format(look.price).replace(/,/g, ' ');

  let caption = `👔 <b>${look.name.toUpperCase()}</b>\n\n`;
  caption += `💰 <b>NARXI:</b> ${formattedPrice} ${look.currency}\n\n`;
  caption += `${look.description}\n\n`;
  caption += `🛸 <i>Kelajak uslubi hoziroq buyurtma berish uchun tayyor!</i>`;

  const replyMarkup = {
    inline_keyboard: [[
      { 
        text: "🛍 KO'RISH VA BUYURTMA BERISH", 
        web_app: { url: `${baseUrl}/looks/${look.id}` }
      }
    ]]
  };

  try {
    await sendTelegramMessage(token, channelId, caption, look.imageUrl, replyMarkup);
  } catch (error) {
    console.error("[Telegram Protocol] CHANNEL BROADCAST FAILURE:", error);
  }
}

/**
 * Internal helper to send Telegram messages (Photo or Text).
 */
async function sendTelegramMessage(token: string, chatId: string, text: string, imageUrl?: string, replyMarkup?: any) {
  const isDataUri = imageUrl?.startsWith('data:');
  
  if (imageUrl) {
    if (isDataUri) {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('parse_mode', 'HTML');
      formData.append('caption', text);
      if (replyMarkup) formData.append('reply_markup', JSON.stringify(replyMarkup));
      
      const [meta, base64] = imageUrl.split(',');
      const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
      const binary = Buffer.from(base64, 'base64');
      const blob = new Blob([binary], { type: mime });
      formData.append('photo', blob, 'outfit.jpg');

      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: formData });
    } else {
      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
    }
  } else {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });
  }
}
