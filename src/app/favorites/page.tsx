
"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Loader2, Heart, HeartOff, CheckCircle2, X } from 'lucide-react';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';

export default function FavoritesPage() {
  const db = useFirestore();
  const { user: tgUser } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: allLooks, isLoading: looksLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    if (isUserLoading || !tgUser || !firebaseUser || tgUser.firebaseUid === 'pending') {
      return null;
    }
    return collection(db, 'users', tgUser.id, 'liked_looks');
  }, [db, tgUser, firebaseUser, isUserLoading]);
  
  const { data: likedData } = useCollection(likedLooksQuery ?? undefined);
  const likedIds = useMemo(() => new Set(likedData?.map(l => l.lookId) || []), [likedData]);

  const myFavorites = useMemo(() => {
    return allLooks?.filter(look => likedIds.has(look.id)) || [];
  }, [allLooks, likedIds]);

  const handleRemove = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tgUser || !firebaseUser) return;
    
    try {
      await deleteDoc(doc(db, 'users', tgUser.id, 'liked_looks', lookId));
      toast({ title: t(dictionary.delete), description: "" });
    } catch (e) {
      console.error(e);
    }
  };

  if (looksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white font-mono text-xs uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!tgUser) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-6">
        <Heart className="w-16 h-16 text-white/10 mx-auto" />
        <h1 className="text-xl font-black text-white uppercase italic">{t(dictionary.identificationRequired)}</h1>
        <p className="text-white/70 text-sm max-w-xs mx-auto">{t(dictionary.openInBot)}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen">
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 neon-text fill-current" />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
          {t(dictionary.favorites)}
        </h1>
      </div>

      {myFavorites.length === 0 ? (
        <div className="py-32 text-center space-y-4">
          <HeartOff className="w-12 h-12 text-white/10 mx-auto" />
          <p className="text-white uppercase font-black italic tracking-widest">{t(dictionary.repositoryEmpty)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-32">
          {myFavorites.map((look) => (
            <div key={look.id} className="relative group">
              <Link href={`/looks/${look.id}`} onClick={() => setNavigatingId(look.id)}>
                <Card className="bg-[#080808]/40 border border-white/5 overflow-hidden rounded-[2rem] transition-all hover:border-white/20 relative">
                  <div className="relative aspect-[4/5] overflow-hidden p-1">
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                      alt={look.name || 'Look'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-[1.8rem]"
                    />
                    <button 
                      onClick={(e) => handleRemove(e, look.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border border-white/10 text-white hover:text-destructive hover:border-destructive/40 flex items-center justify-center transition-all z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {navigatingId === look.id && (
                      <div className="absolute inset-0 flex items-center justify-center glass-dark z-20">
                        <Loader2 className="w-8 h-8 animate-spin neon-text" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black neon-text italic tracking-tighter">
                          {look.currency === 'UZS' ? `${new Intl.NumberFormat('uz-UZ').format(look.price)} UZS` : `$${look.price}`}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      </div>
                      <h3 className="text-sm font-bold text-white truncate uppercase tracking-tight">{look.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
