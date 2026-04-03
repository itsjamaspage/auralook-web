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
const CACHE_KEY = 'auralook_protocol_v3.2.0';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    // 1. Instant Cache/Local Hydration
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setIsVerified(true);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // 2. High-Durability Polling for Telegram Environment
    let attempts = 0;
    const maxAttempts = 40; // 10 seconds total
    
    const interval = setInterval(() => {
      attempts++;
      const tg = (window as any).Telegram?.WebApp;

      // Still waiting for script injection...
      if ((!tg || !tg.initDataUnsafe) && attempts < maxAttempts) return;

      clearInterval(interval);

      const isStudio = process.env.NODE_ENV !== 'production' 
        || window.location.hostname.includes('cloudworkstations.dev')
        || window.location.hostname === 'localhost';

      if (!tg?.initData) {
        if (isStudio) {
          handleDemoMode();
        } else {
          setIsLoading(false);
        }
        return;
      }

      // 3. Script Ready — Instant UI Hydration from initDataUnsafe
      if (tg.initDataUnsafe.user) {
        const u = tg.initDataUnsafe.user;
        const preliminaryUser: any = {
          id: `tg_${u.id}`,
          firstName: u.first_name,
          username: u.username || null,
          photoUrl: u.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name)}&background=00FF88&color=000&bold=true`,
        };
        setUser(prev => ({ ...prev, ...preliminaryUser }));
      }

      // 4. Begin Secure Signature Handshake
      bridgeIdentity(tg);
    }, 250);

    return () => clearInterval(interval);
  }, [db, auth]);

  async function bridgeIdentity(tg: any) {
    try {
      tg.ready();
      tg.expand();

      // Step 1: Secure Signature Handshake (HMAC Verification)
      const res = await fetch('/api/telegram-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: tg.initData }),
      });

      if (!res.ok) throw new Error('HMAC Signature Handshake Failed');

      const telegramData = await res.json();
      const uid = `tg_${telegramData.id}`;

      // Step 2: Firebase Silent Identity Bridge
      const userCred = await signInAnonymously(auth);
      const firebaseUid = userCred.user.uid;

      // Step 3: Database Synchronization
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
      console.error('Protocol Sync Failure:', err);
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
