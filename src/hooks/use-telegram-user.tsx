
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

const CACHE_KEY = 'auralook_protocol_v2.5.0';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    async function bridgeIdentity() {
      const tg = (window as any).Telegram?.WebApp;
      
      // 1. Attempt to load cached profile for instant UI
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

      if (!tg || !tg.initData) {
        if (process.env.NODE_ENV !== 'production') {
          handleDemoMode('Local Environment detected. Entering Simulation...');
        } else {
          setIsLoading(false);
        }
        return;
      }

      try {
        // Step A: Verify Telegram Signature
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (!res.ok) throw new Error('Identity handshake failed');
        
        const telegramData = await res.json();
        const uid = `tg_${telegramData.id}`;

        // Step B: Silent Firebase Authentication
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        // Step C: Sync Firestore Profile
        const userRef = doc(db, 'users', uid);
        const existingDoc = await getDoc(userRef);
        
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(telegramData.first_name)}&background=00FF88&color=000&bold=true`;

        const userData: any = {
          id: uid,
          telegramId: telegramData.id,
          firstName: telegramData.first_name,
          username: telegramData.username || null,
          photoUrl: telegramData.photo_url || fallbackAvatar,
          firebaseUid: firebaseUid,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (!existingDoc.exists()) {
          userData.createdAt = serverTimestamp();
          userData.phone = null;
        }

        // Link current Firebase session to this Telegram ID
        await setDoc(userRef, userData, { merge: true });
        
        const finalUser = existingDoc.exists() 
          ? { ...(existingDoc.data() as UserProfile), ...userData } 
          : (userData as UserProfile);
        
        setUser(finalUser);
        localStorage.setItem(CACHE_KEY, JSON.stringify(finalUser));
        setIsVerified(true);
        setError(null);
      } catch (err: any) {
        console.error('Handshake Failure:', err);
        setError(err.message);
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
        firebaseUid: 'demo_session',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(mockUser);
      setIsVerified(true);
      setIsLoading(false);
    }

    bridgeIdentity();
  }, [db, auth]);

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
