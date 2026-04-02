# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 LIVE DEPLOYMENT FIX (Action Required)
Your build failed because the server is looking for "Secrets" that don't exist in your project yet. To fix this, run these commands in your local terminal **one by one**. 

**Note:** These commands are interactive. Do not include your token in the command itself.

1. **Set Bot Token**:
   `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_BOT_TOKEN`
   *(When prompted, paste your bot token)*

2. **Set Admin ID**:
   `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_ADMIN_CHAT_ID`
   *(When prompted, paste your Telegram ID or Chat ID)*

3. **Set AI Key**:
   `npx -y firebase-tools@latest apphosting:secrets:set GEMINI_API_KEY`
   *(When prompted, paste your Gemini API Key)*

*After running these, trigger a new deployment in the Firebase Console. The build system will now be able to securely resolve these variables.*

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

### 🛠 Developer Bypass
While testing in Firebase Studio, the app enters **Demo Mode** because the Telegram environment is missing. This allows you to browse and test the UI without needing to be inside Telegram.

---
*Created with Firebase Studio*
