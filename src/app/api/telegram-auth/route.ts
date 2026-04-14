import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/lib/verify-telegram';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

/**
 * @fileOverview Secure Telegram Authentication Route.
 * Fixed: Initialization moved inside handler to prevent build-time crashes.
 */

export const dynamic = 'force-dynamic';

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
    
    // Admin SDK initialization happens here at runtime, not build-time
    const admin = getFirebaseAdmin();
    const auth = admin.auth();

    // Generate custom token for the permanent Telegram ID
    const firebaseToken = await auth.createCustomToken(String(telegramUser.id), {
      username: telegramUser.username ?? '',
    });

    return NextResponse.json({ ...telegramUser, firebaseToken });
  } catch (error) {
    console.error('Telegram Verification Critical Failure:', error);
    return NextResponse.json({ error: 'Internal validation error' }, { status: 500 });
  }
}
