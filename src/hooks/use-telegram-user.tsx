
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface UserProfile {
  id: string; // Numeric Telegram ID as string
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

const ADMIN_IDS = ['6884517020', '7213073025'];
const ADMIN_USERNAMES = ['itsjamaspage', 'jama_khaki'];

/**
 * Enhanced Telegram Identity Bridge.
 * Standardizes all user data to use the numeric Telegram ID as the primary key.
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
      
      // Patient polling for slow mobile connections
      while (!getTG() && attempts < 100) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }

      const tg = getTG();
      
      if (!tg) {
        setIsLoading(false);
        setError("Telegram context missing.");
        return;
      }

      // Recursive wait for initData populating
      let initDataAttempts = 0;
      while (!tg.initDataUnsafe?.user && initDataAttempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        initDataAttempts++;
      }

      const isDev = typeof window !== 'undefined' && (
        window.location.hostname.includes('hosted.app') || 
        window.location.hostname.includes('cloudworkstations.dev') ||
        window.location.hostname === 'localhost'
      );

      if (!tg.initDataUnsafe?.user) {
        if (isDev) {
          handleDemoMode();
        } else {
          setIsLoading(false);
        }
        return;
      }

      processUser(tg.initDataUnsafe.user, tg.initData);
    };

    const processUser = async (rawUser: any, initData: string) => {
      const tg = (window as any).Telegram?.WebApp;
      try {
        const verifyRes = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData })
        });

        if (!verifyRes.ok) {
          throw new Error('Verification failed.');
        }

        const validatedUser = await verifyRes.json();
        const stableId = validatedUser.id.toString(); 
        
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        const userRef = doc(db, 'users', stableId);
        const profileData = {
          id: stableId,
          telegramId: validatedUser.id,
          firstName: validatedUser.first_name,
          username: validatedUser.username?.toLowerCase() || null,
          photoUrl: validatedUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedUser.first_name)}&background=00FF88&color=000&bold=true`,
          firebaseUid,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Critical: The rules now allow this initial write for new users
        await setDoc(userRef, profileData, { merge: true });

        const roleRef = doc(db, 'roles', stableId);
        const unsubscribeRole = onSnapshot(roleRef, (snap) => {
          let assignedRole: UserRole = 'viewer';
          
          if (ADMIN_IDS.includes(stableId) || (profileData.username && ADMIN_USERNAMES.includes(profileData.username))) {
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
        }, (err) => {
          console.error('[Identity Bridge] Role listener blocked:', err);
          setUser({ ...profileData, role: (ADMIN_IDS.includes(stableId) ? 'owner' : 'viewer') } as any);
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
      id: '7213073025', 
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
