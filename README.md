# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

## 🤖 Telegram Bot & AI Setup (Critical)
To activate order notifications and AI features, you must add your keys to the Cloud Function:

### 1. Identify Your Keys
*   **TELEGRAM_BOT_TOKEN**: Get this from [@BotFather](https://t.me/BotFather).
*   **TELEGRAM_ADMIN_CHAT_ID**: Get your personal ID from [@userinfobot](https://t.me/userinfobot).
*   **GEMINI_API_KEY**: Your Google AI API key (from Google AI Studio).

### 2. Configure the SSR Function
1.  Open the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select project: **studio-2916828899-aeb98**.
3.  Search for **"Cloud Functions"** and click it.
4.  Click on the function starting with: `ssrstudio2916828899aeb9`.
5.  Click **EDIT** -> **Runtime, build, connections and security settings**.
6.  Under **Environment variables**, add the three keys listed above.
7.  Click **NEXT** -> **DEPLOY**.

### 3. Connect to Telegram
1.  In @BotFather, select your bot -> **Bot Settings** -> **Menu Button**.
2.  Set the URL to: `https://studio-2916828899-aeb98.web.app`

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit for perfect fit recommendations.
- **Telegram Notifications**: Real-time order alerts for the administrator.
- **Futuristic UI**: High-performance, neon-themed interface.

---
*Created in Firebase Studio*
