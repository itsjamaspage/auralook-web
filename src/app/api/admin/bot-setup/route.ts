
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Administrative tool to sync the Telegram Webhook and Menu Button.
 * Accepts GET (browser-friendly) or POST. Visit /api/admin/bot-setup in the browser to sync.
 */

async function runSetup() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
  const webhookUrl = `${baseUrl}/api/webhook/telegram`;
  
  // Use a fresh timestamp to force-refresh the Mini App cache
  const cacheBusterUrl = `${baseUrl}?v=${Date.now()}`;

  if (!token) {
    return NextResponse.json({ success: false, message: 'TELEGRAM_BOT_TOKEN missing.' }, { status: 500 });
  }

  try {
    // 1. Reset Webhook
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] }),
    });
    const webhookResult = await webhookRes.json();

    // 2. Synchronize Menu Button (The button in the bottom left)
    // This ensures both buttons (Start and Menu) are identical
    const menuRes = await fetch(`https://api.telegram.org/bot${token}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Auralook',
          web_app: { url: cacheBusterUrl }
        }
      })
    });
    const menuResult = await menuRes.json();

    if (webhookResult.ok && menuResult.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'All bot buttons synchronized to latest version.',
        url: cacheBusterUrl
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Sync failed for one or more protocols.',
        details: { webhook: webhookResult, menu: menuResult } 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[Bot Setup] Protocol Failure:', error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  return runSetup();
}

export async function POST(_req: NextRequest) {
  return runSetup();
}
