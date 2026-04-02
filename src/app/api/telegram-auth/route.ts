
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API Route to verify Telegram WebApp initData.
 * Implements Replay Protection and Identity Verification.
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

    // 1. Lenient Replay Protection: 24 hours (86400 seconds)
    // Avoids failures due to minor clock skews on user devices.
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return NextResponse.json({ error: 'Session has expired. Please reload the bot.' }, { status: 403 });
    }

    // 2. Data Integrity: Sort and verify HMAC Signature
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
      return NextResponse.json({ error: 'Identity verification failed (Invalid Signature)' }, { status: 403 });
    }

    const userRaw = urlParams.get('user');
    if (!userRaw) {
      return NextResponse.json({ error: 'Missing user profile data' }, { status: 400 });
    }

    const telegramUser = JSON.parse(userRaw);
    
    return NextResponse.json({
      ...telegramUser,
      verified: true,
      lastSeen: new Date().toISOString()
    });
  } catch (error) {
    console.error('Telegram Auth Error:', error);
    return NextResponse.json({ error: 'Internal secure session error' }, { status: 500 });
  }
}
