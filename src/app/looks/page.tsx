"use client"

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Heart, Search, Filter, Grid2X2, List, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LooksPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading } = useCollection(looksQuery);

  const filteredLooks = looks?.filter(look => 
    look.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    look.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleLike = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: t(dictionary.registrationRequiredTitle),
        description: t(dictionary.registrationRequiredDesc),
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    const likedLookRef = doc(db, 'users', user.uid, 'liked_looks', lookId);
    
    try {
      const docSnap = await getDoc(likedLookRef);
      if (docSnap.exists()) {
        await deleteDoc(likedLookRef);
      } else {
        await setDoc(likedLookRef, {
          lookId: lookId,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Scanning Catalog...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:neon-text transition-colors" />
          <Input 
            placeholder="Search futuristic styles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-white/[0.03] border-white/10 rounded-2xl pl-12 pr-12 text-white placeholder:text-white/20 focus:neon-border transition-all"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:neon-text text-white/20 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white italic">{filteredLooks?.length || 0}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Listings Detected</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 neon-bg rounded-lg text-black">
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredLooks?.map((look) => (
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
                  
                  {/* Heart Overlay */}
                  <button 
                    onClick={(e) => handleToggleLike(e, look.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white/60 hover:neon-text hover:neon-border transition-all z-10"
                  >
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Loading Indicator */}
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

                  <div className="flex flex-col gap-0.5 pt-1">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tashkent, Mirzo Ulugbek</p>
                    <p className="text-[9px] font-mono text-white/20 uppercase">Available Now</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ))}

        {(!filteredLooks || filteredLooks.length === 0) && (
          <div className="col-span-full py-32 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Search className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] italic">
              No results found in the grid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
