# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 LIVE DEPLOYMENT PROGRESS
You have successfully configured the **Identity System** (Secret 1/3). To finish the "Live" setup, run these remaining commands in your terminal:

1. **Set Admin ID** (For receiving orders):
   `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_ADMIN_CHAT_ID`
   *(Paste your Telegram Chat ID and select **Production**)*

2. **Set AI Key** (For Size Advisor):
   `npx -y firebase-tools@latest apphosting:secrets:set GEMINI_API_KEY`
   *(Paste your Gemini API Key and select **Production**)*

**Final Step:** Once all 3 are set, go to the **Firebase Console** and trigger a **New Rollout**. The build will now succeed and the bot features will activate.

---

## 🤖 Telegram Bot Setup

### 1. Link your Bot to the Website
1.  Open **[@BotFather](https://t.me/BotFather)** on Telegram.
2.  Send `/mybots` and select your bot from the list.
3.  Go to **Bot Settings** > **Menu Button** > **Configure menu button**.
4.  Send the URL of your site: `https://studio-2916828899-aeb98.web.app`
5.  Enter a button name, for example: `🛍 Open Auralook`

---

## 📖 Technical Details

### 🔐 How identity works
The app verifies the "Handshake" signature from Telegram using your `TELEGRAM_BOT_TOKEN`. This ensures that when someone clicks "Buy", they are exactly who they say they are.

### 🛠 Developer Bypass (Demo Mode)
While testing in Firebase Studio or if secrets are not yet configured, the app enters **Demo Mode**. This allows you to browse and test the UI without needing to be inside Telegram.

---
*Created with Firebase Studio*
