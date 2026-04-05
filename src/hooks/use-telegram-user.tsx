
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  telegramId: number;
  firstName: string;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  firebaseUid: string;
  role: UserRole;
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
const CACHE_KEY = 'auralook_protocol_v9.0.0';

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
        const parsed = JSON.parse(cached);
        setUser(parsed);
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    const initBridge = async () => {
      const getTG = () => (window as any).Telegram?.WebApp;
      let attempts = 0;
      
      while (!getTG() && attempts < 30) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      const tg = getTG();
      const isDev = window.location.hostname.includes('hosted.app') || 
                    window.location.hostname.includes('cloudworkstations.dev') ||
                    window.location.hostname === 'localhost';

      if (!tg?.initDataUnsafe?.user) {
        if (isDev) handleDemoMode();
        else setIsLoading(false);
        return;
      }

      const rawUser = tg.initDataUnsafe.user;
      const initialProfile: Partial<UserProfile> = {
        id: `tg_${rawUser.id}`,
        telegramId: rawUser.id,
        firstName: rawUser.first_name,
        username: rawUser.username || null,
        photoUrl: rawUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.first_name)}&background=00FF88&color=000&bold=true`,
        firebaseUid: 'pending',
        role: 'viewer',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phone: null
      };
      
      setUser(initialProfile as UserProfile);
      tg.ready();
      tg.expand();

      try {
        // 1. Anonymous Session Initiation
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        // 2. Role Determination
        const roleRef = doc(db, 'roles', firebaseUid);
        const roleSnap = await getDoc(roleRef);
        const assignedRole: UserRole = roleSnap.exists() ? (roleSnap.data().role as UserRole) : 'viewer';

        const finalProfile: UserProfile = { 
          ...(initialProfile as UserProfile), 
          firebaseUid,
          role: assignedRole
        };
        
        setUser(finalProfile);

        // 3. Signature Handshake
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData }),
        });

        if (res.ok) {
          setIsVerified(true);
          const userRef = doc(db, 'users', finalProfile.id);
          await setDoc(userRef, {
            ...finalProfile,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
          localStorage.setItem(CACHE_KEY, JSON.stringify(finalProfile));
        } else {
          console.warn('Backend Signature Handshake Failed - Operating in local mode');
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
      id: 'tg_demo_admin',
      telegramId: 0,
      firstName: 'Admin Voyager',
      username: 'admin',
      phone: '+998 90 000 00 00',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+Voyager&background=00FF88&color=000&bold=true',
      firebaseUid: 'demo_admin_session',
      role: 'admin',
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
