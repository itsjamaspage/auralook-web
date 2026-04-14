'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Logs errors to the console for debugging — does NOT throw, as permission errors
 * when auth is loading are expected and should not crash the app.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn('[FirebaseErrorListener] Firestore permission error (may resolve after auth):', error.message);
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
