
"use client"

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Heart, Filter, Grid2x2, List, CheckCircle2, X, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export default function LooksPage() {
  const db = useFirestore();
  const { user: tgUser } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | 'USD' | 'UZS'>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    if (isUserLoading || !firebaseUser || !tgUser || tgUser.firebaseUid === 'pending') {
      return null;
    }
    return collection(db, 'users', tgUser.id, 'liked_looks');
  }, [db, tgUser, firebaseUser, isUserLoading]);
  
  const { data: likedLooksData } = useCollection(likedLooksQuery ?? undefined);
  const likedLookIds = useMemo(() => new Set(likedLooksData?.map(l => l.lookId) || []), [likedLooksData]);

  const filteredAndSortedLooks = useMemo(() => {
    if (!looks) return [];

    let result = looks.filter(look => {
      const matchesCurrency = filterCurrency === 'ALL' || look.currency === filterCurrency;
      
      const price = Number(look.price || 0);
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;

      if (filterCurrency === 'ALL') return matchesCurrency;
      
      return matchesCurrency && price >= min && price <= max;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [looks, filterCurrency, minPrice, maxPrice, sortBy]);

  const formatPrice = (val: any) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
  };

  const handleToggleLike = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!tgUser || !firebaseUser || tgUser.firebaseUid === 'pending') {
      toast({
        title: t(dictionary.syncing),
        variant: "destructive"
      });
      return;
    }

    const likedLookRef = doc(db, 'users', tgUser.id, 'liked_looks', lookId);
    
    try {
      if (likedLookIds.has(lookId)) {
        await deleteDoc(likedLookRef);
      } else {
        await setDoc(likedLookRef, { lookId, createdAt: new Date().toISOString() });
      }
    } catch (e) {
      console.error('Like toggle failed:', e);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className={cn(
                "h-12 px-6 rounded-2xl border-white/10 text-white hover:neon-border hover:neon-text transition-all font-bold",
                showFilters && "neon-border neon-text bg-white/5"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t(dictionary.filter)}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setViewMode('grid')} 
              variant="ghost" 
              className={cn("h-12 w-12 rounded-2xl transition-all", viewMode === 'grid' ? "neon-bg text-black" : "bg-white/5 text-white/40")}
            >
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => setViewMode('list')} 
              variant="ghost" 
              className={cn("h-12 w-12 rounded-2xl transition-all", viewMode === 'list' ? "neon-bg text-black" : "bg-white/5 text-white/40")}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="glass-dark border-white/10 rounded-[2.5rem] p-8 space-y-10 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">{t(dictionary.filterParameters)}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="text-white hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-white uppercase tracking-widest">{t(dictionary.currencyUnit)}</Label>
                <RadioGroup value={filterCurrency} onValueChange={(val: any) => setFilterCurrency(val)} className="flex gap-6 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ALL" id="all" className="border-white" />
                    <Label htmlFor="all" className="text-xs font-bold text-white">{t(dictionary.all)}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USD" id="usd" className="border-white" />
                    <Label htmlFor="usd" className="text-xs font-bold text-white">USD ($)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="UZS" id="uzs" className="border-white" />
                    <Label htmlFor="uzs" className="text-xs font-bold text-white">UZS (so'm)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-white uppercase tracking-widest">{t(dictionary.priceRange)} ({filterCurrency === 'ALL' ? '-' : filterCurrency})</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    disabled={filterCurrency === 'ALL'}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white text-sm font-bold placeholder:text-white/20"
                  />
                  <div className="w-4 h-0.5 bg-white/10" />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    disabled={filterCurrency === 'ALL'}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white text-sm font-bold placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-white uppercase tracking-widest">{t(dictionary.sortLabel)}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3 h-3 neon-text" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-dark border-white/10 text-white">
                    <SelectItem value="newest" className="font-bold">{t(dictionary.newest)}</SelectItem>
                    <SelectItem value="price_asc" className="font-bold">{t(dictionary.priceAsc)}</SelectItem>
                    <SelectItem value="price_desc" className="font-bold">{t(dictionary.priceDesc)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {looksLoading ? (
        <div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin neon-text" /></div>
      ) : (
        <div className={cn("pb-32 gap-6", viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col")}>
          {filteredAndSortedLooks.map((look) => {
            const isLiked = likedLookIds.has(look.id);
            return (
              <div key={look.id} className="relative group">
                <Link href={`/looks/${look.id}`}>
                  <Card className={cn(
                    "bg-[#080808]/40 border border-white/5 overflow-hidden transition-all hover:border-white/20 active:scale-[0.98]",
                    viewMode === 'grid' ? "rounded-[2rem]" : "rounded-[2.5rem] flex flex-col sm:flex-row items-center p-4 gap-6"
                  )}>
                    <div className={cn("relative overflow-hidden p-1", viewMode === 'grid' ? "aspect-[4/5] w-full" : "aspect-[4/5] w-full sm:w-48 shrink-0")}>
                      <Image
                        src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                        alt={look.name || 'Look'}
                        fill
                        className={cn("object-cover transition-transform duration-700 group-hover:scale-105", viewMode === 'grid' ? "rounded-[1.8rem]" : "rounded-[2rem]")}
                      />
                      <button 
                        onClick={(e) => handleToggleLike(e, look.id)}
                        className={cn(
                          "absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border flex items-center justify-center transition-all z-10",
                          isLiked ? "neon-border neon-text bg-primary/10 shadow-[0_0_15px_rgba(var(--sync-color),0.2)]" : "border-white/10 text-white hover:neon-text hover:neon-border"
                        )}
                      >
                        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                      </button>
                    </div>

                    <div className={cn("space-y-2", viewMode === 'grid' ? "p-4" : "p-2 flex-grow")}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black neon-text italic tracking-tighter">
                            {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${formatPrice(look.price)}`}
                          </span>
                          <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                        </div>
                        <h3 className="text-sm font-bold text-white truncate uppercase tracking-tight">{look.name}</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}

          {filteredAndSortedLooks.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Filter className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white uppercase font-black italic tracking-widest">{t(dictionary.nothingFound)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
