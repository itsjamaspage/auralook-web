
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  updatedAt: any;
}

interface TelegramUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isVerified: boolean;
}

const TelegramUserContext = createContext<TelegramUserContextType | undefined>(undefined);

/**
 * Context Provider that manages Telegram Identity without Firebase Auth.
 * Handles auto-detection, backend verification, and Firestore sync.
 */
export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    async function authenticate() {
      // 1. Check for Telegram environment
      const tg = (window as any).Telegram?.WebApp;
      
      if (!tg || !tg.initData) {
        console.warn('App is not running inside Telegram or initData is missing.');
        setIsLoading(false);
        return;
      }

      tg.ready();
      tg.expand();

      try {
        // 2. Verify identity on our backend
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (res.ok) {
          const telegramUser: TelegramUser = await res.json();
          const uid = `tg_${telegramUser.id}`;
          const userRef = doc(db, 'users', uid);
          
          // 3. Sync verified profile to Firestore
          const userData: Partial<UserProfile> = {
            id: uid,
            firstName: telegramUser.first_name,
            username: telegramUser.username || null,
            photoUrl: telegramUser.photo_url || null,
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, userData, { merge: true });
          
          // 4. Fetch full record (including saved phone number)
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUser(snap.data() as UserProfile);
          } else {
            setUser(userData as any);
          }
          
          setIsVerified(true);
        } else {
          console.error('Telegram identity verification failed on backend.');
        }
      } catch (error) {
        console.error('Identity sync process failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    authenticate();
  }, [db]);

  return (
    <TelegramUserContext.Provider value={{ user, isLoading, isVerified }}>
      {children}
    </TelegramUserContext.Provider>
  );
}

export function useTelegramUser() {
  const context = useContext(TelegramUserContext);
  if (context === undefined) {
    throw new Error('useTelegramUser must be used within a TelegramUserProvider');
  }
  return context;
}
