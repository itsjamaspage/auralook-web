# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

## 🤖 Telegram Bot Final Setup
Follow these steps to activate the AI order notifications:

### 1. Bot Creation
1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Run `/newbot` and follow the prompts.
3. **Copy the API Token** provided.

### 2. Identify Admin
1. Open [@userinfobot](https://t.me/userinfobot) on Telegram.
2. Copy your **Id** (e.g., `123456789`).

### 3. Connect the Web App
1. In @BotFather, go to `/mybots` -> Select your bot.
2. **Bot Settings** > **Menu Button** > **Configure menu button**.
3. **URL**: `https://studio-2916828899-aeb98.web.app`
4. **Title**: `Open Store`

### 4. Configuration (Environment Variables)
Add these to your project settings (in Google Cloud Console -> Cloud Functions -> SSR Function -> Configuration):
- `TELEGRAM_BOT_TOKEN`: *Your Token from Step 1*
- `TELEGRAM_ADMIN_CHAT_ID`: *Your Id from Step 2*
- `GEMINI_API_KEY`: *Your Google AI API Key*

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit to recommend the perfect fit.
- **Telegram Notifications**: Real-time order alerts sent directly to you.
- **Futuristic UI**: High-performance, neon-themed interface with multi-language support.

---
*Created in Firebase Studio*