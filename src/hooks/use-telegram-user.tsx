
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
  is_premium?: boolean;
}

interface UserProfile {
  id: string;
  firstName: string;
  username: string | null;
  phone: string | null;
  updatedAt: any;
}

interface TelegramUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isVerified: boolean;
}

const TelegramUserContext = createContext<TelegramUserContextType | undefined>(undefined);

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    async function authenticate() {
      // Check if running in Telegram environment
      const tg = (window as any).Telegram?.WebApp;
      if (!tg || !tg.initData) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (res.ok) {
          const telegramUser: TelegramUser = await res.json();
          const uid = `tg_${telegramUser.id}`;
          const userRef = doc(db, 'users', uid);
          
          // Sync with Firestore
          const userData = {
            id: uid,
            firstName: telegramUser.first_name,
            username: telegramUser.username || null,
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, userData, { merge: true });
          
          // Fetch full profile (to get phone if it exists)
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUser(snap.data() as UserProfile);
          } else {
            setUser(userData as any);
          }
          
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Identity sync failed:', error);
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
