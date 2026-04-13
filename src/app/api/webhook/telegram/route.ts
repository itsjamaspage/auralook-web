
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Telegram Bot Webhook Handler.
 * Synchronized with Bot Setup to ensure consistent version delivery.
 */

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.error('[Bot Webhook] Critical: TELEGRAM_BOT_TOKEN is not defined in env.');
    return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.toLowerCase();
    const firstName = message.from?.first_name || 'Voyager';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
    
    // MATCHING PROTOCOL: Use the exact same cache-buster as the menu button
    const cacheBusterUrl = `${baseUrl}?v=${Date.now()}`;

    // Handle /start command
    if (text.startsWith('/start')) {
      const welcomeMessage = `<b>Xush kelibsiz Auralook.uz rasmiy botiga!</b> ⚡️\n\n` +
        `Salom, ${firstName}! Biz O'zbekistondagi birinchi Xitoydan kiyim olib keladigan va o'zining telegram mini ilovasi bor platformasimiz.\n\n` +
        `🛸 <b>Biz haqimizda:</b>\n` +
        `• Xitoydan to'g'ridan-to'g'ri yetkazib berish.\n` +
        `• Yaxshi sifat va arzon narxlar.\n` +
        `• 7-12 kunda yetkazib berish.\n\n` +
        `Pastdagi tugmani bosib do'konni oching va eng so'nggi to'plamlarimizni ko'ring!`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeMessage,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Do\'konni ochish',
                  web_app: { url: cacheBusterUrl }
                }
              ],
              [
                {
                  text: '👨‍💻 Menejer bilan bog\'lanish',
                  url: 'https://t.me/itsjamaspage'
                }
              ]
            ]
          }
        })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Critical Failure:', error);
    return NextResponse.json({ ok: true, error: String(error) });
  }
}
