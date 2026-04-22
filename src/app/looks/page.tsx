
"use client"

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
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
import { Loader2, Heart, Filter, CheckCircle2, X, ArrowUpDown, ShoppingCart, CheckSquare, Square, Search, LayoutGrid, AlignJustify, ChevronRight, ArrowRight, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion-reveal';

export default function LooksPage() {
  const db = useFirestore();
  const { user: tgUser, isVerified } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();

  const [showFilters, setShowFilters] = useState(false);
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | 'USD' | 'UZS'>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedLookIds, setSelectedLookIds] = useState<Set<string>>(new Set());

  const [animatingLikeId, setAnimatingLikeId] = useState<string | null>(null);
  const [animatingCartId, setAnimatingCartId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    if (isUserLoading || !tgUser || !firebaseUser || !isVerified) return null;
    return collection(db, 'users', tgUser.id, 'liked_looks');
  }, [db, tgUser, firebaseUser, isUserLoading, isVerified]);

  const { data: likedLooksData } = useCollection(likedLooksQuery ?? undefined);
  const likedLookIds = useMemo(() => new Set(likedLooksData?.map(l => l.lookId) || []), [likedLooksData]);

  const cartItemsQuery = useMemoFirebase(() => {
    if (isUserLoading || !tgUser || !firebaseUser || !isVerified) return null;
    return collection(db, 'users', tgUser.id, 'cart');
  }, [db, tgUser, firebaseUser, isUserLoading, isVerified]);
  const { data: cartItemsData } = useCollection(cartItemsQuery ?? undefined);
  const cartLookIds = useMemo(() => new Set(cartItemsData?.map(item => item.lookId) || []), [cartItemsData]);

  const filteredAndSortedLooks = useMemo(() => {
    if (!looks) return [];

    let result = looks.filter(look => {
      const lookName = typeof look.name === 'string' ? look.name : '';
      const search = searchQuery.toLowerCase();
      if (search && !lookName.toLowerCase().includes(search)) return false;

      const matchesCurrency = filterCurrency === 'ALL' || look.currency === filterCurrency;
      if (!matchesCurrency) return false;

      const price = Number(look.price || 0);
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      if (filterCurrency !== 'ALL' && (price < min || price > max)) return false;

      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [looks, filterCurrency, minPrice, maxPrice, sortBy, searchQuery]);

  const formatPrice = (val: any) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
  };

  const handleToggleLike = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!isVerified || !tgUser) return;

    setAnimatingLikeId(lookId);
    setTimeout(() => setAnimatingLikeId(null), 800);

    const likedLookRef = doc(db, 'users', tgUser.id, 'liked_looks', lookId);
    if (likedLookIds.has(lookId)) {
      await deleteDoc(likedLookRef);
    } else {
      await setDoc(likedLookRef, { lookId, createdAt: new Date().toISOString() });
    }
  };

  const handleToggleCart = async (e: React.MouseEvent, look: any) => {
    e.preventDefault(); e.stopPropagation();
    if (!isVerified || !tgUser) return;

    const isInCart = cartLookIds.has(look.id);
    setAnimatingCartId(look.id);
    setTimeout(() => animatingCartId && setAnimatingCartId(null), 800);

    const cartItemRef = doc(db, 'users', tgUser.id, 'cart', look.id);
    if (isInCart) {
      await deleteDoc(cartItemRef);
    } else {
      await setDoc(cartItemRef, {
        lookId: look.id, name: look.name, imageUrl: look.imageUrl, price: look.price, currency: look.currency || 'USD', addedAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-12">

        {/* Editorial section label */}
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-foreground/30 mb-4">
          —— {t(dictionary.browseLooks)}
        </p>

        {/* Search + view toggle row */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-foreground/40" />
            </div>
            <Input
              placeholder={t(dictionary.searchPlaceholder)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-secondary/40 border-transparent h-12 rounded-2xl pl-11 pr-4 text-foreground text-base font-medium focus:neon-border focus:bg-background transition-all"
            />
          </div>

          {/* filter button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-2xl bg-secondary/40 border-transparent shrink-0 transition-all touch-manipulation",
              showFilters && "neon-border neon-text"
            )}
          >
            <Filter className="w-4 h-4" />
          </Button>

          {/* view mode toggle */}
          <div className="flex bg-secondary/40 rounded-2xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "w-11 h-10 rounded-xl flex items-center justify-center transition-all touch-manipulation",
                viewMode === 'list' ? "neon-bg" : "text-foreground/40"
              )}
            >
              <AlignJustify className={cn("w-4 h-4", viewMode === 'list' ? "text-white" : "")} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "w-11 h-10 rounded-xl flex items-center justify-center transition-all touch-manipulation",
                viewMode === 'grid' ? "neon-bg" : "text-foreground/40"
              )}
            >
              <LayoutGrid className={cn("w-4 h-4", viewMode === 'grid' ? "text-white" : "")} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
          <div className="bg-secondary/30 rounded-[1.5rem] p-5 space-y-5 border border-foreground/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t(dictionary.filter)}</span>
              <button onClick={() => setShowFilters(false)} className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-foreground/40" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">{t(dictionary.currencyUnit)}</Label>
                <RadioGroup value={filterCurrency} onValueChange={(val: any) => setFilterCurrency(val)} className="flex gap-4">
                  {['ALL', 'USD', 'UZS'].map(curr => (
                    <div key={curr} className="flex items-center space-x-1.5">
                      <RadioGroupItem value={curr} id={curr} />
                      <Label htmlFor={curr} className="text-xs font-bold text-foreground cursor-pointer">{curr === 'ALL' ? t(dictionary.all) : curr}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">{t(dictionary.sortLabel)}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background border-border h-10 rounded-xl text-foreground text-sm font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="newest">{t(dictionary.newest)}</SelectItem>
                    <SelectItem value="price_asc">{t(dictionary.priceAsc)}</SelectItem>
                    <SelectItem value="price_desc">{t(dictionary.priceDesc)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Items count + select mode */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
            {filteredAndSortedLooks.length} {t(dictionary.newArrivals).toLowerCase()}
          </p>
          <button
            onClick={() => setIsSelectMode(!isSelectMode)}
            className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
              isSelectMode ? "neon-text" : "text-foreground/40"
            )}
          >
            {isSelectMode ? t(dictionary.cancel) : t(dictionary.selectMultiple)}
          </button>
        </div>

        {/* Looks list / grid */}
        {looksLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin neon-text" />
          </div>
        ) : viewMode === 'list' ? (
          /* ── HORIZONTAL LIST VIEW ── */
          <StaggerContainer className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {filteredAndSortedLooks.map((look, index) => (
              <StaggerItem key={look.id} className="relative">
                <Link
                  href={isSelectMode ? '#' : `/looks/${look.id}`}
                  className="group flex gap-4 bg-secondary/30 rounded-[1.5rem] p-3 hover:bg-secondary/50 transition-all border border-transparent hover:border-foreground/5"
                  onClick={isSelectMode ? (e) => {
                    e.preventDefault();
                    const newSet = new Set(selectedLookIds);
                    if (newSet.has(look.id)) newSet.delete(look.id); else newSet.add(look.id);
                    setSelectedLookIds(newSet);
                  } : undefined}
                >
                  {/* select checkbox */}
                  {isSelectMode && (
                    <div className="absolute top-3 left-3 z-20">
                      {selectedLookIds.has(look.id)
                        ? <CheckSquare className="w-5 h-5 neon-text" />
                        : <Square className="w-5 h-5 text-foreground/40" />}
                    </div>
                  )}

                  {/* Outfit image — square, rounded */}
                  <div className="relative w-[100px] h-[120px] xs:w-[110px] xs:h-[130px] md:w-[140px] md:h-[170px] rounded-[1.1rem] overflow-hidden shrink-0 bg-foreground/5">
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/look/300/400'}
                      alt={look.name}
                      fill
                      quality={90}
                      sizes="110px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* price badge overlaid on image */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full neon-bg text-white text-[10px] font-black shadow-lg">
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${look.price}`}
                    </div>
                  </div>

                  {/* Right-side info */}
                  <div className="flex-grow flex flex-col justify-between py-1 min-w-0">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-mono text-foreground/25">#{String(index + 1).padStart(3, '0')}</p>
                      <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight truncate">
                        {look.name}
                      </h3>
                      {look.description && (
                        <p className="text-xs text-foreground/50 font-medium leading-relaxed line-clamp-2">
                          {look.description}
                        </p>
                      )}
                      {look.ratingCount > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <Star className="w-2.5 h-2.5 fill-current neon-text" />
                          <span className="text-[9px] font-bold text-foreground/50">
                            {(look.ratingSum / look.ratingCount).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {!isSelectMode && (
                      <div className="flex items-center gap-2 mt-2">
                        {/* Like button */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleToggleLike(e, look.id)}
                            className={cn(
                              "w-11 h-11 rounded-full border flex items-center justify-center transition-all touch-manipulation",
                              likedLookIds.has(look.id)
                                ? "neon-border neon-text bg-foreground/5"
                                : "border-foreground/10 text-foreground/40 hover:border-foreground/30"
                            )}
                          >
                            <Heart className={cn("w-4 h-4", likedLookIds.has(look.id) && "fill-current")} />
                          </button>
                          {animatingLikeId === look.id && !likedLookIds.has(look.id) && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 neon-text font-black italic text-base animate-float-up">+1</span>
                          )}
                        </div>

                        {/* Cart button */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleToggleCart(e, look)}
                            className={cn(
                              "w-11 h-11 rounded-full border flex items-center justify-center transition-all touch-manipulation",
                              cartLookIds.has(look.id)
                                ? "neon-border neon-text bg-foreground/5"
                                : "border-foreground/10 text-foreground/40 hover:border-foreground/30"
                            )}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          {animatingCartId === look.id && !cartLookIds.has(look.id) && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 neon-text font-black italic text-base animate-float-up">+1</span>
                          )}
                        </div>

                        {/* View detail arrow */}
                        <div className="ml-auto w-11 h-11 rounded-full neon-bg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          /* ── GRID VIEW ── */
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {filteredAndSortedLooks.map((look, index) => (
              <StaggerItem key={look.id} className="relative group">
                <div className={cn(
                  "bg-secondary/30 rounded-[1.5rem] overflow-hidden border border-transparent transition-all",
                  selectedLookIds.has(look.id) && "neon-border"
                )}>
                  {isSelectMode && (
                    <button
                      onClick={() => {
                        const newSet = new Set(selectedLookIds);
                        if (newSet.has(look.id)) newSet.delete(look.id); else newSet.add(look.id);
                        setSelectedLookIds(newSet);
                      }}
                      className="absolute top-3 left-3 z-20"
                    >
                      {selectedLookIds.has(look.id)
                        ? <CheckSquare className="w-5 h-5 neon-text" />
                        : <Square className="w-5 h-5 text-white drop-shadow" />}
                    </button>
                  )}

                  <Link href={isSelectMode ? '#' : `/looks/${look.id}`} className="block relative aspect-[3/4] overflow-hidden rounded-t-[1.5rem]">
                    <Image
                      src={look.imageUrl || 'https://picsum.photos/seed/look/600/800'}
                      alt={look.name}
                      fill
                      quality={90}
                      sizes="(max-width: 672px) 50vw, 336px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {!isSelectMode && (
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        <div className="relative">
                          <button
                            onClick={(e) => handleToggleLike(e, look.id)}
                            className={cn(
                              "w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center transition-all",
                              likedLookIds.has(look.id) ? "neon-border neon-text" : "border-foreground/10 text-foreground"
                            )}
                          >
                            <Heart className={cn("w-4 h-4", likedLookIds.has(look.id) && "fill-current")} />
                          </button>
                          {animatingLikeId === look.id && !likedLookIds.has(look.id) && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 neon-text font-black italic text-base animate-float-up">+1</span>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => handleToggleCart(e, look)}
                            className={cn(
                              "w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm border flex items-center justify-center transition-all",
                              cartLookIds.has(look.id) ? "neon-border neon-text" : "border-foreground/10 text-foreground"
                            )}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          {animatingCartId === look.id && !cartLookIds.has(look.id) && (
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 neon-text font-black italic text-base animate-float-up">+1</span>
                          )}
                        </div>
                      </div>
                    )}
                  </Link>

                  <div className="p-3 space-y-0.5">
                    <p className="text-[9px] font-mono text-foreground/25">#{String(index + 1).padStart(3, '0')}</p>
                    <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{look.name}</h3>
                    <p className="text-sm font-black neon-text">
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${look.price}`}
                    </p>
                    {look.ratingCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current neon-text" />
                        <span className="text-[9px] font-bold text-foreground/50">
                          {(look.ratingSum / look.ratingCount).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Bulk add to cart bar */}
        {selectedLookIds.size > 0 && tgUser && (
          <div className="fixed bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 max-w-7xl mx-auto">
            <div className="neon-border bg-background/95 backdrop-blur-2xl rounded-2xl p-4 flex items-center justify-between shadow-2xl border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 neon-bg rounded-xl flex items-center justify-center text-white font-black text-sm">{selectedLookIds.size}</div>
                <p className="text-xs font-black uppercase text-foreground">{t(dictionary.itemsSelected)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSelectedLookIds(new Set())} className="text-foreground/60 h-9 px-3 text-xs">{t(dictionary.cancel)}</Button>
                <Button
                  onClick={async () => {
                    for (const id of Array.from(selectedLookIds)) {
                      const look = looks?.find(l => l.id === id);
                      if (look && !cartLookIds.has(id)) {
                        await setDoc(doc(db, 'users', tgUser.id, 'cart', id), {
                          lookId: id, name: look.name, imageUrl: look.imageUrl, price: look.price, currency: look.currency || 'USD', addedAt: new Date().toISOString()
                        });
                      }
                    }
                    setSelectedLookIds(new Set()); setIsSelectMode(false);
                  }}
                  className="neon-bg text-white font-black px-4 rounded-xl h-9 text-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> {t(dictionary.addToCart)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
