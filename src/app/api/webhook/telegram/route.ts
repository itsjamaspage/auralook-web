
import { NextRequest, NextResponse } from 'next/server';
import { FAQ, type FaqLang, type FaqKey } from '@/lib/faq';

/**
 * @fileOverview Telegram Bot Webhook Handler.
 * Handles /start command, language selection, and FAQ inline keyboard flow.
 * Synchronized with Bot Setup to ensure consistent version delivery.
 */

type TgApiCall = (method: string, payload: Record<string, unknown>) => Promise<unknown>;

async function sendLangMenu(tgApi: TgApiCall, chatId: number, cacheBusterUrl: string, firstName?: string) {
  const greeting = firstName
    ? `<b>Xush kelibsiz Auralook.uz rasmiy botiga!</b> ⚡️\n\nSalom, ${firstName}! Biz O'zbekistondagi birinchi Xitoydan kiyim olib keladigan va o'zining telegram mini ilovasi bor platformasimiz.\n\n🛸 <b>Biz haqimizda:</b>\n• Xitoydan to'g'ridan-to'g'ri yetkazib berish.\n• Yaxshi sifat va arzon narxlar.\n• 7-12 kunda yetkazib berish.\n\nTilni tanlang / Выберите язык / Choose language:`
    : 'Tilni tanlang / Выберите язык / Choose language:';

  await tgApi('sendMessage', {
    chat_id: chatId,
    text: greeting,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🇺🇿 O'zbekcha", callback_data: 'lang_uz' },
          { text: '🇷🇺 Русский',   callback_data: 'lang_ru' },
          { text: '🇬🇧 English',   callback_data: 'lang_en' },
        ],
        [{ text: "🚀 Do'konni ochish", web_app: { url: cacheBusterUrl } }],
        [{ text: "👨‍💻 Menejer bilan bog'lanish", url: 'https://t.me/itsjamaspage' }],
      ],
    },
  });
}

async function sendFaqMenu(tgApi: TgApiCall, chatId: number, lang: FaqLang) {
  const faq = FAQ[lang];
  const keyboard = faq.questions.map(q => ([{
    text: q.label,
    callback_data: `faq_${lang}_${q.key}`,
  }]));
  keyboard.push([{ text: '🔙 Til / Язык / Language', callback_data: 'lang_select' }]);

  await tgApi('sendMessage', {
    chat_id: chatId,
    text: faq.welcome,
    reply_markup: { inline_keyboard: keyboard },
  });
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('[Bot Webhook] Critical: TELEGRAM_BOT_TOKEN is not defined in env.');
    return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });
  }

  // Priority resolution for the base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
  const cacheBusterUrl = `${baseUrl}?v=${Date.now()}`;

  const tgApi: TgApiCall = (method, payload) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

  try {
    const body = await req.json();

    // ── Callback query (inline button press) ──────────────────────────────────
    if (body.callback_query) {
      const query = body.callback_query;
      const chatId: number = query.message.chat.id;
      const data: string = query.data ?? '';

      // Dismiss the loading spinner on the button
      await tgApi('answerCallbackQuery', { callback_query_id: query.id });

      if (data === 'lang_select') {
        await sendLangMenu(tgApi, chatId, cacheBusterUrl);
      } else if (data === 'lang_uz') {
        await sendFaqMenu(tgApi, chatId, 'uz');
      } else if (data === 'lang_ru') {
        await sendFaqMenu(tgApi, chatId, 'ru');
      } else if (data === 'lang_en') {
        await sendFaqMenu(tgApi, chatId, 'en');
      } else if (data.startsWith('faq_')) {
        // Format: faq_{lang}_{key}  e.g. faq_uz_prices
        const parts = data.split('_');
        const lang = parts[1] as FaqLang;
        const key = parts[2] as FaqKey;
        const answer = FAQ[lang]?.answers[key];

        if (answer) {
          await tgApi('sendMessage', {
            chat_id: chatId,
            text: answer,
            reply_markup: {
              inline_keyboard: [[
                { text: '🔙 Ortga / Назад / Back', callback_data: `lang_${lang}` },
              ]],
            },
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    // ── Regular text message ───────────────────────────────────────────────────
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId: number = message.chat.id;
    const text: string = message.text.toLowerCase();
    const firstName: string = message.from?.first_name || 'Voyager';

    // /tracking command — open orders page in mini app
    if (text === '/tracking') {
      const ordersUrl = `${baseUrl}/orders?v=${Date.now()}`;
      await tgApi('sendMessage', {
        chat_id: chatId,
        text: `📦 <b>Buyurtmalaringizni kuzatish</b>\n\nQuyidagi tugmani bosing — buyurtmalaringiz holati va yetkazib berish joyi ko'rsatiladi.`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📦 Buyurtmalarni kuzatish', web_app: { url: ordersUrl } }],
          ],
        },
      });
      return NextResponse.json({ ok: true });
    }

    // Respond to /start OR any other message with the language menu
    await sendLangMenu(tgApi, chatId, cacheBusterUrl, firstName);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Critical Failure:', error);
    return NextResponse.json({ ok: true, error: String(error) });
  }
}
