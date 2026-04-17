
"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export function BottomNav() {
  const pathname = usePathname();
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  
  const db = useFirestore();
  const { user: tgUser, isVerified } = useTelegramUser();

  const cartQuery = useMemoFirebase(() => {
    if (!tgUser || !isVerified) return null;
    return collection(db, 'users', tgUser.id, 'cart');
  }, [db, tgUser, isVerified]);

  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.length || 0;

  const favQuery = useMemoFirebase(() => {
    if (!tgUser || !isVerified) return null;
    return collection(db, 'users', tgUser.id, 'liked_looks');
  }, [db, tgUser, isVerified]);

  const { data: favItems } = useCollection(favQuery);
  const favCount = favItems?.length || 0;
  
  const prevCartCount = useRef(cartCount);
  const prevFavCount = useRef(favCount);
  const [showPlusOneCart, setShowPlusOneCart] = useState(false);
  const [showPlusOneFav, setShowPlusOneFav] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsInsideTelegram(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && cartCount > prevCartCount.current) {
      setShowPlusOneCart(true);
      setTimeout(() => setShowPlusOneCart(false), 800);
    }
    prevCartCount.current = cartCount;
  }, [cartCount, mounted]);

  useEffect(() => {
    if (mounted && favCount > prevFavCount.current) {
      setShowPlusOneFav(true);
      setTimeout(() => setShowPlusOneFav(false), 800);
    }
    prevFavCount.current = favCount;
  }, [favCount, mounted]);

  const BOT_URL = "https://t.me/jamastore_aibot/auralook?startapp=from_web";

  const navItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.cart), icon: ShoppingCart, href: '/cart' },
    { label: t(dictionary.profile), icon: User, href: isInsideTelegram ? '/profile' : BOT_URL, isExternal: !isInsideTelegram },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/' && typeof item.href === 'string' && pathname.startsWith(item.href));
    const isCart = item.href === '/cart';
    const isFav = item.href === '/favorites';
    const count = isCart ? cartCount : isFav ? favCount : 0;
    const showPulse = (isCart && showPlusOneCart) || (isFav && showPlusOneFav);
    
    return (
      <Link
        href={item.href}
        target={item.isExternal ? "_blank" : "_self"}
        className="flex flex-col items-center gap-1 group relative py-1 flex-1 min-h-[44px] justify-center touch-manipulation"
      >
        <div className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative",
          isActive ? "neon-bg scale-110" : "glass-surface border border-foreground/10",
          showPulse && "animate-pop"
        )}>
          {isActive && <div className="absolute inset-0 rounded-full animate-ping neon-bg opacity-20" />}
          <item.icon className={cn("w-5 h-5 transition-colors relative z-10", isActive ? "text-black stroke-[2.5px]" : "text-foreground")} />
          
          {count > 0 && (
            <div className="absolute -top-1 -right-1 neon-bg text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-background shadow-[0_0_15px_var(--sync-shadow)]">
              {count}
            </div>
          )}

          {showPulse && (
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 neon-text font-black italic text-xl animate-float-up">+1</span>
          )}
        </div>
        <span className={cn("text-[11px] font-black uppercase tracking-wider transition-colors truncate w-full px-1 text-center", isActive ? "neon-text" : "text-foreground")}>
          {item.label}
        </span>
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="bg-background/95 backdrop-blur-2xl border-t border-foreground/10 w-full flex items-center justify-between px-3 rounded-t-[2.5rem] shadow-2xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingTop: '12px', minHeight: '72px' }}
      >
        {navItems.map((item) => <NavButton key={item.label} item={item} />)}
      </div>
    </div>
  );
}
