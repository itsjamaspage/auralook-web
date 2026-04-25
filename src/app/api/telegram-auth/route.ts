import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/lib/verify-telegram';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Telegram WebApp runs inside a sandboxed iframe — HMAC-SHA256 is the real guard here
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate limit: 10 requests per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (isRateLimited(ip)) {
      console.warn(`[Security] Rate limit hit for IP: ${ip}`);
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: CORS_HEADERS });
    }

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
    const message = error instanceof Error ? error.message : String(error);
    console.error('Telegram Verification Critical Failure:', message);
    return NextResponse.json({ error: 'Internal validation error', detail: message }, { status: 500, headers: CORS_HEADERS });
  }
}
