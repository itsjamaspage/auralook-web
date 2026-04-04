"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  LayoutDashboard, 
  User,
  Loader2,
  Maximize2,
  Minimize2,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isLoading } = useTelegramUser();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('auralook_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('auralook_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleFullscreen = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
    }
    
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false));
      }
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  const menuItems = [
    { label: t(dictionary.browseLooks), icon: Compass, href: '/looks' },
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
        <div className="flex items-center gap-2 lg:gap-4">
          
          {/* Expand Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className="rounded-full border border-white/10 hover:bg-white/5 h-10 w-10 lg:h-11 lg:w-11 p-0 group"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 neon-text" /> : <Maximize2 className="w-4 h-4 neon-text" />}
          </Button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-10 lg:h-11 w-10 lg:w-11 p-0 font-black uppercase text-foreground text-[10px] lg:text-xs">
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
                    lang === l.code ? "bg-white/10 neon-text" : "text-foreground hover:bg-white/5"
                  )}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full h-10 lg:h-11 w-10 lg:w-11 p-0 border border-white/10 bg-white/5 hover:neon-border group">
                <Menu className="w-5 h-5 text-foreground group-active:scale-90 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10 p-2 w-64 mt-2">
              <div className="px-4 py-3 mb-2 border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 italic">{t(dictionary.protocol)}</p>
                {user && (
                  <p className="text-[10px] font-bold neon-text mt-1 truncate">@{user.username || user.firstName}</p>
                )}
              </div>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <DropdownMenuItem className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground/60 hover:text-foreground">
                    <item.icon className="w-5 h-5 neon-text" />
                    <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                  </DropdownMenuItem>
                </Link>
              ))}
              <DropdownMenuSeparator className="bg-white/5 my-2" />
              <DropdownMenuItem 
                onClick={toggleTheme}
                className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground/60 hover:text-foreground"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 neon-text" /> : <Moon className="w-5 h-5 neon-text" />}
                <span className="font-bold text-[11px] uppercase tracking-widest">
                  {t(dictionary.theme)}: {theme === 'dark' ? t(dictionary.light) : t(dictionary.dark)}
                </span>
              </DropdownMenuItem>
              <Link href="/profile">
                <DropdownMenuItem className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground/60 hover:text-foreground">
                  <User className="w-5 h-5 neon-text" />
                  <span className="font-bold text-[11px] uppercase tracking-widest">{t(dictionary.profile)}</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}