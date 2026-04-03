
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
const CACHE_KEY = 'auralook_protocol_v5.0.0';

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
        const parsed = JSON.parse(cached);
        setUser(parsed);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // 2. Robust Identification Sequence
    const initBridge = async () => {
      let attempts = 0;
      const getTG = () => (window as any).Telegram?.WebApp;

      // Wait up to 3 seconds for script
      while (!getTG() && attempts < 30) {
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

      // 3. Instant UI Hydration (Visual Identification)
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
        // 4. Silent Firebase Login (Mandatory for Database Access)
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;
        
        // Finalize local profile with verified UID
        const profileWithUid = { ...initialProfile, firebaseUid };
        setUser(profileWithUid);

        // 5. Backend Verification (Security Handshake)
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData }),
        });

        if (res.ok) {
          setIsVerified(true);
          // 6. Sync to Firestore for data persistence
          const userRef = doc(db, 'users', profileWithUid.id);
          const userData = {
            ...profileWithUid,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, userData, { merge: true });
          localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
        } else {
          console.warn('Backend verification bypassed. Using client-only session.');
        }
      } catch (err) {
        console.error('Identity Bridge Critical Error:', err);
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
