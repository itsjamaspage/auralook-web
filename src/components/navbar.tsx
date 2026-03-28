"use client"

import Link from 'next/link';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_order_managers', user.uid);
  }, [db, user]);

  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole || user?.email === 'jkhakimjonov8@gmail.com';

  const handleLogout = () => {
    signOut(auth);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-2xl px-4 lg:px-6 py-3 border border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl lg:text-2xl font-black tracking-tighter neon-text whitespace-nowrap">
            Auralook.uz
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <Link href="/looks" className="text-white/80 hover:neon-text transition-colors">{t(dictionary.browseLooks)}</Link>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-9 lg:h-10 px-3 lg:px-4 font-bold uppercase text-white text-xs lg:text-sm">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={lang === l.code ? "bg-white/10 neon-text" : "text-white"}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isUserLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-bold border border-white/20 hover:bg-white/5 transition-colors bg-transparent px-3 lg:px-4 h-9 lg:h-10 text-white text-xs lg:text-sm"
                  >
                    <User className="w-4 h-4 mr-0 lg:mr-2" />
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10 min-w-[200px] lg:min-w-[220px] p-2">
                  <div className="px-3 py-2 lg:hidden">
                    <p className="font-bold text-white text-sm mb-4">{t(dictionary.browseLooks)}</p>
                    <Link href="/looks" className="block text-white/60 hover:neon-text text-sm mb-4">
                      {t(dictionary.browseLooks)}
                    </Link>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5 lg:hidden" />
                  <div className="px-3 py-2">
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full cursor-pointer py-3 px-3 rounded-xl hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-5 h-5 mr-3 neon-text" />
                          <span className="font-bold text-sm text-white">{t(dictionary.adminPanel)}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/5" />
                    </>
                  )}

                  <DropdownMenuItem onClick={handleLogout} className="flex items-center w-full cursor-pointer py-3 px-3 rounded-xl hover:bg-destructive/10 text-destructive focus:text-destructive">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-bold text-sm">{t(dictionary.logout)}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/looks" className="lg:hidden">
                   <Button variant="ghost" size="icon" className="rounded-full border border-white/20 hover:bg-white/5 h-9 w-9 text-white">
                     <Menu className="w-4 h-4" />
                   </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-bold border border-white/20 hover:bg-white/5 transition-colors bg-transparent px-3 lg:px-4 h-9 lg:h-10 text-white text-xs lg:text-sm"
                  >
                    <User className="w-4 h-4 mr-0 lg:mr-2" />
                    <span className="hidden lg:inline">{t(dictionary.login)}</span>
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
