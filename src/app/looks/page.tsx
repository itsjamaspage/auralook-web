
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
import { Loader2, Heart, Filter, Grid2x2, List, CheckCircle2, X, ArrowUpDown, ShoppingCart, CheckSquare, Square, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export default function LooksPage() {
  const db = useFirestore();
  const { user: tgUser, isVerified } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary, lang } = useLanguage();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | 'USD' | 'UZS'>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-selection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedLookIds, setSelectedLookIds] = useState<Set<string>>(new Set());

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    // SECURITY: Align with firebaseUid doc path
    if (isUserLoading || !firebaseUser || !tgUser || !isVerified) {
      return null;
    }
    return collection(db, 'users', firebaseUser.uid, 'liked_looks');
  }, [db, tgUser, firebaseUser, isUserLoading, isVerified]);
  
  const { data: likedLooksData } = useCollection(likedLooksQuery ?? undefined);
  const likedLookIds = useMemo(() => new Set(likedLooksData?.map(l => l.lookId) || []), [likedLooksData]);

  const filteredAndSortedLooks = useMemo(() => {
    if (!looks) return [];

    let result = looks.filter(look => {
      // 1. Search Query Filter
      const lookName = typeof look.name === 'string' ? look.name : '';
      const lookDesc = look.description || '';
      const search = searchQuery.toLowerCase();
      
      if (search && !lookName.toLowerCase().includes(search) && !lookDesc.toLowerCase().includes(search)) {
        return false;
      }

      // 2. Currency Filter
      const matchesCurrency = filterCurrency === 'ALL' || look.currency === filterCurrency;
      if (!matchesCurrency) return false;

      // 3. Price Filter
      const price = Number(look.price || 0);
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;

      if (filterCurrency !== 'ALL') {
        if (price < min || price > max) return false;
      }
      
      return true;
    });

    // 4. Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [looks, filterCurrency, minPrice, maxPrice, sortBy, searchQuery]);

  const formatPrice = (val: any) => {
    const num = Number(val || 0);
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
  };

  const handleToggleLike = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isVerified || !tgUser || !firebaseUser) {
      toast({ title: t(dictionary.syncing), variant: "destructive" });
      return;
    }

    const likedLookRef = doc(db, 'users', firebaseUser.uid, 'liked_looks', lookId);
    try {
      if (likedLookIds.has(lookId)) {
        await deleteDoc(likedLookRef);
      } else {
        await setDoc(likedLookRef, { lookId, createdAt: new Date().toISOString() });
      }
    } catch (e) { console.error(e); }
  };

  const handleToggleCart = async (e: React.MouseEvent, look: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isVerified || !tgUser || !firebaseUser) {
      toast({ title: t(dictionary.syncing), variant: "destructive" });
      return;
    }

    try {
      const cartItemRef = doc(db, 'users', firebaseUser.uid, 'cart', look.id);
      await setDoc(cartItemRef, {
        lookId: look.id,
        name: look.name,
        imageUrl: look.imageUrl,
        price: look.price,
        currency: look.currency || 'USD',
        addedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({ title: t(dictionary.addedToCart), description: typeof look.name === 'string' ? look.name : '' });
    } catch (e) { console.error(e); }
  };

  const handleToggleSelection = (lookId: string) => {
    const newSelected = new Set(selectedLookIds);
    if (newSelected.has(lookId)) newSelected.delete(lookId);
    else newSelected.add(lookId);
    setSelectedLookIds(newSelected);
  };

  const handleAddSelectedToCart = async () => {
    if (!isVerified || !tgUser || !firebaseUser) return;
    
    const itemsToAdd = looks?.filter(l => selectedLookIds.has(l.id)) || [];
    
    for (const look of itemsToAdd) {
      const cartItemRef = doc(db, 'users', firebaseUser.uid, 'cart', look.id);
      await setDoc(cartItemRef, {
        lookId: look.id,
        name: look.name,
        imageUrl: look.imageUrl,
        price: look.price,
        currency: look.currency || 'USD',
        addedAt: new Date().toISOString()
      }, { merge: true });
    }

    toast({ title: t(dictionary.addedToCart), description: `${selectedLookIds.size} ta element` });
    setSelectedLookIds(new Set());
    setIsSelectMode(false);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen relative">
      <div className="space-y-6">
        {/* Search & Global Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-foreground/40 group-focus-within:neon-text transition-colors" />
            </div>
            <Input 
              placeholder={t(dictionary.searchPlaceholder)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border-border h-14 rounded-2xl pl-12 pr-12 focus:neon-border text-foreground font-medium shadow-xl transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-4 flex items-center text-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className={cn(
                "h-14 px-6 rounded-2xl border-border glass-surface text-foreground hover:neon-border hover:neon-text transition-all font-bold shadow-xl shrink-0",
                showFilters && "neon-border neon-text"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t(dictionary.filter)}
            </Button>
            <Button 
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedLookIds(new Set());
              }} 
              variant="outline" 
              className={cn(
                "h-14 px-6 rounded-2xl border-border glass-surface text-foreground hover:neon-border hover:neon-text transition-all font-bold shadow-xl shrink-0",
                isSelectMode && "neon-border neon-text"
              )}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {t(dictionary.selectMultiple)}
            </Button>
            <div className="hidden sm:flex gap-2 ml-2">
              <Button 
                onClick={() => setViewMode('grid')} 
                variant="ghost" 
                className={cn("h-14 w-14 rounded-2xl transition-all shadow-xl", viewMode === 'grid' ? "neon-bg text-black" : "glass-surface text-foreground/40 border border-border")}
              >
                <Grid2x2 className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => setViewMode('list')} 
                variant="ghost" 
                className={cn("h-14 w-14 rounded-2xl transition-all shadow-xl", viewMode === 'list' ? "neon-bg text-black" : "glass-surface text-foreground/40 border border-border")}
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <Card className="glass-surface border-border rounded-[2.5rem] p-8 space-y-10 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">{t(dictionary.filterParameters)}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="text-foreground hover:text-primary">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{t(dictionary.currencyUnit)}</Label>
                <RadioGroup value={filterCurrency} onValueChange={(val: any) => setFilterCurrency(val)} className="flex gap-6 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ALL" id="all" />
                    <Label htmlFor="all" className="text-xs font-bold text-foreground">{t(dictionary.all)}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="USD" id="usd" />
                    <Label htmlFor="usd" className="text-xs font-bold text-foreground">USD ($)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="UZS" id="uzs" />
                    <Label htmlFor="uzs" className="text-xs font-bold text-foreground">UZS (so'm)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{t(dictionary.priceRange)} ({filterCurrency === 'ALL' ? '-' : filterCurrency})</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    disabled={filterCurrency === 'ALL'}
                    className="bg-background border-border h-12 rounded-xl focus:neon-border text-foreground text-sm font-bold placeholder:text-foreground/20"
                  />
                  <div className="w-4 h-0.5 bg-foreground/10" />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    disabled={filterCurrency === 'ALL'}
                    className="bg-background border-border h-12 rounded-xl focus:neon-border text-foreground text-sm font-bold placeholder:text-foreground/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{t(dictionary.sortLabel)}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background border-border h-12 rounded-xl focus:neon-border text-foreground text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3 h-3 neon-text" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-border">
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
        <div className={cn("pb-48 gap-6", viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col")}>
          {filteredAndSortedLooks.map((look) => {
            const isLiked = likedLookIds.has(look.id);
            const isSelected = selectedLookIds.has(look.id);
            const lookNameDisplay = typeof look.name === 'string' ? look.name : 'Unnamed Look';
            
            return (
              <div key={look.id} className="relative group">
                <div onClick={() => isSelectMode && handleToggleSelection(look.id)} className={isSelectMode ? "cursor-pointer" : ""}>
                  <Card className={cn(
                    "bg-card border border-border overflow-hidden transition-all shadow-lg hover:shadow-2xl relative",
                    isSelected ? "neon-border" : "hover:border-primary/20",
                    viewMode === 'grid' ? "rounded-[2rem]" : "rounded-[2.5rem] flex flex-col sm:flex-row items-center p-4 gap-6"
                  )}>
                    {isSelectMode && (
                      <div className="absolute top-4 left-4 z-20">
                        {isSelected ? <CheckSquare className="w-6 h-6 neon-text" /> : <Square className="w-6 h-6 text-foreground/40" />}
                      </div>
                    )}

                    <div className={cn("relative overflow-hidden p-1", viewMode === 'grid' ? "aspect-[4/5] w-full" : "aspect-[4/5] w-full sm:w-48 shrink-0")}>
                      <Link href={isSelectMode ? '#' : `/looks/${look.id}`} onClick={(e) => isSelectMode && e.preventDefault()}>
                        <Image
                          src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'}
                          alt={lookNameDisplay}
                          fill
                          className={cn("object-cover transition-transform duration-700 group-hover:scale-105", viewMode === 'grid' ? "rounded-[1.8rem]" : "rounded-[2rem]")}
                        />
                      </Link>
                      
                      {!isSelectMode && (
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                          <button 
                            onClick={(e) => handleToggleLike(e, look.id)}
                            className={cn(
                              "w-10 h-10 rounded-full glass-surface border flex items-center justify-center transition-all",
                              isLiked ? "neon-border neon-text bg-foreground/10" : "border-foreground/10 text-foreground hover:neon-text hover:neon-border"
                            )}
                          >
                            <Heart className={cn("w-5 h-5", isLiked ? "neon-text fill-current" : "text-foreground")} />
                          </button>
                          <button 
                            onClick={(e) => handleToggleCart(e, look)}
                            className="w-10 h-10 rounded-full glass-surface border border-foreground/10 text-foreground hover:neon-text hover:neon-border flex items-center justify-center transition-all"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={cn("space-y-2", viewMode === 'grid' ? "p-4" : "p-2 flex-grow")}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black neon-text italic tracking-tighter">
                            {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${formatPrice(look.price)}`}
                          </span>
                          <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight italic">{lookNameDisplay}</h3>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}

          {filteredAndSortedLooks.length === 0 && (
            <div className="col-span-full py-32 text-center">
              <Filter className="w-12 h-12 text-foreground/10 mx-auto mb-4" />
              <p className="text-foreground/60 uppercase font-black italic tracking-widest">{t(dictionary.nothingFound)}</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar for Multiple Selection */}
      {selectedLookIds.size > 0 && (
        <div className="fixed bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
          <Card className="neon-border glass-surface rounded-2xl p-4 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 neon-bg rounded-xl flex items-center justify-center text-black font-black">
                {selectedLookIds.size}
              </div>
              <p className="text-xs font-black uppercase text-foreground">{t(dictionary.itemsSelected)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedLookIds(new Set())} className="text-foreground/60 hover:text-foreground">
                <X className="w-4 h-4 mr-2" />
                {t(dictionary.cancel)}
              </Button>
              <Button onClick={handleAddSelectedToCart} className="neon-bg text-black font-black px-6 rounded-xl h-12">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t(dictionary.addToCart)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
