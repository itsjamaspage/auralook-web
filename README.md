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
2.  **⚠️ CRITICAL**: DO NOT change or type anything in the **"Container image URL"** box. If it is empty or shows an error, see the **Recovery** section below.
3.  Go to the **Variables & Secrets** tab.
4.  Add the following three **Environment Variables**:
    *   **TELEGRAM_BOT_TOKEN**: (Get this from [@BotFather](https://t.me/BotFather))
    *   **TELEGRAM_ADMIN_CHAT_ID**: (Get your personal ID from [@userinfobot](https://t.me/userinfobot))
    *   **GEMINI_API_KEY**: (Your Google AI API key from [AI Studio](https://aistudio.google.com/))
5.  Click **DEPLOY** at the bottom of the page.

### 🛠 Recovery: What if the Image URL is missing?
If you accidentally deleted the Image URL and the "Deploy" button is disabled:
1.  Go to the **REVISIONS** tab of your Cloud Run service.
2.  Click the revision with the **green checkmark**.
3.  Copy the **Image URL** from the details pane on the right.
4.  Return to **EDIT & DEPLOY NEW REVISION** and paste that URL back into the box.

### 🧠 Why the Gemini API Key?
Your store uses Gemini AI for:
- **Smart Size Advisor**: Calculating the perfect fit for customers.
- **AI Product Descriptions**: Generating professional Uzbek content for your catalog.
- **Smart Order Alerts**: Personalized Telegram notifications.

### 🔗 How is this "connected" to my app?
The connection is established purely through the **API Key string**. When you paste that key into your Cloud Run "Variables", your app's code uses it to authenticate with Google's AI servers.

### 3. Connect to Telegram
1.  In @BotFather, select your bot -> **Bot Settings** -> **Menu Button**.
2.  Set the URL to: `https://studio-2916828899-aeb98.web.app`
3.  Set the Title to: `Open Store`

---
*Created with Firebase Studio*