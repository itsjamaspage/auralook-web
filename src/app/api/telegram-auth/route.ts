
import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/lib/verify-telegram';

/**
 * Backend verification of Telegram WebApp initData.
 * Implements strict verification via verifyTelegramInitData utility.
 */
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData || !verifyTelegramInitData(initData)) {
      console.warn('[Security] Unauthorized Telegram Auth Attempt Blocked.');
      return NextResponse.json({ error: 'Unauthorized: Invalid or Expired Signature' }, { status: 401 });
    }

    const urlParams = new URLSearchParams(initData);
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
