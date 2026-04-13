
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
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isVerified, isLoading } = useTelegramUser();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);

    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsInsideTelegram(true);
      tg.ready();
      const pollInterval = setInterval(() => {
        if (tg.isExpanded !== isFullscreen) setIsFullscreen(tg.isExpanded);
      }, 500);
      return () => {
        clearInterval(pollInterval);
        document.removeEventListener('fullscreenchange', handleFsChange);
      };
    }
    
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleFullscreen = () => {
    const tg = (window as any).Telegram?.WebApp;
    const isNowFs = !!document.fullscreenElement || (tg?.isExpanded ?? false);

    if (!isNowFs) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      if (tg) {
        tg.ready();
        tg.expand();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  const isAdmin = user?.username?.toLowerCase() === 'itsjamaspage' || 
                  user?.username?.toLowerCase() === 'jama_khaki' ||
                  user?.role === 'admin' || 
                  user?.role === 'editor' ||
                  user?.role === 'owner' ||
                  user?.firebaseUid === 'demo_admin_session';

  if (!mounted) return null;

  const BOT_URL = "https://t.me/jamastore_aibot/app?startapp=from_web";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border px-6 py-4 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            AURALOOK
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className={cn(
              "rounded-full border border-border hover:bg-secondary h-12 w-12 p-0 transition-all",
              isFullscreen && "neon-border neon-text"
            )}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-border hover:bg-secondary h-12 w-12 p-0 font-black text-xs">
                {lang.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border p-2">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={cn("font-bold text-xs py-2 px-4 rounded-lg cursor-pointer", lang === l.code && "neon-text bg-secondary")}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className={cn(
                "rounded-full h-12 w-12 p-0 border border-border bg-secondary hover:neon-border transition-all",
                !isVerified && !isLoading && "border-primary animate-pulse"
              )}>
                {isVerified ? (
                  <User className="w-6 h-6 text-foreground" />
                ) : (
                  <LogIn className="w-6 h-6 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border-border p-3 w-64 mt-2 shadow-2xl">
              <div className="px-3 py-3 mb-1 border-b border-border">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">{t(dictionary.protocol)}</p>
                {user && isVerified ? (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-bold neon-text truncate">@{user.username || user.firstName}</p>
                    {isAdmin && <ShieldCheck className="w-4 h-4 text-primary animate-pulse" />}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-primary italic mt-1">{t(dictionary.identificationRequired)}</p>
                )}
              </div>
              
              <Link href="/looks">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer">
                  <Compass className="w-5 h-5 neon-text" />
                  <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.browseLooks)}</span>
                </DropdownMenuItem>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer">
                    <LayoutDashboard className="w-5 h-5 neon-text" />
                    <span className="font-bold text-xs uppercase tracking-widest">{t(dictionary.adminPanel)}</span>
                  </DropdownMenuItem>
                </Link>
              )}

              <DropdownMenuSeparator className="bg-border my-2" />
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer">
                {theme === 'dark' ? <Sun className="w-5 h-5 neon-text" /> : <Moon className="w-5 h-5 neon-text" />}
                <span className="font-bold text-xs uppercase tracking-widest">{theme === 'dark' ? t(dictionary.light) : t(dictionary.dark)}</span>
              </DropdownMenuItem>
              <Link href={isInsideTelegram ? "/profile" : BOT_URL} target={isInsideTelegram ? "_self" : "_blank"}>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer">
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
