
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
const CACHE_KEY = 'auralook_protocol_v2.7.0';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    // Load cached profile instantly for snappy UI
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsVerified(true);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // Wait up to 3 seconds for Telegram script to inject WebApp
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;

      // Still waiting for script...
      if (!tg?.initData && attempts < 12) return;

      clearInterval(interval);

      // Dev/Studio environment — use mock user
      const isDev = process.env.NODE_ENV !== 'production' 
        || window.location.hostname.includes('cloudworkstations.dev')
        || window.location.hostname === 'localhost';

      if (!tg?.initData) {
        if (isDev) {
          handleDemoMode();
        } else {
          // Real production but no Telegram context found
          setIsLoading(false);
        }
        return;
      }

      // Telegram context found — run the bridge
      bridgeIdentity(tg);
    }, 250);

    return () => clearInterval(interval);
  }, [db, auth]);

  async function bridgeIdentity(tg: any) {
    try {
      tg.ready();
      tg.expand();

      // Step 1: Verify Telegram signature on backend
      const res = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      });

      if (!res.ok) throw new Error('Signature verification failed');

      const telegramData = await res.json();
      const uid = `tg_${telegramData.id}`;

      // Step 2: Sign into Firebase anonymously (silent)
      const userCred = await signInAnonymously(auth);
      const firebaseUid = userCred.user.uid;

      // Step 3: Sync profile to Firestore
      const userRef = doc(db, 'users', uid);
      const existingDoc = await getDoc(userRef);

      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(telegramData.first_name)}&background=00FF88&color=000&bold=true`;

      const userData: any = {
        id: uid,
        telegramId: telegramData.id,
        firstName: telegramData.first_name,
        username: telegramData.username || null,
        photoUrl: telegramData.photo_url || fallbackAvatar,
        firebaseUid,
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
      setIsVerified(true);
      localStorage.setItem(CACHE_KEY, JSON.stringify(finalUser));
      setError(null);
    } catch (err: any) {
      console.error('Bridge failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

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
  }

  return (
    <TelegramUserContext.Provider value={{ user, isLoading, isVerified, error }}>
      {children}
    </TelegramUserContext.Provider>
  );
}

export function useTelegramUser() {
  const context = useContext(TelegramUserContext);
  if (context === undefined) throw new Error('useTelegramUser must be used within TelegramUserProvider');
  return context;
}
