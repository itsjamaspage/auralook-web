"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, ShoppingBag, Zap, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();
  const { t, dictionary } = useLanguage();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_order_managers', user.uid);
  }, [db, user]);
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole || user?.email === 'jkhakimjonov8@gmail.com';

  const navItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.advisor), icon: Zap, href: '/advisor' },
    { label: t(dictionary.profile), icon: isAdmin ? LayoutDashboard : User, href: isAdmin ? '/admin' : '/profile' },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link 
        href={item.href}
        className="flex flex-col items-center gap-1 group relative py-2 px-1"
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
          isActive 
            ? "neon-bg scale-110 shadow-[0_0_20px_rgba(var(--sync-color),0.4)]" 
            : "bg-white/5 border border-white/10 group-hover:border-white/30"
        )}>
          <item.icon className={cn(
            "w-5 h-5 transition-colors",
            isActive ? "text-black stroke-[2.5px]" : "text-white/40 group-hover:text-white/60"
          )} />
        </div>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-[0.15em] font-mono transition-colors",
          isActive ? "neon-text" : "text-white/20"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-8 pointer-events-none">
      <div className="max-w-md mx-auto relative flex items-end justify-center pointer-events-auto">
        
        {/* Futuristic Floating Command Bridge */}
        <div className="glass-dark border border-white/10 rounded-[2.5rem] h-20 w-full flex items-center justify-around relative px-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-visible">
          
          {/* Left Wing */}
          <div className="flex flex-1 justify-around items-center h-full">
            {navItems.slice(0, 2).map((item) => (
              <NavButton key={item.href} item={item} />
            ))}
          </div>

          {/* Plasma Core (Cart Button) */}
          <div className="relative -top-12 mx-2">
            <Link href="/orders">
              <div className="relative group">
                {/* Energy Rings */}
                <div className={cn(
                  "absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse transition-opacity",
                  pathname === '/orders' ? "opacity-100" : "opacity-40"
                )} />
                <div className="absolute inset-[-4px] border border-primary/20 rounded-full animate-[spin_4s_linear_infinite]" />
                
                <div className={cn(
                  "w-16 h-16 neon-bg rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(var(--sync-color),0.5)] transition-all duration-500 group-hover:scale-110 group-active:scale-90 border-t border-white/40",
                  pathname === '/orders' && "ring-4 ring-white/10"
                )}>
                  <ShoppingBag className="w-7 h-7 text-black stroke-[2.5px]" />
                </div>
                
                <div className={cn(
                  "absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors",
                  pathname === '/orders' ? "neon-text opacity-100" : "text-white/20"
                )}>
                  {t(dictionary.cart)}
                </div>
              </div>
            </Link>
          </div>

          {/* Right Wing */}
          <div className="flex flex-1 justify-around items-center h-full">
            {navItems.slice(2, 4).map((item) => (
              <NavButton key={item.href} item={item} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
