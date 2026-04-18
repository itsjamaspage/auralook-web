
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
  LogIn,
  Heart,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isVerified, isLoading } = useTelegramUser();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);

  useEffect(() => {
    setMounted(true);

    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initData) {
      setIsInsideTelegram(true);
      tg.ready();
      setIsFullscreen(tg.isFullscreen ?? tg.isExpanded ?? false);

      const onFullscreenChanged = () => {
        setIsFullscreen(tg.isFullscreen ?? tg.isExpanded ?? false);
      };

      if (typeof tg.onEvent === 'function') {
        tg.onEvent('fullscreenChanged', onFullscreenChanged);
        tg.onEvent('viewportChanged', onFullscreenChanged);
      }

      const poll = setInterval(() => {
        setIsFullscreen(tg.isFullscreen ?? tg.isExpanded ?? false);
      }, 500);

      return () => {
        clearInterval(poll);
        if (typeof tg.offEvent === 'function') {
          tg.offEvent('fullscreenChanged', onFullscreenChanged);
          tg.offEvent('viewportChanged', onFullscreenChanged);
        }
      };
    }

    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleFullscreen = () => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      const currentlyFullscreen = tg.isFullscreen ?? tg.isExpanded ?? false;

      if (currentlyFullscreen) {
        // Try to exit / collapse
        if (typeof tg.exitFullscreen === 'function') {
          tg.exitFullscreen();
        } else if (typeof tg.collapse === 'function') {
          tg.collapse();
        }
        setIsFullscreen(false);
      } else {
        // Try to go fullscreen — requestFullscreen (Bot API 8.0+) first, then expand
        if (typeof tg.requestFullscreen === 'function') {
          tg.requestFullscreen();
        } else {
          tg.expand();
        }
        setIsFullscreen(true);
      }
      return;
    }

    // Browser fallback (non-Telegram)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
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

  const BOT_URL = "https://t.me/jamastore_aibot/auralook?startapp=from_web";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3 shadow-sm">
      <div className="max-w-2xl mx-auto lg:max-w-7xl lg:px-8 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="neon-text group-hover:scale-105 transition-transform flex items-center whitespace-nowrap text-2xl sm:text-3xl font-black tracking-tighter italic uppercase leading-none">
            AURAL
            <svg
              viewBox="0 0 52 26"
              className="inline-block h-[0.85em] mx-[0.04em] align-middle"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="13" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="13" cy="13" r="3.8" fill="currentColor"/>
              <circle cx="39" cy="13" r="11" fill="none" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="39" cy="13" r="3.8" fill="currentColor"/>
            </svg>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className={cn(
              "rounded-full border border-border hover:bg-secondary h-11 w-11 p-0 transition-all",
              isFullscreen && "neon-border neon-text"
            )}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-border hover:bg-secondary h-11 w-11 p-0 font-black text-xs">
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
                "rounded-full h-11 w-11 p-0 border border-border bg-secondary hover:neon-border transition-all",
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
              
              {[
                { href: '/looks',     icon: Compass,      label: t(dictionary.browseLooks) },
                { href: '/favorites', icon: Heart,        label: t(dictionary.favorites) },
                { href: '/cart',      icon: ShoppingCart, label: t(dictionary.cart) },
                { href: '/orders',    icon: Package,      label: t(dictionary.myOrders) },
              ].map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link key={href} href={href}>
                    <DropdownMenuItem className={cn(
                      'flex items-center gap-3 px-3 py-3.5 rounded-lg cursor-pointer',
                      active && 'bg-secondary'
                    )}>
                      <Icon className={cn('w-5 h-5', active ? 'neon-text' : 'text-foreground/60')} />
                      <span className={cn('font-bold text-xs uppercase tracking-widest', active && 'neon-text')}>{label}</span>
                    </DropdownMenuItem>
                  </Link>
                );
              })}

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
