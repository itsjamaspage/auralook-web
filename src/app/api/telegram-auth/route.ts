
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API Route to verify Telegram WebApp initData.
 * This is the "Backend Verification" step of the identity flow.
 */
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error('TELEGRAM_BOT_TOKEN is not configured in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // Create the data check string by sorting keys alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Generate the secret key from the bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    // Generate the HMAC hash to compare with the one from Telegram
    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return NextResponse.json({ error: 'Invalid Telegram data signature' }, { status: 403 });
    }

    const userRaw = urlParams.get('user');
    if (!userRaw) {
      return NextResponse.json({ error: 'No user data found in initData' }, { status: 400 });
    }

    const telegramUser = JSON.parse(userRaw);
    return NextResponse.json(telegramUser);
  } catch (error) {
    console.error('Telegram Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
