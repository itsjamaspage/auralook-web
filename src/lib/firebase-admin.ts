import admin from 'firebase-admin';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized && !admin.apps.length) {
    // Try automatic initialization first (best for Firebase App Hosting)
    try {
      admin.initializeApp();
      console.log('[firebase-admin] Initialized with Application Default Credentials');
    } catch (autoInitError) {
      console.warn('[firebase-admin] Auto-init failed:', autoInitError instanceof Error ? autoInitError.message : autoInitError);

      // Fallback to manual service account
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-2916828899-aeb98';
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          projectId,
        });
        console.log('[firebase-admin] Initialized with service account credentials');
      } else {
        console.error('[firebase-admin] Missing credentials — FIREBASE_CLIENT_EMAIL:', !!clientEmail, 'FIREBASE_PRIVATE_KEY:', !!privateKey);
        throw new Error(`Firebase Admin credentials missing. Auto-init error: ${autoInitError instanceof Error ? autoInitError.message : autoInitError}`);
      }
    }
    initialized = true;
  }

  return admin;
}