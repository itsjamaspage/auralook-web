"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Loader2, Heart, HeartOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function FavoritesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // Get all looks
  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: allLooks, isLoading: looksLoading } = useCollection(looksQuery);

  // Get liked looks for current user
  const likedLooksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'liked_looks');
  }, [db, user]);
  
  const { data: likedLooksData, isLoading: likedLoading } = useCollection(likedLooksQuery);
  const likedLookIds = new Set(likedLooksData?.map(l => l.lookId) || []);

  const favoriteLooks = allLooks?.filter(look => likedLookIds.has(look.id)) || [];

  const handleToggleLike = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const likedLookRef = doc(db, 'users', user.uid, 'liked_looks', lookId);
    
    try {
      await deleteDoc(likedLookRef);
      toast({
        title: "O'chirildi",
        description: "Libos saralanganlardan olib tashlandi.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (looksLoading || likedLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Scanning Favorites...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="text-white/40 uppercase font-black italic">Unauthorized Access. Please login.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 neon-text fill-current" />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
          {t(dictionary.favorites)}
        </h1>
      </div>

      {favoriteLooks.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-32">
          {favoriteLooks.map((look) => (
            <div key={look.id} className="relative group">
              <Link href={`/looks/${look.id}`} onClick={() => setNavigatingId(look.id)}>
                <Card className="bg-[#080808]/40 border border-white/5 overflow-hidden rounded-[2rem] shadow-2xl relative transition-all hover:border-white/20">
                  <div className="relative aspect-[4/5] overflow-hidden p-1">
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                      alt={look.name || 'Look'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-[1.8rem]"
                    />
                    
                    <button 
                      onClick={(e) => handleToggleLike(e, look.id)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border border-white/10 text-white/60 hover:text-destructive hover:border-destructive transition-all z-10 flex items-center justify-center bg-black/20"
                    >
                      <HeartOff className="w-5 h-5" />
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
                          {look.currency === 'UZS' ? `${look.price} UZS` : `$${look.price}`}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                      </div>
                      <h3 className="text-sm font-bold text-white truncate uppercase tracking-tight">{look.name}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Heart className="w-8 h-8 text-white/10" />
          </div>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] italic">
            Hozircha hech narsa yo'q.
          </p>
          <Link href="/looks">
            <button className="neon-text font-black text-xs uppercase tracking-widest hover:underline mt-4">
              Katalogga qaytish
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
