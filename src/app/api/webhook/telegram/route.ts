
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Telegram Bot Webhook Handler.
 * Manages /start commands and provides automated shop information.
 */

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    
    if (body.message && body.message.text === '/start') {
      const chatId = body.message.chat.id;
      const firstName = body.message.from.first_name || 'Voyager';
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio-2916828899-aeb98.web.app';

      const welcomeMessage = `<b>Xush kelibsiz Auralook.uz rasmiy botiga!</b> ⚡️\n\n` +
        `Salom, ${firstName}! Biz O'zbekistondagi birinchi futuristic techwear va cyber-fashion platformasimiz.\n\n` +
        `🛸 <b>Biz haqimizda:</b>\n` +
        `• Xitoydan to'g'ridan-to'g'ri premium yetkazib berish.\n` +
        `• Sifat nazorati va halol narxlar.\n` +
        `• 7-12 kunda yetkazib berish.\n\n` +
        `Pastdagi tugmani bosib Mini App-ni oching va eng so'nggi to'plamlarimizni ko'ring!`;

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
                  web_app: { url: baseUrl }
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
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to prevent Telegram retry loops
  }
}
