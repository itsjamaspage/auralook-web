
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
const CACHE_KEY = 'auralook_protocol_v4.0.0';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    // 1. Instant Cache Recovery
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsVerified(true);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // 2. Poll for Telegram WebApp
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;

      if (!tg && attempts < 20) return;
      clearInterval(interval);

      const isDev = process.env.NODE_ENV !== 'production' 
        || window.location.hostname.includes('cloudworkstations.dev')
        || window.location.hostname === 'localhost';

      if (!tg?.initDataUnsafe?.user) {
        if (isDev) handleDemoMode();
        else setIsLoading(false);
        return;
      }

      // 3. Instant UI Hydration (Don't wait for API)
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
      
      // 4. Secure Bridge in background
      bridgeIdentity(tg, initialProfile);
    }, 100);

    return () => clearInterval(interval);
  }, [db, auth]);

  async function bridgeIdentity(tg: any, initialProfile: UserProfile) {
    try {
      tg.ready();
      tg.expand();

      // Step 1: Sign into Firebase (Mandatory for DB writes)
      const userCred = await signInAnonymously(auth);
      const firebaseUid = userCred.user.uid;

      // Update local state with UID
      setUser(prev => prev ? { ...prev, firebaseUid } : null);

      // Step 2: Signature Verification (Optional for UI, Mandatory for Data Sync)
      const res = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      });

      if (res.ok) {
        const verifiedData = await res.json();
        setIsVerified(true);

        // Step 3: Firestore Sync
        const userRef = doc(db, 'users', initialProfile.id);
        const userData = {
          ...initialProfile,
          firebaseUid,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        await setDoc(userRef, userData, { merge: true });
        localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
      } else {
        console.warn('Backend verification failed, using client-side identity only.');
      }
    } catch (err: any) {
      console.error('Protocol Sync Error:', err);
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
