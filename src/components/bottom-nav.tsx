
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, ShoppingBag, LayoutDashboard, Ruler, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';

export function BottomNav() {
  const pathname = usePathname();
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.razmeringiz), icon: Ruler, href: '/advisor' },
    { label: t(dictionary.cart), icon: ShoppingBag, href: '/orders' },
    { label: t(dictionary.adminPanel), icon: LayoutDashboard, href: '/admin' },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
    
    return (
      <Link 
        href={item.href}
        className="flex flex-col items-center gap-1 group relative py-2 flex-1 outline-none"
      >
        <div className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative",
          isActive 
            ? "neon-bg scale-110 sm:scale-105" 
            : "bg-white/5 border border-white/10 group-hover:border-white/30"
        )}>
          {isActive && (
            <div className="absolute inset-0 rounded-full animate-ping neon-bg opacity-20" />
          )}
          <item.icon className={cn(
            "w-5 h-5 sm:w-5.5 sm:h-5.5 transition-colors duration-300 relative z-10",
            isActive ? "text-black stroke-[2.5px]" : "text-white/40 group-hover:text-white/60"
          )} />
        </div>
        <span className={cn(
          "text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] font-mono transition-colors duration-300 text-center truncate w-full px-1",
          isActive ? "neon-text" : "text-white/20"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 sm:pb-8 pointer-events-none">
      <div className="max-w-2xl mx-auto relative pointer-events-auto">
        <div className="glass-dark border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] h-20 sm:h-24 w-full flex items-center justify-between px-3 sm:px-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {navItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
