
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Backend verification of Telegram WebApp initData.
 * Confirms the user identity using the BOT_TOKEN HMAC signature.
 */
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error('TELEGRAM_BOT_TOKEN is missing from server configuration.');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    // 1. Sort keys alphabetically to construct the data check string
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // 2. Signature Verification using SHA256 HMAC
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    const hmac = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (hmac !== hash) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Signature' }, { status: 401 });
    }

    // 3. Extract and return the user profile
    const userRaw = urlParams.get('user');
    if (!userRaw) {
      return NextResponse.json({ error: 'Missing user profile' }, { status: 400 });
    }

    const telegramUser = JSON.parse(userRaw);
    
    return NextResponse.json(telegramUser);
  } catch (error) {
    console.error('Telegram Verification Critical Failure:', error);
    return NextResponse.json({ error: 'Internal validation error' }, { status: 500 });
  }
}
