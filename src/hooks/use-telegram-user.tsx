
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
  lastSeen: any;
  createdAt: any;
  updatedAt: any;
}

interface TelegramUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isVerified: boolean;
  error: string | null;
}

const TelegramUserContext = createContext<TelegramUserContextType | undefined>(undefined);

const CACHE_KEY = 'auralook_user_protocol_v2.4.5';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useFirestore();

  useEffect(() => {
    // 1. Instant load from local cache to avoid flicker
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setIsVerified(true);
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    async function authenticate() {
      // Wait a moment for the bridge to initialize if script was just loaded
      const tg = (window as any).Telegram?.WebApp;
      
      if (!tg) {
        // Not in Telegram at all
        handleDemoMode('Protocol Bypass: No Telegram bridge detected.');
        return;
      }

      tg.ready();
      tg.expand();

      if (!tg.initData) {
        // In Telegram but opened via URL instead of Bot Button
        handleDemoMode('Protocol Bypass: initData is empty.');
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
          
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(telegramUser.first_name)}&background=00FF88&color=000&bold=true`;

          const existingDoc = await getDoc(userRef);
          
          const userData: any = {
            id: uid,
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            username: telegramUser.username || null,
            photoUrl: telegramUser.photo_url || fallbackAvatar,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          if (!existingDoc.exists()) {
            userData.createdAt = serverTimestamp();
            userData.phone = null;
          }

          await setDoc(userRef, userData, { merge: true });
          
          const finalUser = existingDoc.exists() 
            ? { ...(existingDoc.data() as UserProfile), ...userData } 
            : (userData as UserProfile);
          
          setUser(finalUser);
          localStorage.setItem(CACHE_KEY, JSON.stringify(finalUser));
          setIsVerified(true);
          setError(null);
        } else {
          const errData = await res.json();
          throw new Error(errData.error || 'Identity handshake failed');
        }
      } catch (err: any) {
        console.error('Handshake Error:', err);
        setError(err.message);
        // Fallback to demo in non-production environments
        if (process.env.NODE_ENV !== 'production') {
          handleDemoMode('Sync failed, using Demo fallback.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    function handleDemoMode(reason: string) {
      console.warn(reason);
      const mockUser: UserProfile = {
        id: 'tg_demo',
        telegramId: 0,
        firstName: 'Demo Voyager',
        username: 'demo_user',
        phone: '+998 90 000 00 00',
        photoUrl: 'https://ui-avatars.com/api/?name=Demo+Voyager&background=00FF88&color=000&bold=true',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(mockUser);
      setIsVerified(true);
      setIsLoading(false);
    }

    authenticate();
  }, [db]);

  return (
    <TelegramUserContext.Provider value={{ user, isLoading, isVerified, error }}>
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
