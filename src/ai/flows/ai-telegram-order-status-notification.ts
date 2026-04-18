
'use server';
/**
 * @fileOverview Template-based order and broadcast notifications for Telegram.
 * Enhanced with Batch Order Logic, Personalized Greetings, and Direct Links.
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
  lookId: z.string().optional(),
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

export type BatchOrderInput = {
  customerName: string;
  telegramUsername?: string;
  phoneNumber?: string;
  physique?: { height?: string, weight?: string };
  items: { productName: string, size: string, imageUrl?: string, lookId?: string, shoeSize?: string }[];
  timestamp: string;
  orderIds: string[];
};

/**
 * Dispatches a combined notification for multiple orders to the Telegram Admin.
 * Attaches multiple photos using Telegram Media Group protocol.
 */
export async function notifyAdminOfBatchOrder(input: BatchOrderInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!token || adminChatIds.length === 0) return;

  try {
    const cleanUsername = input.telegramUsername?.replace(/^@/, '') || 'user';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auralook.uz';
    
    let message = `<b>📦 YANGI BUYURTMA (${input.items.length} ta mahsulot)</b>\n\n`;
    message += `Telegram: @${cleanUsername} (<a href="https://t.me/${cleanUsername}">havola</a>)\n`;
    message += `Buyurtma ID: <code>${input.orderIds[0].substring(0, 8)}</code>\n`;
    message += `Telefon: ${input.phoneNumber || 'Noma\'lum'}\n\n`;

    input.items.forEach((item, index) => {
      message += `${index + 1}. <b>${item.productName}</b> — <b>${item.size}</b>`;
      if (item.shoeSize) message += ` | 👟 <b>${item.shoeSize} EUR</b>`;
      if (item.lookId) message += ` (<a href="${baseUrl}/looks/${item.lookId}">ko'rish</a>)`;
      message += `\n`;
    });

    message += `\nBo'yi: ${input.physique?.height || '?'} sm | Vazni: ${input.physique?.weight || '?'} kg\n`;
    message += `Vaqt: ${input.timestamp}\n`;

    const finalCaption = `${message}\n\n<a href="${baseUrl}/admin">🔗 Boshqaruv panelida ko'rish</a>`;

    const media = input.items.slice(0, 10).map((item, index) => ({
      type: 'photo',
      media: item.imageUrl || 'https://placehold.co/600x800',
      caption: index === 0 ? finalCaption : undefined,
      parse_mode: index === 0 ? 'HTML' : undefined
    }));

    for (const chatId of adminChatIds) {
      if (media.length > 1) {
        await fetch(`https://api.telegram.org/bot${token}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, media: media })
        });
      } else {
        await sendTelegramMessage(token, chatId, finalCaption, input.items[0].imageUrl);
      }
    }
  } catch (error) {
    console.error("[Telegram Protocol] BATCH ADMIN NOTIFY FAILURE:", error);
  }
}

/**
 * Dispatches a notification to the Telegram Admin bot (Single Order).
 */
export async function notifyAdminOfOrder(input: AiTelegramOrderStatusNotificationInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_ID || '').split(',').map(s => s.trim()).filter(Boolean);

  if (!token || adminChatIds.length === 0) {
    return;
  }

  try {
    const cleanUsername = input.telegramUsername?.replace(/^@/, '') || 'user';
    const timestamp = input.timestamp || new Date().toLocaleString('uz-UZ');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auralook.uz';
    
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
    message += `Telegram: @${cleanUsername} (<a href="https://t.me/${cleanUsername}">havola</a>)\n`;
    message += `Buyurtma ID: <code>${input.orderId}</code>\n`;
    message += `Telefon: ${input.phoneNumber || 'Noma\'lum'}\n`;
    message += `Mahsulot: <b>${input.productName}</b>\n`;
    
    if (input.lookId) {
      message += `🔎 <a href="${baseUrl}/looks/${input.lookId}">Mahsulotni ko'rish</a>\n`;
    }

    message += `O'lcham: <b>${input.physique?.size || 'Noma\'lum'}</b>\n`;
    message += `Holat: <b>${input.currentStatus}</b>\n`;
    message += `Bo'yi: ${input.physique?.height || "Noma'lum"} sm | Vazni: ${input.physique?.weight || "Noma'lum"} kg\n`;
    message += `Vaqt: ${timestamp}\n`;

    if (input.physique?.height) {
      message += `\nQo'shimcha ma'lumotlar:\n`;
      message += `- Bo'yi: ${input.physique.height} sm\n`;
      message += `- Vazni: ${input.physique.weight} kg\n`;
    }

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
export async function notifyCustomerOfOrder(input: AiTelegramOrderStatusNotificationInput & { shoeSize?: string }): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !input.customerTelegramId) return;

  try {
    const cleanUsername = input.telegramUsername?.replace(/^@/, '') || '';
    const greetingName = cleanUsername ? `@${cleanUsername} (${input.customerName})` : input.customerName;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auralook.uz';
    const ordersUrl = `${baseUrl}/orders?v=${Date.now()}`;

    let message = `<b>✅ Buyurtmangiz qabul qilindi!</b>\n\n`;
    message += `Hurmatli ${greetingName},\n`;
    message += `Sizning <code>${input.orderId.substring(0, 8)}</code> raqamli buyurtmangiz tahlil qilinmoqda.\n\n`;
    message += `<b>Mahsulot:</b> ${input.productName}\n`;
    if (input.physique?.size) message += `<b>O'lcham:</b> ${input.physique.size}\n`;
    if (input.shoeSize) message += `<b>Poyabzal:</b> 👟 ${input.shoeSize} EUR\n`;
    message += `<b>Holat:</b> Kutilmoqda\n\n`;
    message += `⚡️ Menejerimiz tez orada siz bilan bog'lanib, to'lov turlari va yetkazib berish tafsilotlarini muhokama qiladi.\n\n`;
    message += `<i>Auralook — Kelajak uslubini tanlaganingiz uchun rahmat!</i>`;

    const replyMarkup = {
      inline_keyboard: [[
        { text: '📦 Buyurtmalarimni kuzatish', web_app: { url: ordersUrl } }
      ]]
    };

    await sendTelegramMessage(token, input.customerTelegramId.toString(), message, undefined, replyMarkup);
  } catch (error) {
    console.error("[Telegram Protocol] CUSTOMER NOTIFY FAILURE:", error);
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

export async function notifyCustomerOfTracking({
  customerTelegramId,
  customerName,
  orderId,
  productName,
  trackingNumber,
}: {
  customerTelegramId: number;
  customerName: string;
  orderId: string;
  productName: string;
  trackingNumber: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !customerTelegramId) return;

  const trackUrl = `https://t.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;
  const text =
    `📦 <b>Buyurtmangiz yo'lda!</b>\n\n` +
    `Salom, <b>${customerName}</b>!\n\n` +
    `<b>${productName}</b> buyurtmangiz jo'natildi.\n\n` +
    `🔍 <b>Kuzatuv raqami:</b> <code>${trackingNumber}</code>\n\n` +
    `📍 <a href="${trackUrl}">Yukni kuzatish →</a>\n\n` +
    `Buyurtma <b>7–12 kun</b> ichida yetib keladi. Savollar uchun menejerga murojaat qiling!`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: customerTelegramId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}
