# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

## 🤖 Telegram Bot & AI Setup (Critical)
To activate order notifications and AI features, you must add your keys to the backend service.

### 1. Identify Your Keys
*   **TELEGRAM_BOT_TOKEN**: Get this from [@BotFather](https://t.me/BotFather).
*   **TELEGRAM_ADMIN_CHAT_ID**: Get your personal ID from [@userinfobot](https://t.me/userinfobot).
*   **GEMINI_API_KEY**: Your Google AI API key (from [Google AI Studio](https://aistudio.google.com/)).

### 2. Configure the Backend Service (Google Cloud)
1.  Open the [Google Cloud Console](https://console.cloud.google.com/).
2.  **CRITICAL STEP**: Look at the top-left dropdown (next to the "Google Cloud" logo). 
    *   If it says **"Auralook bot"**, click it.
    *   Search for **"2916828899"** and select the project **"studio-2916828899-aeb98"**.
3.  Search for **"Cloud Run"** in the top search bar.
4.  On the left sidebar, click **"Services"**.
5.  Click on the service name: `ssrstudio2916828899aeb9...`.
6.  Click **EDIT & DEPLOY NEW REVISION** at the top.
7.  Go to the **Variables & Secrets** tab.
8.  Add the three keys listed above as environment variables.
9.  Click **DEPLOY** at the bottom.

### 3. Connect to Telegram
1.  In @BotFather, select your bot -> **Bot Settings** -> **Menu Button**.
2.  Set the URL to: `https://studio-2916828899-aeb98.web.app`
3.  Set the Title to: `Open Store`

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit for perfect fit recommendations.
- **Telegram Notifications**: Real-time order alerts for the administrator.
- **Futuristic UI**: High-performance, neon-themed interface with shimmering skeleton loaders.

---
*Created in Firebase Studio*
