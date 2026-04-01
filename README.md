# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

## 🤖 Telegram Bot & AI Setup
To activate the AI and order notifications, you must add your secret keys to the Cloud Function:

### 1. Identify Your Keys
*   **TELEGRAM_BOT_TOKEN**: Get this from [@BotFather](https://t.me/BotFather) after creating your bot.
*   **TELEGRAM_ADMIN_CHAT_ID**: Get your personal ID from [@userinfobot](https://t.me/userinfobot).
*   **GEMINI_API_KEY**: Your Google AI API key (from Google AI Studio).

### 2. Access the SSR Function
1.  Open the [Google Cloud Console](https://console.cloud.google.com/).
2.  Ensure your project **studio-2916828899-aeb98** is selected in the top bar.
3.  Search for **"Cloud Functions"** in the search bar and click it.
4.  Find the function named: `ssrstudio2916828899aeb9` (it might have a long suffix).
5.  Click on the function name, then click the **EDIT** button at the top.
6.  Scroll down and click **"Runtime, build, connections and security settings"**.
7.  Under the **"Environment variables"** section, click **ADD VARIABLE** for each of these:
    *   `TELEGRAM_BOT_TOKEN`
    *   `TELEGRAM_ADMIN_CHAT_ID`
    *   `GEMINI_API_KEY`
8.  Click **NEXT**, then click **DEPLOY**.

### 3. Connect the Web App to Telegram
1.  In @BotFather, go to `/mybots` -> Select your bot.
2.  **Bot Settings** > **Menu Button** > **Configure menu button**.
3.  **URL**: `https://studio-2916828899-aeb98.web.app`
4.  **Title**: `Open Store`

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit to recommend the perfect fit.
- **Telegram Notifications**: Real-time order alerts sent directly to you.
- **Futuristic UI**: High-performance, neon-themed interface with multi-language support.

---
*Created in Firebase Studio*
