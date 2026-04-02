
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API Route to verify Telegram WebApp initData.
 * Implements Replay Protection by checking auth_date.
 */
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error('TELEGRAM_BOT_TOKEN is not configured.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // 1. Replay Protection: Check if data is older than 5 minutes
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 300) {
      return NextResponse.json({ error: 'Telegram data has expired (Replay Protection)' }, { status: 403 });
    }

    // 2. Data Integrity: Verify HMAC Signature
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return NextResponse.json({ error: 'Invalid Telegram data signature' }, { status: 403 });
    }

    const userRaw = urlParams.get('user');
    if (!userRaw) {
      return NextResponse.json({ error: 'No user data found' }, { status: 400 });
    }

    const telegramUser = JSON.parse(userRaw);
    return NextResponse.json(telegramUser);
  } catch (error) {
    console.error('Telegram Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
