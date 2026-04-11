
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore, useAuth } from '@/firebase';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export type UserRole = 'owner' | 'editor' | 'viewer';

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

const OWNER_USERNAME = 'itsjamaspage';

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
      
      while (!getTG() && attempts < 30) {
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
        if (isDev) handleDemoMode();
        else setIsLoading(false);
        return;
      }

      try {
        // SECURE IDENTITY VERIFICATION: Handshake via backend signature verification
        const verifyRes = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (!verifyRes.ok) {
          throw new Error('Identity verification failed.');
        }

        const rawUser = await verifyRes.json();
        const cleanUsername = rawUser.username?.toLowerCase() || null;
        
        const userCred = await signInAnonymously(auth);
        const firebaseUid = userCred.user.uid;

        // Listen to roles for dynamic RBAC updates
        const roleRef = doc(db, 'roles', firebaseUid);
        const unsubscribeRole = onSnapshot(roleRef, async (snap) => {
          let assignedRole: UserRole = 'viewer';
          
          if (cleanUsername === OWNER_USERNAME.toLowerCase()) {
            assignedRole = 'owner';
          } else if (snap.exists()) {
            assignedRole = snap.data().role as UserRole;
          }

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

          // CRITICAL: Await the database write before establishing verification state
          await setDoc(userRef, profileData, { merge: true });
          setUser(profileData);
          setIsVerified(true);
          setIsLoading(false);
        });

        tg.ready();
        tg.expand();
        return () => unsubscribeRole();
      } catch (err) {
        console.error('Identity Bridge Critical Error:', err);
        setError(String(err));
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
