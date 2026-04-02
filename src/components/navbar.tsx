
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Compass, 
  Heart, 
  ShoppingBag, 
  LayoutDashboard, 
  Ruler,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  const navItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
    { label: t(dictionary.favorites), icon: Heart, href: '/favorites' },
    { label: t(dictionary.razmeringiz), icon: Ruler, href: '/advisor' },
    { label: t(dictionary.cart), icon: ShoppingBag, href: '/orders' },
    { label: t(dictionary.adminPanel), icon: LayoutDashboard, href: '/admin' },
  ];

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-3xl lg:rounded-[2.5rem] px-6 lg:px-10 py-4 lg:py-5 border border-white/10 shadow-2xl relative">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl lg:text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Auralook
          </span>
        </Link>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-10 lg:h-11 w-10 lg:w-11 p-0 font-black uppercase text-white text-[10px] lg:text-xs">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10 p-2 min-w-[80px]">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors",
                    lang === l.code ? "bg-white/10 neon-text" : "text-white hover:bg-white/5"
                  )}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hamburger Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full neon-bg h-10 lg:h-11 w-10 lg:w-11 p-0 border-none shadow-[0_0_20px_var(--sync-shadow)] group">
                <Menu className="w-5 h-5 text-black group-active:scale-90 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10 p-2 w-64 mt-2">
              <div className="px-4 py-3 mb-2 border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">Command Center</p>
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <DropdownMenuItem 
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all mb-1",
                        isActive 
                          ? "bg-white/10 neon-text border border-white/10 shadow-[inset_0_0_15px_rgba(var(--sync-color),0.1)]" 
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "neon-text" : "text-inherit")} />
                      <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 neon-bg rounded-full shadow-[0_0_8px_var(--sync-color)]" />
                      )}
                    </DropdownMenuItem>
                  </Link>
                );
              })}
              <DropdownMenuSeparator className="bg-white/5 my-2" />
              <div className="px-4 py-2">
                <p className="text-[8px] font-mono text-white/20 uppercase">Auralook Protocol v2.4.0</p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
