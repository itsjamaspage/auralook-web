
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

/**
 * Administrative tool to sync the Telegram Webhook and Menu Button.
 * Accepts either:
 *   - X-Admin-Secret header / ?secret= query param (for curl/CI use)
 *   - Firebase ID token from an owner account (for in-app use)
 */

const OWNER_IDS = ['6884517020', '7213073025'];

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Option A: static secret (for server/CI access)
  const expected = process.env.ADMIN_SECRET;
  if (expected) {
    const fromHeader = req.headers.get('x-admin-secret');
    const fromQuery = req.nextUrl.searchParams.get('secret');
    if (fromHeader === expected || fromQuery === expected) return true;
  }

  // Option B: Firebase ID token from a verified owner account
  const authorization = req.headers.get('Authorization');
  const idToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!idToken) return false;
  try {
    const admin = getFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (OWNER_IDS.includes(decoded.uid)) return true;
    const roleSnap = await admin.firestore().doc(`roles/${decoded.uid}`).get();
    return roleSnap.exists && roleSnap.data()?.role === 'owner';
  } catch {
    return false;
  }
}

async function runSetup() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auralook.uz';
  const webhookUrl = `${baseUrl}/api/webhook/telegram`;
  const cacheBusterUrl = `${baseUrl}?v=${Date.now()}`;

  if (!token) {
    return NextResponse.json({ success: false, message: 'TELEGRAM_BOT_TOKEN missing.' }, { status: 500 });
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
    });
    const webhookResult = await webhookRes.json();

    const menuRes = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: { type: 'web_app', text: 'Auralook', web_app: { url: cacheBusterUrl } }
      }),
    });
    const menuResult = await menuRes.json();

    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start',    description: 'Botni boshlash / Запустить бота / Start bot' },
          { command: 'tracking', description: 'Buyurtmalarimni kuzatish / Отследить заказы / Track my orders' },
        ]
      }),
    });

    await fetch(`https://api.telegram.org/bot${token}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: '👋 Auralook — Xitoydan kiyim buyurtmasi platformasi.\n\nBotni boshlash uchun /start bosing yoki istalgan xabar yozing.'
      }),
    });

    if (webhookResult.ok && menuResult.ok) {
      return NextResponse.json({ success: true, message: 'All bot settings synchronized.', url: cacheBusterUrl });
    }
    return NextResponse.json({ success: false, message: 'Sync failed.', details: { webhook: webhookResult, menu: menuResult } }, { status: 400 });
  } catch (error) {
    console.error('[Bot Setup] Protocol Failure:', error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return runSetup();
}

export async function POST(req: NextRequest) {
  if (!await isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return runSetup();
}

