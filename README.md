# Auralook.uz - AI-Powered Techwear Store

This is a futuristic clothing store prototype built with Next.js, Firebase, and Genkit. It features an AI Smart Size Advisor and deep integration with Telegram.

## 🚀 Deployment Status
The app is configured for **Firebase Hosting** with Next.js SSR support.

## 🤖 Telegram Bot Setup
To finish the integration, follow these steps:

1. **Bot Token**: Get your token from [@BotFather](https://t.me/BotFather).
2. **Admin ID**: Get your personal ID from [@userinfobot](https://t.me/userinfobot).
3. **Environment Variables**: Add them to your `.env` file:
   ```bash
   TELEGRAM_BOT_TOKEN=your_token_here
   TELEGRAM_ADMIN_CHAT_ID=your_id_here
   ```
4. **Mini App Connection**: 
   - Open @BotFather -> `/mybots` -> Select your bot.
   - **Bot Settings** > **Menu Button** > **Configure menu button**.
   - Paste your Firebase Hosting URL (e.g., `https://your-project.web.app`).
   - Title: `Open Store`

## 🛠 Features
- **AI Smart Size Advisor**: Uses Genkit to recommend the perfect fit based on height, weight, and style.
- **Telegram Notifications**: Real-time order alerts sent directly to the store manager.
- **Futuristic UI**: High-performance, neon-themed interface with multi-language support (UZ/RU/EN).

---
*Created in Firebase Studio*