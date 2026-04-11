
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

    // PROTOCOL: Handshake & Viewport Synchronization
    const syncViewport = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initData) {
        setIsInsideTelegram(true);
        // Initial state sync
        setIsFullscreen(tg.isExpanded);
        
        // Listen for viewport changes (swipes, manual expansion)
        tg.onEvent('viewportChanged', () => {
          setIsFullscreen(tg.isExpanded);
        });
        
        tg.ready();
      } else {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
      }
    };

    const cleanup = syncViewport();
    return () => {
      if (typeof cleanup === 'function') cleanup();
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
    
    // Telegram Expansion Protocol
    if (tg && tg.expand) {
      tg.ready(); // Re-handshake
      tg.expand();
      // Expansion state is handled by the viewportChanged listener
      return;
    }
    
    // Standard Browser Toggle Protocol
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback for Safari/Mobile Browsers if needed
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-foreground/10 px-6 py-4 shadow-xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* BRAND LOGO - Centered Priority */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Auralook
          </span>
        </Link>

        {/* ACTION BUTTONS - Centric Proximity */}
        <div className="flex items-center gap-3 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className={cn(
              "rounded-full border border-foreground/10 hover:bg-foreground/5 h-11 w-11 sm:h-12 sm:w-12 p-0 group transition-all",
              isFullscreen && "neon-border"
            )}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6 neon-text" />
            ) : (
              <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:neon-text" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-foreground/20 hover:bg-foreground/5 h-11 w-11 sm:h-12 sm:w-12 p-0 font-black uppercase text-foreground text-xs">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-2 min-w-[120px]">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "font-bold text-xs py-2.5 px-4 rounded-lg cursor-pointer transition-colors",
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
              <Button className="rounded-full h-11 w-11 sm:h-12 sm:w-12 p-0 border border-foreground/10 bg-foreground/5 hover:neon-border group">
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-active:scale-90 transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-surface border-foreground/10 p-3 w-64 mt-2">
              <div className="px-3 py-3 mb-1 border-b border-foreground/5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">{t(dictionary.protocol)}</p>
                {user && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold neon-text truncate">@{user.username || user.firstName}</p>
                    {isAdmin && <ShieldCheck className="w-4 h-4 text-primary animate-pulse" />}
                  </div>
                )}
              </div>
              
              <Link href="/looks">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
                  <Compass className="w-5 h-5 neon-text" />
                  <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.browseLooks)}</span>
                </DropdownMenuItem>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
                    <LayoutDashboard className="w-5 h-5 neon-text" />
                    <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.adminPanel)}</span>
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator className="bg-foreground/5 my-2" />
              <DropdownMenuItem 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 neon-text" /> : <Moon className="w-5 h-5 neon-text" />}
                <span className="font-bold text-xs uppercase tracking-widest">
                  {theme === 'dark' ? t(dictionary.light) : t(dictionary.dark)}
                </span>
              </DropdownMenuItem>
              <Link href={isInsideTelegram ? "/profile" : BOT_URL} target={isInsideTelegram ? "_self" : "_blank"}>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer text-foreground hover:bg-foreground/5">
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
