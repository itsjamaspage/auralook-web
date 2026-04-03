
# Auralook.uz - Build Recovery Manual

The build is currently failing because secrets cannot contain colons (`:`). I have standardized the code to look for standard names.

## 🚀 Step-by-Step Fix

1.  **Authorization**:
    If you see a "401" error in your terminal, please **refresh this browser tab**. This will re-authorize your session.

2.  **Set the Bot Token**:
    Copy and paste this command exactly into the terminal:
    `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_BOT_TOKEN`
    
    *When it asks for the value, paste:*
    `7753160211:AAEwvUukuDraQxy4NQrujVnshkEIYnLqZJM`

3.  **Set the Admin ID**:
    `npx -y firebase-tools@latest apphosting:secrets:set TELEGRAM_ADMIN_CHAT_ID`
    
    *When it asks for the value, paste:*
    `7213073025`

4.  **Finalize**:
    Go to the **Firebase Console** -> **App Hosting** -> **Rollouts** and click **"New Rollout"**.

## 🛠 Stability Updates
- Added **Composite Index** for the Orders page to prevent "Permission Denied" crashes.
- Hardened **Identity Bridge** to ensure smooth login even without tokens.
- Cleaned up **Security Rules** for production reliability.
