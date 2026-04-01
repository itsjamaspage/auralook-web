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
2.  **⚠️ CRITICAL**: DO NOT change or type anything in the **"Container image URL"** box. If you accidentally deleted it, see the **Recovery** section below.
3.  Go to the **Variables & Secrets** tab.
4.  Add the following three **Environment Variables**:
    *   **TELEGRAM_BOT_TOKEN**: (Get this from [@BotFather](https://t.me/BotFather))
    *   **TELEGRAM_ADMIN_CHAT_ID**: (Get your personal ID from [@userinfobot](https://t.me/userinfobot))
    *   **GEMINI_API_KEY**: (Your Google AI API key from [AI Studio](https://aistudio.google.com/))
5.  Click **DEPLOY** at the bottom of the page.

### 🛠 Recovery: If the Image URL is missing or showing an error
If you see "Expected an image path..." and the Deploy button is disabled:
1.  Click the **Select** button next to the "Container image URL" box.
2.  In the sidebar, click the arrow next to `firebaseapphosting-images`.
3.  Click the sub-folder that appears.
4.  Select the **most recent image** (top of the list).
5.  Click **Select**. The technical URL will be restored.
6.  You can now click **Deploy**.

---

## 📖 Technical Glossary (What are these things?)

### 📦 Container Image URL
**What is it?** A "digital snapshot" of your entire app.
**Why?** Cloud Run uses this URL to load your code. Without it, the server doesn't know what app to run.

### 🔑 Environment Variables
**What are they?** Secure settings like API keys (passwords).
**Why?** We keep them here instead of in the code so they stay secret and can be changed without rebuilding the whole app.

### 🤖 Gemini API Key
**What is it?** Your "license" to use Google's most powerful AI.
**Why?** It powers the Size Advisor and the automatic product descriptions in your store.

---
*Created with Firebase Studio*