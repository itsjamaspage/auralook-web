"use client"

import Link from 'next/link';
import { useLanguage, type Language } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, Heart } from 'lucide-react';
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

export function Navbar() {
  const { dictionary, t, lang, setLang } = useLanguage();
  const { user, isUserLoading } = useUser();
  const auth = authInstance();
  const db = useFirestore();

  function authInstance() {
    try {
      return useAuth();
    } catch {
      return null;
    }
  }

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-dark rounded-2xl px-6 lg:px-8 py-4 border border-white/10 shadow-2xl">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl lg:text-3xl font-black tracking-tighter neon-text whitespace-nowrap italic group-hover:scale-105 transition-transform">
            Auralook.uz
          </span>
        </Link>

        <div className="hidden lg:flex items-center text-sm font-medium absolute left-1/2 -translate-x-1/2">
          <Link href="/looks" className="text-white/80 hover:neon-text transition-colors uppercase tracking-widest font-black text-xs">
            {t(dictionary.browseLooks)}
          </Link>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full border border-white/20 hover:bg-white/5 h-10 lg:h-11 w-10 lg:w-11 p-0 font-black uppercase text-white text-xs">
                {lang}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-dark border-white/10">
              {languages.map((l) => (
                <DropdownMenuItem 
                  key={l.code} 
                  onClick={() => setLang(l.code)}
                  className={`font-bold text-sm ${lang === l.code ? "bg-white/10 neon-text" : "text-white"}`}
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
                    className="rounded-full font-black border border-white/20 hover:bg-white/5 transition-all bg-transparent px-4 lg:px-5 h-10 lg:h-11 text-white text-xs flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                    {likedLooks && likedLooks.length > 0 && (
                      <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-md border border-primary/30 ml-1">
                        <Heart className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-[10px] neon-text">{likedLooks.length}</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10 min-w-[200px] lg:min-w-[240px] p-2">
                  <div className="px-3 py-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/looks" className="flex items-center w-full cursor-pointer py-3 px-3 rounded-xl hover:bg-white/5 transition-colors group">
                      <Heart className={`w-5 h-5 mr-3 transition-colors ${likedLooks && likedLooks.length > 0 ? 'fill-primary text-primary' : 'text-white/40 group-hover:neon-text'}`} />
                      <span className="font-bold text-sm text-white">Favorites {likedLooks && `(${likedLooks.length})`}</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center w-full cursor-pointer py-3 px-3 rounded-xl hover:bg-white/5 transition-colors">
                          <LayoutDashboard className="w-5 h-5 mr-3 neon-text" />
                          <span className="font-bold text-sm text-white">{t(dictionary.adminPanel)}</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center w-full cursor-pointer py-3 px-3 rounded-xl hover:bg-destructive/10 text-destructive focus:text-destructive">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-bold text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="rounded-full font-black border border-white/20 hover:bg-white/5 transition-colors bg-transparent px-4 lg:px-6 h-10 lg:h-11 text-white text-xs"
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
