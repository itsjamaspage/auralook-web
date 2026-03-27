"use client"

import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Globe, User, ShieldCheck, ShoppingBag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { lang, changeLanguage, dictionary, t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-2xl px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-primary">JAMA</span>
          <span className="text-2xl font-light tracking-tighter">STORE</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">{t(dictionary.browseLooks)}</Link>
          <Link href="/admin" className="flex items-center gap-1 hover:text-primary transition-colors">
            <ShieldCheck className="w-4 h-4" />
            {t(dictionary.adminPanel)}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10">
              <DropdownMenuItem onClick={() => changeLanguage('en')} className={lang === 'en' ? 'text-primary' : ''}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ru')} className={lang === 'ru' ? 'text-primary' : ''}>
                Русский
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('uz')} className={lang === 'uz' ? 'text-primary' : ''}>
                O'zbek
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/login">
            <Button variant="outline" className="rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}