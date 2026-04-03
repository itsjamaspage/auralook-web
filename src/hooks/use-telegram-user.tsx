
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export interface UserProfile {
  id: string;
  telegramId: number;
  firstName: string;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  firebaseUid: string;
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
const CACHE_KEY = 'auralook_protocol_v6.0.0';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    const initBridge = async () => {
      let attempts = 0;
      const getTG = () => (window as any).Telegram?.WebApp;

      while (!getTG() && attempts < 40) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      const tg = getTG();
      const isDev = process.env.NODE_ENV !== 'production' 
        || window.location.hostname.includes('cloudworkstations.dev')
        || window.location.hostname === 'localhost';

      if (!tg?.initDataUnsafe?.user) {
        if (isDev) handleDemoMode();
        else setIsLoading(false);
        return;
      }

      const rawUser = tg.initDataUnsafe.user;
      const initialProfile: UserProfile = {
        id: `tg_${rawUser.id}`,
        telegramId: rawUser.id,
        firstName: rawUser.first_name,
        username: rawUser.username || null,
        photoUrl: rawUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.first_name)}&background=00FF88&color=000&bold=true`,
        firebaseUid: 'pending',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phone: null
      };
      
      setUser(initialProfile);
      tg.ready();
      tg.expand();

      try {
        // 1. SILENT LOGIN - Essential for database access
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;
        const profileWithUid = { ...initialProfile, firebaseUid };
        setUser(profileWithUid);

        // 2. VERIFICATION
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData }),
        });

        if (res.ok) {
          setIsVerified(true);
          const userRef = doc(db, 'users', profileWithUid.id);
          await setDoc(userRef, {
            ...profileWithUid,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          localStorage.setItem(CACHE_KEY, JSON.stringify(profileWithUid));
        } else {
          console.warn('Protocol verification failure (401). Identity operating in unverified mode.');
        }
      } catch (err) {
        console.error('Identity Bridge Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initBridge();
  }, [db, auth]);

  function handleDemoMode() {
    const mockUser: UserProfile = {
      id: 'tg_demo',
      telegramId: 0,
      firstName: 'Demo Voyager',
      username: 'demo_user',
      phone: '+998 90 000 00 00',
      photoUrl: 'https://ui-avatars.com/api/?name=Demo+Voyager&background=00FF88&color=000&bold=true',
      firebaseUid: 'demo_session',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
    setIsVerified(true);
    setIsLoading(false);
    signInAnonymously(auth).catch(() => {});
  }

  return (
    <TelegramUserContext.Provider value={{ user, isLoading, isVerified, error }}>
      {children}
    </TelegramUserContext.Provider>
  );
}

export function useTelegramUser() {
  const context = useContext(TelegramUserContext);
  if (!context) throw new Error('useTelegramUser must be used within TelegramUserProvider');
  return context;
}
