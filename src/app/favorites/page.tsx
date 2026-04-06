
"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Loader2, Heart, HeartOff, CheckCircle2 } from 'lucide-react';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function FavoritesPage() {
  const db = useFirestore();
  const { user: tgUser } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

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
    
    setAnimatingId(lookId);
    setTimeout(async () => {
      try {
        await deleteDoc(doc(db, 'users', tgUser.id, 'liked_looks', lookId));
      } catch (e) {
        console.error(e);
      } finally {
        setAnimatingId(null);
      }
    }, 300);
  };

  if (looksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground font-mono text-xs uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!tgUser) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-6">
        <Heart className="w-16 h-16 neon-text mx-auto opacity-20" />
        <h1 className="text-xl font-black text-foreground uppercase italic">{t(dictionary.identificationRequired)}</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t(dictionary.openInBot)}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen">
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 neon-text fill-current" />
        <h1 className="text-2xl font-black text-foreground italic uppercase tracking-tight">
          {t(dictionary.favorites)}
        </h1>
      </div>

      {myFavorites.length === 0 ? (
        <div className="py-32 text-center space-y-4">
          <HeartOff className="w-12 h-12 text-foreground/10 mx-auto" />
          <p className="text-foreground uppercase font-black italic tracking-widest">{t(dictionary.repositoryEmpty)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-32">
          {myFavorites.map((look) => (
            <div key={look.id} className={cn("relative group transition-all duration-300", animatingId === look.id && "scale-90 opacity-0")}>
              <Link href={`/looks/${look.id}`} onClick={() => setNavigatingId(look.id)}>
                <Card className="bg-card border border-border overflow-hidden rounded-[2rem] transition-all hover:border-primary/20 relative shadow-lg">
                  <div className="relative aspect-[4/5] overflow-hidden p-1">
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                      alt={look.name || 'Look'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-[1.8rem]"
                    />
                    <button 
                      onClick={(e) => handleRemove(e, look.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full glass-surface border border-foreground/10 neon-text hover:text-destructive hover:border-destructive/40 flex items-center justify-center transition-all z-10"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                    {navigatingId === look.id && (
                      <div className="absolute inset-0 flex items-center justify-center glass-surface z-20">
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
                      <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{look.name}</h3>
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
