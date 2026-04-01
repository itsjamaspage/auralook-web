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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-8 pointer-events-none">
      <div className="max-w-md mx-auto relative flex items-end justify-center pointer-events-auto">
        
        {/* Futuristic Floating Command Bridge */}
        <div className="glass-dark border border-white/10 rounded-[2.5rem] h-16 w-full flex items-center justify-around relative px-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-visible">
          
          {/* Left Wing */}
          <div className="flex flex-1 justify-around items-center h-full">
            {navItems.slice(0, 2).map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-500",
                  pathname === item.href ? "neon-text scale-110" : "text-white/30 hover:text-white/60"
                )}
              >
                <item.icon className={cn("w-5 h-5", pathname === item.href && "animate-pulse")} />
                <span className="text-[8px] font-black uppercase tracking-[0.15em] font-mono">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Plasma Core (Cart Button) */}
          <div className="relative -top-10 mx-2">
            <Link href="/orders">
              <div className="relative group">
                {/* Energy Rings */}
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                <div className="absolute inset-[-4px] border border-primary/20 rounded-full animate-[spin_4s_linear_infinite]" />
                
                <div className="w-16 h-16 neon-bg rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(var(--sync-color),0.5)] transition-all duration-500 group-hover:scale-110 group-active:scale-90 border-t border-white/40">
                  <ShoppingBag className="w-7 h-7 text-black stroke-[2.5px]" />
                </div>
                
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase neon-text tracking-[0.2em] whitespace-nowrap opacity-80">
                  {t(dictionary.cart)}
                </div>
              </div>
            </Link>
          </div>

          {/* Right Wing */}
          <div className="flex flex-1 justify-around items-center h-full">
            {navItems.slice(2, 4).map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-500",
                  pathname === item.href ? "neon-text scale-110" : "text-white/30 hover:text-white/60"
                )}
              >
                <item.icon className={cn("w-5 h-5", pathname === item.href && "animate-pulse")} />
                <span className="text-[8px] font-black uppercase tracking-[0.15em] font-mono">{item.label}</span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
