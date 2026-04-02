
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Compass } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const NavLink = ({ href, children, icon: Icon }: { href: string, children: React.ReactNode, icon?: any }) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link href={href} className={cn(
        "transition-all uppercase tracking-[0.2em] font-black text-[10px] lg:text-xs flex items-center gap-2 px-6 py-2.5 rounded-xl border-2",
        isActive 
          ? "neon-text neon-border bg-white/5 shadow-[0_0_20px_rgba(var(--sync-color),0.3)]" 
          : "text-white/40 hover:text-white border-transparent hover:bg-white/5"
      )}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
      </Link>
    );
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-3xl lg:rounded-[2.5rem] px-6 lg:px-10 py-4 lg:py-5 border border-white/10 shadow-2xl relative">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl lg:text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Auralook
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 gap-4">
          <NavLink href="/looks" icon={Compass}>
            {t(dictionary.browseLooks)}
          </NavLink>
          <NavLink href="/admin" icon={LayoutDashboard}>
            {t(dictionary.adminPanel)}
          </NavLink>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-10 lg:h-11 w-10 lg:w-11 p-0 font-black uppercase text-white text-[10px] lg:text-xs">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10 p-2">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={`font-bold text-xs py-2 px-4 rounded-lg cursor-pointer ${lang === l.code ? "bg-white/10 neon-text" : "text-white"}`}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin" className="lg:hidden">
            <Button 
              variant="ghost" 
              className={cn(
                "rounded-full border h-10 w-10 p-0 transition-all",
                pathname.startsWith('/admin') ? "neon-border neon-text bg-white/5" : "border-white/20"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
