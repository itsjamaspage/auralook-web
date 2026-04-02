
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
  telegramId: number;
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

const CACHE_KEY = 'auralook_user_protocol';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    // 1. Initial Load from Cache for speed
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setUser(JSON.parse(cached));
      setIsVerified(true);
    }

    async function authenticate() {
      const tg = (window as any).Telegram?.WebApp;
      
      if (!tg || !tg.initData) {
        console.warn('Protocol Bypass: App not in Telegram environment.');
        setIsLoading(false);
        return;
      }

      tg.ready();
      tg.expand();

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
          
          // Generate fallback avatar if needed
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(telegramUser.first_name)}&background=00FF88&color=000&bold=true`;

          const userData: Partial<UserProfile> = {
            id: uid,
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            username: telegramUser.username || null,
            photoUrl: telegramUser.photo_url || fallbackAvatar,
            updatedAt: serverTimestamp(),
          };

          // Background Sync to Firestore
          await setDoc(userRef, userData, { merge: true });
          
          const snap = await getDoc(userRef);
          const finalUser = snap.exists() ? (snap.data() as UserProfile) : (userData as UserProfile);
          
          setUser(finalUser);
          localStorage.setItem(CACHE_KEY, JSON.stringify(finalUser));
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Handshake failed:', error);
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
