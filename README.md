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
    *   Ensure the project ID **`studio-2916828899-aeb98`** is selected at the top.
    *   Go to **Cloud Run** -> **Services**.
    *   Click on the service: `ssrstudio2916828899aeb9`.

### 2. Enter Your Secret Keys
1.  Click **EDIT & DEPLOY NEW REVISION** at the top.
2.  Go to the **Variables & Secrets** tab.
3.  Add the following three **Environment Variables**:
    *   **TELEGRAM_BOT_TOKEN**: (Get this from [@BotFather](https://t.me/BotFather))
    *   **TELEGRAM_ADMIN_CHAT_ID**: (Get your personal ID from [@userinfobot](https://t.me/userinfobot))
    *   **GEMINI_API_KEY**: (Your Google AI API key from [AI Studio](https://aistudio.google.com/))
4.  Click **DEPLOY** at the bottom of the page.

### 🧠 How to get the Gemini API Key
1.  Go to [aistudio.google.com](https://aistudio.google.com/).
2.  Click **"Get API key"** on the left.
3.  Select any existing project (like `ai-studio-applet-...`) and click **"Create API key in existing project"**.
4.  **Copy** the long string of letters and numbers.
5.  **Paste** it into the Cloud Run variable `GEMINI_API_KEY`.

### 🔗 How is this "connected" to my app?
The connection is established purely through the **API Key string**. When you paste that key into your Cloud Run "Variables", your app's code uses it to authenticate with Google's AI servers. It doesn't matter which AI Studio project you use; the key is the "digital bridge" that activates the AI features in your store.

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