
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
const CACHE_KEY = 'auralook_protocol_v12.0.0';

// SUPREME ADMIN CONFIGURATION
const SUPREME_ADMIN_USERNAME = 'itsjamaspage';

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
        setIsVerified(true);
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
      const cleanUsername = rawUser.username?.toLowerCase() || null;
      
      try {
        // 1. Anonymous Session Initiation
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        // 2. Role Determination (Supreme Admin Bypass + Firestore)
        let assignedRole: UserRole = 'viewer';
        
        if (cleanUsername === SUPREME_ADMIN_USERNAME.toLowerCase()) {
          assignedRole = 'admin';
        } else {
          const roleRef = doc(db, 'roles', firebaseUid);
          const roleSnap = await getDoc(roleRef);
          assignedRole = roleSnap.exists() ? (roleSnap.data().role as UserRole) : 'viewer';
        }

        // 3. Persistence Sequence (CRITICAL: UID Alignment)
        const userRef = doc(db, 'users', firebaseUid);
        const profileData: UserProfile = {
          id: firebaseUid,
          telegramId: rawUser.id,
          firstName: rawUser.first_name,
          username: cleanUsername,
          photoUrl: rawUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.first_name)}&background=00FF88&color=000&bold=true`,
          firebaseUid,
          role: assignedRole,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          phone: null
        };

        await setDoc(userRef, profileData, { merge: true });

        // 4. Final Exposure
        setUser(profileData);
        setIsVerified(true);
        localStorage.setItem(CACHE_KEY, JSON.stringify(profileData));
        tg.ready();
        tg.expand();
      } catch (err) {
        console.error('Identity Bridge Critical Error:', err);
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    initBridge();
  }, [db, auth]);

  function handleDemoMode() {
    const demoUid = 'demo_admin_session';
    const mockUser: UserProfile = {
      id: demoUid,
      telegramId: 0,
      firstName: 'Admin Voyager',
      username: 'admin_tester',
      phone: '+998 90 000 00 00',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+Voyager&background=00FF88&color=000&bold=true',
      firebaseUid: demoUid,
      role: 'admin', // Demo mode always admin for developer access
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
