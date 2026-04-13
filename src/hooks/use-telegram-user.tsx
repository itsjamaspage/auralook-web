
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface UserProfile {
  id: string; // This is the numeric Telegram ID as a string for stability
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

// AUTHORIZED ADMIN LIST (Stable Usernames)
const ADMIN_USERNAMES = ['itsjamaspage', 'jama_khaki'];

/**
 * Enhanced Telegram Identity Bridge.
 * Automatically synchronizes Telegram WebApp user data with Firebase session.
 * Uses Numeric Telegram ID for absolute cross-device and cross-username persistence.
 */
export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    const initBridge = async () => {
      const getTG = () => (window as any).Telegram?.WebApp;
      let attempts = 0;
      
      while (!getTG() && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      const tg = getTG();
      const isDev = typeof window !== 'undefined' && (
        window.location.hostname.includes('hosted.app') || 
        window.location.hostname.includes('cloudworkstations.dev') ||
        window.location.hostname === 'localhost'
      );

      if (!tg?.initDataUnsafe?.user) {
        if (isDev) {
          handleDemoMode();
        } else {
          setIsLoading(false);
        }
        return;
      }

      try {
        const verifyRes = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (!verifyRes.ok) {
          throw new Error('Identity verification handshake failed.');
        }

        const rawUser = await verifyRes.json();
        const cleanUsername = rawUser.username?.toLowerCase() || null;
        const stableId = rawUser.id.toString(); // Numeric Telegram ID
        
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        // 1. Establish User Identity Document
        // We use the numeric ID as the primary key for the users collection
        const userRef = doc(db, 'users', stableId);
        const profileData = {
          id: stableId,
          telegramId: rawUser.id,
          firstName: rawUser.first_name,
          username: cleanUsername,
          photoUrl: rawUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.first_name)}&background=00FF88&color=000&bold=true`,
          firebaseUid,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Upsert profile data
        await setDoc(userRef, profileData, { merge: true });

        // 2. Resolve Role via Numeric ID (Immutable)
        const roleRef = doc(db, 'roles', stableId);
        
        const unsubscribeRole = onSnapshot(roleRef, async (snap) => {
          let assignedRole: UserRole = 'viewer';
          
          // Hardcoded fallback for bootstrap admins
          if (cleanUsername && ADMIN_USERNAMES.includes(cleanUsername)) {
            assignedRole = 'owner';
          } else if (snap.exists()) {
            assignedRole = snap.data().role as UserRole;
          }

          const fullProfile: UserProfile = {
            ...profileData,
            role: assignedRole,
            createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
            phone: snap.exists() ? snap.data().phone : null
          } as any;

          setUser(fullProfile);
          setIsVerified(true);
          setIsLoading(false);
        });

        tg.ready();
        tg.expand();
        return () => unsubscribeRole();
      } catch (err) {
        console.error('[Identity Bridge] Critical Failure:', err);
        setError(String(err));
        setIsLoading(false);
      }
    };

    initBridge();
  }, [db, auth]);

  function handleDemoMode() {
    const demoUid = 'demo_admin_session';
    const mockUser: UserProfile = {
      id: '7213073025', // Mocking your actual numeric ID for demo stability
      telegramId: 7213073025,
      firstName: 'Admin Voyager',
      username: 'jama_khaki',
      phone: '+998 90 000 00 00',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+Voyager&background=00FF88&color=000&bold=true',
      firebaseUid: demoUid,
      role: 'owner',
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
