
import crypto from 'crypto';

/**
 * @fileOverview Server-side Telegram initData verification utility.
 * Implements HMAC signature validation and replay attack prevention.
 */

export function verifyTelegramInitData(initData: string): boolean {
  if (!initData) return false;
  
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  
  if (!hash || !authDate) return false;

  // 1. Replay Attack Prevention: Reject if the initData is older than 5 minutes (300 seconds)
  // Industry standard for Telegram Mini Apps to prevent session theft.
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > 300) {
    console.warn('[Security] Expired Telegram initData rejected.');
    return false;
  }

  // 2. Signature Verification
  params.delete('hash');

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[Security] TELEGRAM_BOT_TOKEN missing for verification.');
    return false;
  }

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(token)
    .digest();

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}
