
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Administrative tool to sync the Telegram Webhook.
 * This should be triggered from the Admin Panel when the bot stops responding.
 */

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://studio--studio-2916828899-aeb98.us-central1.hosted.app';
  const webhookUrl = `${baseUrl}/api/webhook/telegram`;

  if (!token) {
    return NextResponse.json({ success: false, message: 'TELEGRAM_BOT_TOKEN missing.' }, { status: 500 });
  }

  try {
    // 1. Delete existing webhook or polling session
    await fetch(`https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`);

    // 2. Set new webhook
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}&allowed_updates=["message"]`);
    const result = await response.json();

    if (result.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook established successfully.',
        url: webhookUrl
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Telegram API rejected webhook.',
        details: result 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[Bot Setup] Error:', error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
