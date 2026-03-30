"use client"

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Loader2, ShoppingCart } from 'lucide-react';

export default function LooksPage() {
  const db = useFirestore();
  const { t, dictionary } = useLanguage();
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading } = useCollection(looksQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Loading Catalog...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter neon-text uppercase italic leading-none">
          {t(dictionary.browseLooks)}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {looks?.map((look) => (
          <Card key={look.id} className="bg-[#080808] border-none overflow-hidden group rounded-[2.5rem] shadow-2xl relative">
            <div className="relative aspect-[3/4] overflow-hidden p-2">
              <Image
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                alt={look.name || 'Look'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-[2rem]"
              />
              
              {/* High-Fidelity Action Overlay */}
              <div className="absolute inset-x-0 bottom-4 px-4 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <Link 
                  href={`/looks/${look.id}`} 
                  onClick={() => setNavigatingId(look.id)}
                  className="w-full h-12 neon-bg rounded-xl flex items-center justify-center text-black font-black uppercase text-[10px] gap-2 transition-[transform,opacity] hover:scale-105"
                >
                  {navigatingId === look.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      {t(dictionary.viewDetails)}
                    </>
                  )}
                </Link>
              </div>
            </div>

            <div className="p-6 pt-0 bg-transparent space-y-1">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">REF: {look.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">
                    {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {(!looks || looks.length === 0) && (
          <div className="col-span-full py-24 text-center">
            <p className="text-white/40 font-light italic">
              {t(dictionary.emptyCatalog)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
