
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

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
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 403 });
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
