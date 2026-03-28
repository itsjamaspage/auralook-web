"use client"

import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { lang, changeLanguage, dictionary, t } = useLanguage();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-2xl px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter neon-text">Auralook.uz</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:neon-text transition-colors duration-500">{t(dictionary.browseLooks)}</Link>
          {user && (
            <Link href="/orders" className="hover:neon-text transition-colors duration-500">{t(dictionary.myOrders)}</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full w-10 h-10 font-bold p-0 border border-white/10 hover:bg-white/5 transition-colors">
                {lang.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10">
              <DropdownMenuItem onClick={() => changeLanguage('en')} className={lang === 'en' ? 'neon-text' : ''}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('ru')} className={lang === 'ru' ? 'neon-text' : ''}>
                Русский
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('uz')} className={lang === 'uz' ? 'neon-text' : ''}>
                O'zbek
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {!isUserLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-bold border border-white/10 hover:bg-white/5 transition-colors bg-transparent px-4 h-10"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.email?.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10">
                  <DropdownMenuItem className="text-muted-foreground text-xs">{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t(dictionary.logout)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  className="rounded-full font-bold border border-white/10 hover:bg-white/5 transition-colors bg-transparent px-4 h-10"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t(dictionary.login)}
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
