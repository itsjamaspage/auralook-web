
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

  const cartQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'cart');
  }, [db, user]);

  const { data: cartItems } = useCollection(cartQuery);
  const cartCount = cartItems?.length || 0;

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
    const count = isCart ? cartCount : isFav ? favCount : 0;
    const showPulse = (isCart && showPlusOneCart) || (isFav && showPlusOneFav);
    
    return (
      <Link href={item.href} className="flex flex-col items-center gap-1 group relative py-2 flex-1">
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
        <span className={cn("text-[10px] font-black uppercase tracking-wider transition-colors truncate w-full px-1 text-center", isActive ? "neon-text" : "text-foreground")}>
          {item.label}
        </span>
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-background/95 backdrop-blur-2xl border-t border-foreground/10 h-20 sm:h-24 w-full flex items-center justify-between px-3 rounded-t-[2.5rem] shadow-2xl">
        {navItems.map((item) => <NavButton key={item.href} item={item} />)}
      </div>
    </div>
  );
}
