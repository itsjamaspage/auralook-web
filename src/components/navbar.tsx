"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Heart, Send } from 'lucide-react';
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, collection } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Full User Profile (including Telegram details)
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  // Admin Check
  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_order_managers', user.uid);
  }, [db, user]);
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole || user?.email === 'jkhakimjonov8@gmail.com';

  // Liked Looks Count
  const likedLooksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'liked_looks');
  }, [db, user]);
  const { data: likedLooks } = useCollection(likedLooksQuery);

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';
  const isTelegram = !!profile?.telegramId;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-3xl px-8 lg:px-12 py-6 border border-white/10 shadow-2xl">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl lg:text-4xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform">
            Auralook.uz
          </span>
        </Link>

        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
          <Link href="/looks" className="text-white hover:neon-text transition-colors uppercase tracking-[0.2em] font-black text-sm lg:text-base">
            {t(dictionary.browseLooks)}
          </Link>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-11 lg:h-12 w-11 lg:w-12 p-0 font-black uppercase text-white text-sm">
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

          {mounted && !isUserLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-black border border-white/20 hover:bg-white/5 transition-all bg-transparent px-3 lg:px-5 h-11 lg:h-12 text-white text-sm flex items-center gap-3"
                  >
                    <Avatar className="w-8 h-8 border border-white/10">
                      <AvatarImage src={profile?.photoUrl} />
                      <AvatarFallback className="bg-white/5 text-[10px]"><User className="w-4 h-4 text-primary" /></AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{displayName}</span>
                    {isTelegram && <Send className="w-3 h-3 text-primary animate-pulse" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10 min-w-[220px] lg:min-w-[260px] p-2">
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{profile?.telegramUsername || user.email}</p>
                    <p className="text-[8px] font-bold text-primary uppercase mt-1">Status: Fully Linked</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/looks" className="flex items-center w-full cursor-pointer py-4 px-4 rounded-xl hover:bg-white/5 transition-colors group">
                      <Heart className={`w-6 h-6 mr-3 transition-colors ${likedLooks && likedLooks.length > 0 ? 'fill-primary text-primary' : 'text-white/40 group-hover:neon-text'}`} />
                      <span className="font-bold text-sm text-white">Favorites {likedLooks && `(${likedLooks.length})`}</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full cursor-pointer py-4 px-4 rounded-xl hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-6 h-6 mr-3 neon-text" />
                          <span className="font-bold text-sm text-white">{t(dictionary.adminPanel)}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center w-full cursor-pointer py-4 px-4 rounded-xl hover:bg-destructive/10 text-destructive focus:text-destructive">
                    <LogOut className="w-6 h-6 mr-3" />
                    <span className="font-bold text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-black border border-white/20 hover:bg-white/5 transition-colors bg-transparent px-6 lg:px-8 h-11 lg:h-12 text-white text-sm"
                  >
                    <User className="w-5 h-5 mr-0 lg:mr-2" />
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
