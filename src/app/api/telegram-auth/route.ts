import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramInitData } from '@/lib/verify-telegram';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

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

    // Telegram ID becomes the permanent Firebase UID — stable forever, never rotates
    const firebaseToken = await getAuth().createCustomToken(String(telegramUser.id), {
      username: telegramUser.username ?? '',
    });

    return NextResponse.json({ ...telegramUser, firebaseToken });
  } catch (error) {
    console.error('Telegram Verification Critical Failure:', error);
    return NextResponse.json({ error: 'Internal validation error' }, { status: 500 });
  }
}