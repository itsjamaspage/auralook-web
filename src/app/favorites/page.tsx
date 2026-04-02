
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Loader2, Heart, HeartOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function FavoritesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // Get all looks since we don't have user-specific liked list in a non-auth environment
  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: allLooks, isLoading: looksLoading } = useCollection(looksQuery);

  if (looksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Syncing Catalog...</p>
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

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-32">
        {allLooks?.map((look) => (
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
    </div>
  );
}
