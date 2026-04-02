# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Live Deployment
Your store is live at: **[https://studio-2916828899-aeb98.web.app](https://studio-2916828899-aeb98.web.app)**

---

## 🤖 Telegram Bot & AI Setup (Required)
To activate identity verification and order notifications, you must follow these two steps:

### 1. Link your Bot to the Website
1.  Open **[@BotFather](https://t.me/BotFather)** on Telegram.
2.  Send `/mybots` and select your bot from the list.
3.  Go to **Bot Settings** > **Menu Button** > **Configure menu button**.
4.  Send the URL of your site: `https://studio-2916828899-aeb98.web.app`
5.  Enter a button name, for example: `🛍 Open Auralook`

### 2. Add Your Secret Keys (Backend)
Your bot and AI features need "passwords" (API keys) to work. You must add these to your backend settings in the Google Cloud Console.

1.  **Open Backend Config**: [Click here to open your Cloud Run Settings](https://console.cloud.google.com/run/detail/us-central1/ssrstudio2916828899aeb9/revisions?project=studio-2916828899-aeb98)
2.  Click **EDIT & DEPLOY NEW REVISION** at the top.
3.  Scroll down to the **Variables & Secrets** tab.
4.  Add the following **Environment Variables**:
    *   `TELEGRAM_BOT_TOKEN`: The token you got from @BotFather.
    *   `TELEGRAM_ADMIN_CHAT_ID`: Your personal Telegram ID (Get it from [@userinfobot](https://t.me/userinfobot)).
    *   `GEMINI_API_KEY`: Your Google AI key (Get it from [Google AI Studio](https://aistudio.google.com/)).
5.  Click **DEPLOY** at the bottom.

---

## 📖 Technical Details

### 📦 Why use Environment Variables?
We don't put tokens in the code because it's insecure. By adding them to the Cloud Run dashboard, only your server can see them.

### 🔐 How identity works
The app verifies the "Handshake" signature from Telegram using your `TELEGRAM_BOT_TOKEN`. This ensures that when someone clicks "Buy", they are exactly who they say they are.

---
*Created with Firebase Studio*
