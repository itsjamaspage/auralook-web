# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

## 🤖 Telegram Bot & AI Setup (Final Steps)
To activate order notifications and AI features, you must add your keys to the backend service in the Google Cloud Console.

### 1. Find Your Backend Service
1.  **DIRECT LINK**: [Click here to open your Backend Config](https://console.cloud.google.com/run/detail/us-central1/ssrstudio2916828899aeb9/revisions?project=studio-2916828899-aeb98)
2.  **MANUAL FIND**:
    *   Open the [Google Cloud Console](https://console.cloud.google.com/).
    *   **CRITICAL**: In the top-left project dropdown, click the project name and search for the ID: **`studio-2916828899-aeb98`**. Select it.
    *   Go to **Cloud Run** -> **Services**.
    *   Click on the service name: `ssrstudio2916828899aeb9`.

### 2. Enter Your Secret Keys
1.  Click **EDIT & DEPLOY NEW REVISION** at the top of the service page.
2.  Go to the **Variables & Secrets** tab.
3.  Add the following three **Environment Variables**:
    *   **TELEGRAM_BOT_TOKEN**: (Get this from [@BotFather](https://t.me/BotFather))
    *   **TELEGRAM_ADMIN_CHAT_ID**: (Get your personal ID from [@userinfobot](https://t.me/userinfobot))
    *   **GEMINI_API_KEY**: (Your Google AI API key from [AI Studio](https://aistudio.google.com/))
4.  Click **DEPLOY** at the bottom of the page.

### 3. Connect to Telegram
1.  In @BotFather, select your bot -> **Bot Settings** -> **Menu Button**.
2.  Set the URL to: `https://studio-2916828899-aeb98.web.app`
3.  Set the Title to: `Open Store`

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit for perfect fit recommendations.
- **Telegram Notifications**: Real-time order alerts sent directly to you.
- **Futuristic UI**: Neon-themed interface with shimmering skeleton loaders and global route transitions.

---
*Created with Firebase Studio*
