
# Auralook.uz - Final Deployment Guide

The code is now optimized for both the Studio Preview and the Live production site.

## ✅ Notifications (Preview)
I have added the credentials to your `.env` file. Notifications triggered from the **Studio Preview** should work immediately.

## 🚀 Notifications (Live Site)
The build is currently failing because Google Cloud needs you to verify the secrets in the UI.

1. **Firebase Console**: Open your project `studio-2916828899-aeb98`.
2. **Secrets Tab**: Navigate to **App Hosting** -> **Studio** -> **Secrets** (or Settings).
3. **Set Token**: Add a secret named `TELEGRAM_BOT_TOKEN` and paste your value `7753160211:AAEwvUukuDraQxy4NQrujVnshkEIYnLqZJM`.
4. **Set Admin**: Add a secret named `TELEGRAM_ADMIN_CHAT_ID` and paste `7213073025`.
5. **Redeploy**: Click **"New Rollout"** in the Rollouts tab.

## 🛠 Stability Updates
- **Size Advisor**: Removed from navigation per request.
- **Index Bypass**: Orders load without database index requirements.
- **Identity Guard**: App waits for Firebase Auth before querying data to prevent crashes.
