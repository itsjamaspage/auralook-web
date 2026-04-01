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
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Heart, Filter, Grid2X2, List, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LooksPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [filterCurrency, setFilterCurrency] = useState<'USD' | 'UZS'>('USD');
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'users', user.uid, 'liked_looks');
  }, [db, user]);
  
  const { data: likedLooksData } = useCollection(likedLooksQuery);
  const likedLookIds = useMemo(() => new Set(likedLooksData?.map(l => l.lookId) || []), [likedLooksData]);

  const filteredLooks = useMemo(() => {
    return looks?.filter(look => {
      const matchesCurrency = look.currency === filterCurrency;
      const matchesPrice = look.price >= priceRange[0] && look.price <= priceRange[1];
      return matchesCurrency && matchesPrice;
    });
  }, [looks, filterCurrency, priceRange]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

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
      const isLiked = likedLookIds.has(lookId);
      if (isLiked) {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className={cn(
                "h-12 px-6 rounded-2xl border-white/10 text-white/60 hover:neon-border hover:neon-text transition-all",
                showFilters && "neon-border neon-text"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            <div className="hidden sm:flex items-baseline gap-2">
              <span className="text-xl font-black text-white italic">{filteredLooks?.length || 0}</span>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Listings Detected</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => setViewMode('grid')} 
              variant="ghost" 
              className={cn(
                "h-12 w-12 rounded-2xl transition-all",
                viewMode === 'grid' ? "neon-bg text-black" : "bg-white/5 text-white/40"
              )}
            >
              <Grid2X2 className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => setViewMode('list')} 
              variant="ghost" 
              className={cn(
                "h-12 w-12 rounded-2xl transition-all",
                viewMode === 'list' ? "neon-bg text-black" : "bg-white/5 text-white/40"
              )}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="glass-dark border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">{t(dictionary.filterParameters)}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t(dictionary.currencyUnit)}</Label>
                <RadioGroup 
                  value={filterCurrency} 
                  onValueChange={(val: any) => {
                    setFilterCurrency(val);
                    if (val === 'USD') setPriceRange([0, 5000]);
                    else setPriceRange([0, 50000000]);
                  }} 
                  className="flex gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USD" id="usd" className="transition-none" />
                    <Label htmlFor="usd" className="text-xs font-bold text-white/80">USD ($)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="UZS" id="uzs" className="transition-none" />
                    <Label htmlFor="uzs" className="text-xs font-bold text-white/80">UZS (so'm)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t(dictionary.priceRange)}</Label>
                  <span className="text-xs font-black neon-text italic">
                    {filterCurrency === 'USD' ? '$' : ''}{formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}{filterCurrency === 'UZS' ? ' UZS' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-white/40">{t(dictionary.minPrice)}</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={priceRange[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceRange([val, priceRange[1]]);
                      }}
                      className="bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:neon-border text-white transition-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold uppercase text-white/40">{t(dictionary.maxPrice)}</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={priceRange[1] || ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPriceRange([priceRange[0], val]);
                      }}
                      className="bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:neon-border text-white transition-none"
                    />
                  </div>
                </div>

                <Slider 
                  value={priceRange} 
                  onValueChange={setPriceRange} 
                  max={filterCurrency === 'USD' ? 5000 : 50000000} 
                  step={filterCurrency === 'USD' ? 10 : 100000}
                  className="py-4"
                />
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className={cn(
        "pb-32 gap-6",
        viewMode === 'grid' 
          ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
          : "flex flex-col"
      )}>
        {filteredLooks?.map((look) => {
          const isLiked = likedLookIds.has(look.id);
          
          return (
            <div key={look.id} className="relative group">
              <Link href={`/looks/${look.id}`} onClick={() => setNavigatingId(look.id)}>
                <Card className={cn(
                  "bg-[#080808]/40 border border-white/5 overflow-hidden transition-all hover:border-white/20",
                  viewMode === 'grid' ? "rounded-[2rem]" : "rounded-[2.5rem] flex flex-col sm:flex-row items-center p-4 gap-6"
                )}>
                  <div className={cn(
                    "relative overflow-hidden p-1",
                    viewMode === 'grid' ? "aspect-[4/5] w-full" : "aspect-[4/5] w-full sm:w-48 shrink-0"
                  )}>
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                      alt={look.name || 'Look'}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-700 group-hover:scale-105",
                        viewMode === 'grid' ? "rounded-[1.8rem]" : "rounded-[2rem]"
                      )}
                    />
                    
                    <button 
                      onClick={(e) => handleToggleLike(e, look.id)}
                      className={cn(
                        "absolute top-4 right-4 w-10 h-10 rounded-full glass-dark border flex items-center justify-center transition-all z-10",
                        isLiked 
                          ? "neon-border neon-text bg-primary/10" 
                          : "border-white/10 text-white/60 hover:neon-text hover:neon-border"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                    </button>

                    {navigatingId === look.id && (
                      <div className="absolute inset-0 flex items-center justify-center glass-dark z-20">
                        <Loader2 className="w-8 h-8 animate-spin neon-text" />
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "space-y-2",
                    viewMode === 'grid' ? "p-4" : "p-2 flex-grow"
                  )}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black neon-text italic tracking-tighter">
                          {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${formatPrice(look.price)}`}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                      </div>
                      <h3 className="text-sm font-bold text-white truncate uppercase tracking-tight">{look.name}</h3>
                    </div>

                    {viewMode === 'list' && (
                      <p className="text-xs text-white/40 line-clamp-2 italic font-medium">
                        {look.description}
                      </p>
                    )}

                    <div className="flex flex-col gap-0.5 pt-1">
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Tashkent, Mirzo Ulugbek</p>
                      <p className="text-[9px] font-mono text-white/20 uppercase">Available Now</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}

        {(!filteredLooks || filteredLooks.length === 0) && (
          <div className="col-span-full py-32 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Filter className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] italic">
              No results match your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
