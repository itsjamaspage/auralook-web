
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
  const { user } = useTelegramUser();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const savedTheme = localStorage.getItem('auralook_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }

    // PROTOCOL: Telegram WebApp Expansion Sync
    const syncTG = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        tg.ready();
        setIsInsideTelegram(true);
        setIsFullscreen(tg.isExpanded);
        
        const onViewportChanged = () => {
          setIsFullscreen(tg.isExpanded);
        };
        
        tg.onEvent('viewportChanged', onViewportChanged);
        return onViewportChanged;
      }
      return null;
    };

    let unsubscribeTG = syncTG();
    const pollInterval = setInterval(() => {
      if (!unsubscribeTG) {
        unsubscribeTG = syncTG();
        if (unsubscribeTG) clearInterval(pollInterval);
      } else {
        clearInterval(pollInterval);
      }
    }, 500);

    return () => {
      clearInterval(pollInterval);
      const tg = (window as any).Telegram?.WebApp;
      if (tg && unsubscribeTG) {
        tg.offEvent('viewportChanged', unsubscribeTG);
      }
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('auralook_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleFullscreen = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.expand) {
      tg.ready();
      tg.expand();
      setIsFullscreen(true);
      return;
    }
    
    // Standard Browser Fallback
    const doc = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    } else {
      doc.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(false));
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  const isAdmin = user?.username?.toLowerCase() === 'itsjamaspage' || 
                  user?.role === 'admin' || 
                  user?.role === 'editor' ||
                  user?.role === 'owner' ||
                  user?.firebaseUid === 'demo_admin_session';

  if (!mounted) return null;

  const BOT_URL = "https://t.me/jamastore_aibot/app?startapp=from_web";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-foreground/10 px-4 py-2.5 shadow-xl">
      <div className="max-w-3xl mx-auto flex items-center justify-between h-10">
        
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Auralook
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className={cn(
              "rounded-full border border-foreground/10 hover:bg-foreground/5 h-9 w-9 p-0 group transition-all",
              isFullscreen && "neon-border"
            )}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 neon-text" />
            ) : (
              <Maximize2 className="w-4 h-4 text-foreground group-hover:neon-text" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-foreground/20 hover:bg-foreground/5 h-9 w-9 p-0 font-black uppercase text-foreground text-[10px]">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-1.5 min-w-[100px]">
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
              <Button className="rounded-full h-9 w-9 p-0 border border-foreground/10 bg-foreground/5 hover:neon-border group">
                <Menu className="w-4 h-4 text-foreground group-active:scale-90 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-2.5 w-64 mt-2">
              <div className="px-3 py-3 mb-1 border-b border-foreground/5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">{t(dictionary.protocol)}</p>
                {user && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs font-bold neon-text truncate">@{user.username || user.firstName}</p>
                    {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-primary animate-pulse" />}
                  </div>
                )}
              </div>
              
              <Link href="/looks">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
                  <Compass className="w-5 h-5 neon-text" />
                  <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.browseLooks)}</span>
                </DropdownMenuItem>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
                    <LayoutDashboard className="w-5 h-5 neon-text" />
                    <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.adminPanel)}</span>
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator className="bg-foreground/5 my-1.5" />
              <DropdownMenuItem 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 neon-text" /> : <Moon className="w-5 h-5 neon-text" />}
                <span className="font-bold text-xs uppercase tracking-widest">
                  {theme === 'dark' ? t(dictionary.light) : t(dictionary.dark)}
                </span>
              </DropdownMenuItem>
              <Link href={isInsideTelegram ? "/profile" : BOT_URL} target={isInsideTelegram ? "_self" : "_blank"}>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
                  <User className="w-5 h-5 neon-text" />
                  <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.profile)}</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
