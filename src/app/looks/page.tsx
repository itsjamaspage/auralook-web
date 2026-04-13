
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
import { Loader2, Heart, Filter, CheckCircle2, X, ArrowUpDown, ShoppingCart, CheckSquare, Square, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTelegramUser } from '@/hooks/use-telegram-user';

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
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen relative pb-48">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-foreground/40 group-focus-within:neon-text" />
          </div>
          <Input 
            placeholder={t(dictionary.searchPlaceholder)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background border-border h-14 rounded-2xl pl-12 pr-12 focus:neon-border text-foreground font-medium shadow-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className={cn("h-14 px-6 rounded-2xl glass-surface text-foreground font-bold", showFilters && "neon-border neon-text")}>
            <Filter className="w-4 h-4 mr-2" /> {t(dictionary.filter)}
          </Button>
          <Button onClick={() => setIsSelectMode(!isSelectMode)} variant="outline" className={cn("h-14 px-6 rounded-2xl glass-surface text-foreground font-bold", isSelectMode && "neon-border neon-text")}>
            <CheckSquare className="w-4 h-4 mr-2" /> {t(dictionary.selectMultiple)}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="glass-surface border-border rounded-[2.5rem] p-8 space-y-10 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{t(dictionary.currencyUnit)}</Label>
              <RadioGroup value={filterCurrency} onValueChange={(val: any) => setFilterCurrency(val)} className="flex gap-6">
                {['ALL', 'USD', 'UZS'].map(curr => (
                  <div key={curr} className="flex items-center space-x-2">
                    <RadioGroupItem value={curr} id={curr} />
                    <Label htmlFor={curr} className="text-xs font-bold text-foreground">{curr === 'ALL' ? t(dictionary.all) : curr}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{t(dictionary.sortLabel)}</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background border-border h-12 rounded-xl focus:neon-border text-foreground font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-surface border-border">
                  <SelectItem value="newest">{t(dictionary.newest)}</SelectItem>
                  <SelectItem value="price_asc">{t(dictionary.priceAsc)}</SelectItem>
                  <SelectItem value="price_desc">{t(dictionary.priceDesc)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {looksLoading ? (
        <div className="flex justify-center p-32"><Loader2 className="w-10 h-10 animate-spin neon-text" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedLooks.map((look) => (
            <div key={look.id} className="relative group">
              <Card className={cn("bg-card border border-border overflow-hidden transition-all shadow-lg rounded-[2rem] relative", selectedLookIds.has(look.id) && "neon-border")}>
                {isSelectMode && (
                  <button onClick={() => {
                    const newSet = new Set(selectedLookIds);
                    if (newSet.has(look.id)) newSet.delete(look.id); else newSet.add(look.id);
                    setSelectedLookIds(newSet);
                  }} className="absolute top-4 left-4 z-20">
                    {selectedLookIds.has(look.id) ? <CheckSquare className="w-6 h-6 neon-text" /> : <Square className="w-6 h-6 text-foreground/40" />}
                  </button>
                )}
                <Link href={isSelectMode ? '#' : `/looks/${look.id}`} className="block relative aspect-[4/5] overflow-hidden p-1">
                  <Image src={look.imageUrl || 'https://picsum.photos/seed/look/600/800'} alt={look.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105 rounded-[1.8rem]" />
                  {!isSelectMode && (
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                      <div className="relative">
                        <button onClick={(e) => handleToggleLike(e, look.id)} className={cn("w-10 h-10 rounded-full glass-surface border flex items-center justify-center transition-all", likedLookIds.has(look.id) ? "neon-border neon-text bg-foreground/10" : "border-foreground/10 text-foreground")}>
                          <Heart className={cn("w-5 h-5", likedLookIds.has(look.id) && "fill-current")} />
                        </button>
                        {animatingLikeId === look.id && !likedLookIds.has(look.id) && <span className="absolute -top-10 left-1/2 -translate-x-1/2 neon-text font-black italic text-xl animate-float-up">+1</span>}
                      </div>
                      <div className="relative">
                        <button onClick={(e) => handleToggleCart(e, look)} className={cn("w-10 h-10 rounded-full glass-surface border flex items-center justify-center transition-all", cartLookIds.has(look.id) ? "neon-border neon-text bg-foreground/10" : "border-foreground/10 text-foreground")}>
                          <ShoppingCart className="w-5 h-5" />
                        </button>
                        {animatingCartId === look.id && !cartLookIds.has(look.id) && <span className="absolute -top-10 left-1/2 -translate-x-1/2 neon-text font-black italic text-xl animate-float-up">+1</span>}
                      </div>
                    </div>
                  )}
                </Link>
                <div className="p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black neon-text italic tracking-tighter">{look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${look.price}`}</span>
                    <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-500/20" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight italic">{look.name}</h3>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selectedLookIds.size > 0 && tgUser && (
        <div className="fixed bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-10">
          <Card className="neon-border glass-surface rounded-2xl p-4 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 neon-bg rounded-xl flex items-center justify-center text-black font-black">{selectedLookIds.size}</div>
              <p className="text-xs font-black uppercase text-foreground">{t(dictionary.itemsSelected)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelectedLookIds(new Set())} className="text-foreground/60">{t(dictionary.cancel)}</Button>
              <Button onClick={async () => {
                for (const id of Array.from(selectedLookIds)) {
                  const look = looks?.find(l => l.id === id);
                  if (look && !cartLookIds.has(id)) {
                    await setDoc(doc(db, 'users', tgUser.id, 'cart', id), {
                      lookId: id, name: look.name, imageUrl: look.imageUrl, price: look.price, currency: look.currency || 'USD', addedAt: new Date().toISOString()
                    });
                  }
                }
                setSelectedLookIds(new Set()); setIsSelectMode(false);
              }} className="neon-bg text-black font-black px-6 rounded-xl">
                <ShoppingCart className="w-4 h-4 mr-2" /> {t(dictionary.addToCart)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
