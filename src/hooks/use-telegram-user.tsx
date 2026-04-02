
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface UserProfile {
  id: string;
  telegramId: number;
  firstName: string;
  username: string | null;
  phone: string | null;
  photoUrl: string | null;
  lastSeen: any;
  createdAt: any;
  updatedAt: any;
}

interface TelegramUserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isVerified: boolean;
}

const TelegramUserContext = createContext<TelegramUserContextType | undefined>(undefined);

// Unique cache key to prevent collision with older versions
const CACHE_KEY = 'auralook_user_protocol_v2.4.2';

export function TelegramUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const db = useFirestore();

  useEffect(() => {
    // 1. Instant load from local cache
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

    async function authenticate() {
      const tg = (window as any).Telegram?.WebApp;
      
      // Developer Bypass: If not in Telegram, use Demo User
      if (!tg || !tg.initData) {
        console.warn('Protocol Bypass: App not in Telegram environment. Enabling Demo Mode.');
        
        const mockUser: UserProfile = {
          id: 'tg_demo',
          telegramId: 0,
          firstName: 'Demo Voyager',
          username: 'demo_user',
          phone: '+998 90 000 00 00',
          photoUrl: 'https://ui-avatars.com/api/?name=Demo+Voyager&background=00FF88&color=000&bold=true',
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(mockUser);
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      tg.ready();
      tg.expand();

      try {
        const res = await fetch('/api/telegram-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData })
        });

        if (res.ok) {
          const telegramUser: TelegramUser = await res.json();
          const uid = `tg_${telegramUser.id}`;
          const userRef = doc(db, 'users', uid);
          
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(telegramUser.first_name)}&background=00FF88&color=000&bold=true`;

          // 2. Fetch existing data to preserve fields like 'phone'
          const existingDoc = await getDoc(userRef);
          
          const userData: any = {
            id: uid,
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            username: telegramUser.username || null,
            photoUrl: telegramUser.photo_url || fallbackAvatar,
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // 3. Set defaults for new users
          if (!existingDoc.exists()) {
            userData.createdAt = serverTimestamp();
            userData.phone = null;
          }

          // 4. Idempotent sync to Firestore
          await setDoc(userRef, userData, { merge: true });
          
          const finalUser = existingDoc.exists() 
            ? { ...(existingDoc.data() as UserProfile), ...userData } 
            : (userData as UserProfile);
          
          setUser(finalUser);
          localStorage.setItem(CACHE_KEY, JSON.stringify(finalUser));
          setIsVerified(true);
        } else {
          throw new Error('Handshake failed');
        }
      } catch (error) {
        console.error('Handshake error:', error);
        // Fallback to Demo Mode if server is still being configured (missing secrets)
        if (process.env.NODE_ENV !== 'production') {
           const errorUser: UserProfile = {
            id: 'tg_demo_error',
            telegramId: 0,
            firstName: 'Demo (Bypass Active)',
            username: 'demo_user',
            phone: '+998 90 000 00 00',
            photoUrl: 'https://ui-avatars.com/api/?name=Sync+Error&background=FF3366&color=fff&bold=true',
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(errorUser);
          setIsVerified(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    authenticate();
  }, [db]);

  return (
    <TelegramUserContext.Provider value={{ user, isLoading, isVerified }}>
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
