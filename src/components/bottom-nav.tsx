
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
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
    { label: "Katalog", icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.cart), icon: ShoppingBag, href: '/orders' },
    { label: t(dictionary.adminPanel), icon: LayoutDashboard, href: '/admin' },
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    
    return (
      <Link 
        href={item.href}
        className="flex flex-col items-center gap-1.5 group relative py-2 flex-1"
      >
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          isActive 
            ? "neon-bg scale-105" 
            : "bg-white/5 border border-white/10 group-hover:border-white/30"
        )}>
          <item.icon className={cn(
            "w-5 h-5 transition-colors duration-300",
            isActive ? "text-black stroke-[2.5px]" : "text-white/40 group-hover:text-white/60"
          )} />
        </div>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-[0.1em] font-mono transition-colors duration-300 text-center truncate w-full px-1",
          isActive ? "neon-text" : "text-white/20"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-8 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        <div className="glass-dark border border-white/10 rounded-[2.5rem] h-24 w-full flex items-center justify-between px-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {navItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
