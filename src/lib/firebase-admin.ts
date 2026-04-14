import admin from 'firebase-admin';

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized && !admin.apps.length) {
    // Try automatic initialization first (best for Firebase App Hosting)
    try {
      admin.initializeApp(); // This uses the environment provided by App Hosting
      console.log('Firebase Admin initialized with default credentials');
    } catch (error) {
      // Fallback to manual service account if needed
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized with service account');
      } else {
        throw new Error('Missing Firebase Admin credentials. Check your environment variables.');
      }
    }
    initialized = true;
  }

  return admin;
}