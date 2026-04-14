import admin from 'firebase-admin';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized && !admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'studio-2916828899-aeb98';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      // Explicit service account: most reliable for createCustomToken()
      // ADC-only init can fail on createCustomToken() if the Cloud Run service agent
      // lacks the iam.serviceAccounts.signBlob permission.
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        projectId,
      });
      console.log('[firebase-admin] Initialized with service account credentials');
    } else {
      // Fallback: Application Default Credentials (Firebase App Hosting environment)
      // Works for most operations but createCustomToken() may fail without signBlob permission.
      console.warn('[firebase-admin] FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY not set — falling back to ADC');
      try {
        admin.initializeApp({ projectId });
        console.log('[firebase-admin] Initialized with ADC, projectId:', projectId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(`Firebase Admin init failed: ${msg}`);
      }
    }

    initialized = true;
  }

  return admin;
}