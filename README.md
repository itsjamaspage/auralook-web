
# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 LIVE DEPLOYMENT PROGRESS
You have encountered a **Build Failure** because your secrets are missing or incorrectly named. Please follow these exact steps in your terminal to fix it:

1. **Fix Authentication**:
   If the commands below fail with a 401 error, run this first:
   `npx -y firebase-tools@latest login --no-localhost`
   *(Follow the link to login)*

2. **Set Bot Token**:
   `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_BOT_TOKEN`
   *(When prompted, paste your token like `7753160211:AAEwvUukuDraQxy4NQrujVnshkEIYnLqZJM` and select **Production**)*

3. **Set Admin ID**:
   `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_ADMIN_CHAT_ID`
   *(Paste your Telegram Chat ID, e.g., `7213073025`)*

**Final Step:** Once both are set, go to the **Firebase Console** and trigger a **New Rollout**. The build will now succeed and the bot features will activate.

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
