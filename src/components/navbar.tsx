
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Maximize2, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-3xl lg:rounded-[2.5rem] px-6 lg:px-12 py-4 lg:py-6 border border-white/10 shadow-2xl">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl lg:text-4xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform uppercase">
            Auralook
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 gap-8">
          <Link href="/looks" className="text-white hover:neon-text transition-colors uppercase tracking-[0.2em] font-black text-xs lg:text-sm">
            {t(dictionary.browseLooks)}
          </Link>
          <Link href="/admin" className="text-white/40 hover:neon-text transition-colors uppercase tracking-[0.2em] font-black text-xs lg:text-sm flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            {t(dictionary.adminPanel)}
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-10 lg:h-12 w-10 lg:w-12 p-0 font-black uppercase text-white text-[10px] lg:text-sm">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10 p-2">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={`font-bold text-sm py-2 px-4 rounded-lg cursor-pointer ${lang === l.code ? "bg-white/10 neon-text" : "text-white"}`}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin">
            <Button 
              variant="ghost" 
              className="rounded-full font-black border border-white/20 hover:bg-white/5 transition-colors bg-transparent px-4 lg:px-8 h-10 lg:h-12 text-white text-xs lg:text-sm flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">{t(dictionary.adminPanel)}</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
