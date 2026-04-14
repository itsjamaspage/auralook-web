import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/lib/verify-telegram';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

/**
 * @fileOverview Secure Telegram Authentication Route.
 * Fixed: Initialization moved inside handler to prevent build-time crashes.
 * Fixed: CORS headers added to allow requests from Telegram WebApp sandboxed iframes (null origin).
 */

export const dynamic = 'force-dynamic';

// Telegram WebApp runs inside a sandboxed iframe which sends Origin: null.
// The auth itself is secured by HMAC-SHA256 verification, so allowing * is safe.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData || !verifyTelegramInitData(initData)) {
      console.warn('[Security] Unauthorized Telegram Auth Attempt Blocked.');
      return NextResponse.json({ error: 'Unauthorized: Invalid or Expired Signature' }, { status: 401, headers: CORS_HEADERS });
    }

    const urlParams = new URLSearchParams(initData);
    const userRaw = urlParams.get('user');

    if (!userRaw) {
      return NextResponse.json({ error: 'Missing user profile' }, { status: 400, headers: CORS_HEADERS });
    }

    const telegramUser = JSON.parse(userRaw);

    // Admin SDK initialization happens here at runtime, not build-time
    const admin = getFirebaseAdmin();
    const auth = admin.auth();

    // Generate custom token for the permanent Telegram ID
    const firebaseToken = await auth.createCustomToken(String(telegramUser.id), {
      username: telegramUser.username ?? '',
    });

    return NextResponse.json({ ...telegramUser, firebaseToken }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('Telegram Verification Critical Failure:', error);
    return NextResponse.json({ error: 'Internal validation error' }, { status: 500, headers: CORS_HEADERS });
  }
}
