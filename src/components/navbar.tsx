
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
  Moon,
  ShieldCheck
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
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('auralook_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleFullscreen = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen();
      }
    }
    
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(() => setIsFullscreen(true));
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
            .then(() => setIsFullscreen(false))
            .catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Fullscreen handshake aborted:", e);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  // SUPREME ADMIN ACCESS CHECK
  const isAdmin = user?.username?.toLowerCase() === 'itsjamaspage' || 
                  user?.role === 'admin' || 
                  user?.firebaseUid === 'demo_admin_session';

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-surface rounded-3xl lg:rounded-[2.5rem] px-6 lg:px-10 py-4 lg:py-5 relative border-foreground/10">
        
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl lg:text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Yangi Avlod
          </span>
        </Link>

        <div className="flex items-center gap-2 lg:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className="rounded-full border border-foreground/10 hover:bg-foreground/5 h-10 w-10 lg:h-11 lg:w-11 p-0 group"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 neon-text" /> : <Maximize2 className="w-4 h-4 neon-text" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-foreground/20 hover:bg-foreground/5 h-10 lg:h-11 w-10 lg:w-11 p-0 font-black uppercase text-foreground text-[10px] lg:text-xs">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-2 min-w-[80px]">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors",
                    lang === l.code ? "bg-foreground/10 neon-text" : "text-foreground hover:bg-foreground/5"
                  )}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full h-10 lg:h-11 w-10 lg:w-11 p-0 border border-foreground/10 bg-foreground/5 hover:neon-border group">
                <Menu className="w-5 h-5 text-foreground group-active:scale-90 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-2 w-64 mt-2">
              <div className="px-4 py-3 mb-2 border-b border-foreground/5">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 italic">{t(dictionary.protocol)}</p>
                {user && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold neon-text truncate">@{user.username || user.firstName}</p>
                    {isAdmin && <ShieldCheck className="w-3 h-3 text-primary animate-pulse" />}
                  </div>
                )}
              </div>
              
              <Link href="/looks">
                <DropdownMenuItem className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground hover:bg-foreground/5">
                  <Compass className="w-5 h-5 neon-text" />
                  <span className="font-bold text-[11px] uppercase tracking-widest">{t(dictionary.browseLooks)}</span>
                </DropdownMenuItem>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground hover:bg-foreground/5">
                    <LayoutDashboard className="w-5 h-5 neon-text" />
                    <span className="font-bold text-[11px] uppercase tracking-widest">{t(dictionary.adminPanel)}</span>
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator className="bg-foreground/5 my-2" />
              <DropdownMenuItem 
                onClick={toggleTheme}
                className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground hover:bg-foreground/5"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 neon-text" /> : <Moon className="w-5 h-5 neon-text" />}
                <span className="font-bold text-[11px] uppercase tracking-widest">
                  {theme === 'dark' ? t(dictionary.light) : t(dictionary.dark)}
                </span>
              </DropdownMenuItem>
              <Link href="/profile">
                <DropdownMenuItem className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer text-foreground hover:bg-foreground/5">
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
