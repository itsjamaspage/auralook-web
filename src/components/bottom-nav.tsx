"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Plus, MessageCircle, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const db = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_order_managers', user.uid);
  }, [db, user]);
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole || user?.email === 'jkhakimjonov8@gmail.com';

  const navItems = [
    { label: 'Search', icon: Search, href: '/looks' },
    { label: 'Favorites', icon: Heart, href: '/favorites' },
    { label: 'Chats', icon: MessageCircle, href: '/chats' },
    { label: 'Profile', icon: isAdmin ? LayoutDashboard : User, href: isAdmin ? '/admin' : '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-6">
      <div className="glass-dark border border-white/10 rounded-[2rem] h-20 flex items-center justify-around relative px-2 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Nav Links - Left side */}
        <div className="flex w-full justify-around pr-12">
          {navItems.slice(0, 2).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                pathname === item.href ? "neon-text scale-110" : "text-white/40 hover:text-white/60"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Central Sell Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href={isAdmin ? "/admin/looks/new" : "/looks"}>
            <div className="w-16 h-16 neon-bg rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--sync-color),0.4)] hover:scale-110 active:scale-95 transition-transform">
              <Plus className="w-8 h-8 text-black" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase neon-text tracking-widest">
              SELL
            </span>
          </Link>
        </div>

        {/* Nav Links - Right side */}
        <div className="flex w-full justify-around pl-12">
          {navItems.slice(2, 4).map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                pathname === item.href ? "neon-text scale-110" : "text-white/40 hover:text-white/60"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
