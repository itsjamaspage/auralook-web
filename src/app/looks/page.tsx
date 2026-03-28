"use client"

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
      <div className="space-y-2 mb-12">
        <h1 className="text-4xl font-black tracking-tighter neon-text uppercase italic">
          {t(dictionary.browseLooks)}
        </h1>
        <p className="text-white/60 max-w-2xl font-light">
          {t(dictionary.curatedLooksSub)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {looks?.map((look) => (
          <Link key={look.id} href={`/looks/${look.id}`}>
            <Card className="glass-dark border-white/10 overflow-hidden group hover:neon-border transition-all duration-500 rounded-[2rem]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                  alt={t(look.name) || 'Look'}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="w-full h-12 neon-bg rounded-xl flex items-center justify-center text-black font-black uppercase text-xs gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    {t(dictionary.viewDetails)}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-white/40 uppercase tracking-tighter">REF: {look.id.substring(0, 8)}</p>
                    <p className="text-sm font-light text-white/80 line-clamp-1 italic">{t(look.description)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black neon-text block">
                      {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
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
