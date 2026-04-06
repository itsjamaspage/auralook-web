
"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export function BottomNav() {
  const pathname = usePathname();
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  const db = useFirestore();
  const { user } = useUser();

  // CART DATA PROTOCOL
  const cartQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'cart');
  }, [db, user]);

  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.length || 0;

  // FAVORITES DATA PROTOCOL
  const favQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'liked_looks');
  }, [db, user]);

  const { data: favItems } = useCollection(favQuery);
  const favCount = favItems?.length || 0;
  
  const prevCartCount = useRef(cartCount);
  const prevFavCount = useRef(favCount);
  const [showPlusOneCart, setShowPlusOneCart] = useState(false);
  const [showPlusOneFav, setShowPlusOneFav] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // FEEDBACK PULSE: CART
  useEffect(() => {
    if (mounted && cartCount > prevCartCount.current) {
      setShowPlusOneCart(true);
      const timer = setTimeout(() => setShowPlusOneCart(false), 800);
      prevCartCount.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount, mounted]);

  // FEEDBACK PULSE: FAVORITES
  useEffect(() => {
    if (mounted && favCount > prevFavCount.current) {
      setShowPlusOneFav(true);
      const timer = setTimeout(() => setShowPlusOneFav(false), 800);
      prevFavCount.current = favCount;
      return () => clearTimeout(timer);
    }
    prevFavCount.current = favCount;
  }, [favCount, mounted]);

  const navItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.cart), icon: ShoppingCart, href: '/cart' },
    { label: t(dictionary.profile), icon: User, href: '/profile' },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    const isCart = item.href === '/cart';
    const isFav = item.href === '/favorites';
    
    return (
      <Link 
        href={item.href}
        className="flex flex-col items-center gap-1 group relative py-2 flex-1 outline-none"
      >
        <div className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative",
          isActive 
            ? "neon-bg scale-110" 
            : "glass-surface border border-foreground/10 group-hover:border-foreground/30",
          (isCart && showPlusOneCart) || (isFav && showPlusOneFav) ? "animate-pop" : ""
        )}>
          {isActive && (
            <div className="absolute inset-0 rounded-full animate-ping neon-bg opacity-20" />
          )}
          
          <item.icon className={cn(
            "w-5 h-5 sm:w-5.5 sm:h-5.5 transition-colors duration-300 relative z-10",
            isActive ? "text-black stroke-[2.5px]" : "text-foreground group-hover:text-foreground"
          )} />

          {/* CHROMA-SYNC BADGE: FAVORITES */}
          {isFav && favCount > 0 && (
            <div className="absolute -top-1 -right-1 neon-bg text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300 shadow-[0_0_15px_var(--sync-shadow)]">
              {favCount}
            </div>
          )}

          {/* CHROMA-SYNC BADGE: CART */}
          {isCart && cartCount > 0 && (
            <div className="absolute -top-1 -right-1 neon-bg text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300 shadow-[0_0_15px_var(--sync-shadow)]">
              {cartCount}
            </div>
          )}

          {/* FLOATING FEEDBACK PARTICLES */}
          {isCart && showPlusOneCart && (
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 neon-text font-black italic text-xl pointer-events-none animate-float-up">
              +1
            </span>
          )}

          {isFav && showPlusOneFav && (
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 neon-text font-black italic text-xl pointer-events-none animate-float-up">
              +1
            </span>
          )}
        </div>
        <span className={cn(
          "text-[10px] sm:text-[11px] font-black uppercase tracking-wider font-mono transition-colors duration-300 text-center truncate w-full px-1",
          isActive ? "neon-text" : "text-foreground"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-full mx-auto relative pointer-events-auto">
        <div className="bg-background/95 backdrop-blur-2xl border-t border-foreground/10 h-20 sm:h-24 w-full flex items-center justify-between px-3 sm:px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
          {navItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
