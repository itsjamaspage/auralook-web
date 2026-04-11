
"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send, ArrowUpRight, Sparkles, Loader2, Info, LayoutGrid, Square } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t, dictionary, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isDeepLinking, setIsDeepLinking] = useState(false);
  const [featuredViewMode, setFeaturedViewMode] = useState<'grid' | 'single'>('grid');
  const router = useRouter();
  const db = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    // Increase limit if single mode to allow browsing more
    const count = featuredViewMode === 'grid' ? 3 : 10;
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'), limit(count));
  }, [db, featuredViewMode]);

  const { data: featuredLooks, isLoading } = useCollection(featuredQuery);

  useEffect(() => {
    setMounted(true);
    
    // PROTOCOL: Start-app Parameter Handling (Deep Linking)
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const startParam = tg.initDataUnsafe?.start_param;
      if (startParam && startParam.startsWith('product_')) {
        const productId = startParam.replace('product_', '');
        setIsDeepLinking(true);
        router.replace(`/looks/${productId}`);
      }
    }
  }, [router]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US').format(val).replace(/,/g, ' ');
  };

  if (!mounted) return null;

  if (isDeepLinking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-widest animate-pulse">Routing to Product Interface...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="flex flex-col items-center space-y-8 max-w-5xl mx-auto">
          
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-tight uppercase italic neon-text drop-shadow-sm">
            {t(dictionary.heroTitle)}
          </h1>

          <div className="flex flex-col items-center gap-6 pt-8 w-full max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild className="h-14 px-8 rounded-xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none transition-all hover:scale-105 active:scale-95 shadow-2xl group">
                <Link href="/looks">
                  {t(dictionary.shopTheDrop)}
                  <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-14 px-8 rounded-xl border-foreground/10 bg-transparent text-foreground font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all cursor-pointer">
                <a href="https://t.me/jamastore_aibot/app?startapp=from_web" target="_blank" rel="noopener noreferrer">
                  <Send className="w-4 h-4 mr-2" />
                  {t(dictionary.openApp)}
                </a>
              </Button>
            </div>

            <Button asChild variant="ghost" className="h-14 px-8 rounded-xl border border-foreground/5 bg-foreground/[0.02] text-foreground/40 hover:text-foreground font-black uppercase text-xs tracking-widest transition-all">
              <Link href="/about">
                <Info className="w-4 h-4 mr-2" />
                {t(dictionary.aboutUs)}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATUS BAR */}
      <div className="border-y border-foreground/5 bg-foreground/[0.02] py-6 mb-24 overflow-hidden relative">
        <div className="flex animate-marquee-right whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex shrink-0 items-center gap-12 px-6">
              {[
                dictionary.newArrivals,
                dictionary.limitedEdition,
                dictionary.freeDelivery,
                dictionary.orderViaTelegram,
                dictionary.goodQuality
              ].map((dictKey, idx) => (
                <span key={idx} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictKey)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED LOOKS */}
      <section className="container mx-auto px-6 mb-32">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-12 gap-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-widest neon-text">
            {t(dictionary.featuredLooks)}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-secondary p-1 rounded-xl border border-border">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFeaturedViewMode('grid')}
                className={cn(
                  "rounded-lg h-9 w-10 transition-all",
                  featuredViewMode === 'grid' ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFeaturedViewMode('single')}
                className={cn(
                  "rounded-lg h-9 w-10 transition-all",
                  featuredViewMode === 'single' ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>

            <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground hover:bg-transparent p-0 group">
              <Link href="/looks">
                {t(dictionary.viewAll)}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-foreground/5 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={cn(
            "transition-all duration-500",
            featuredViewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-3 gap-8" 
              : "flex flex-col items-center gap-12"
          )}>
            {featuredLooks?.map((look, index) => (
              <Link 
                key={look.id} 
                href={`/looks/${look.id}`} 
                className={cn(
                  "group block relative transition-all duration-500",
                  featuredViewMode === 'single' ? "w-full max-w-xl" : "w-full"
                )}
              >
                <div className={cn(
                  "relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-surface border-foreground/5 transition-all group-hover:border-primary/20 shadow-xl",
                  featuredViewMode === 'single' && "ring-1 ring-primary/20"
                )}>
                  <Image 
                    src={look.imageUrl} 
                    alt={look.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 px-3 py-1 neon-bg text-white text-[8px] font-black uppercase tracking-widest rounded-sm z-10">
                    {index === 0 ? t(dictionary.hotTag) : t(dictionary.newTag)}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[120px] font-black text-black/5 uppercase italic tracking-tighter">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em] mb-1">{t(dictionary.lookNumber)} / 00{index + 1}</p>
                    <h3 className={cn("font-black text-white uppercase italic mb-1 truncate", featuredViewMode === 'single' ? "text-2xl" : "text-lg")}>{look.name}</h3>
                    <p className={cn("neon-text font-black tracking-tighter", featuredViewMode === 'single' ? "text-xl" : "text-base")}>
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${formatPrice(look.price)}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TELEGRAM CTA */}
      <section className="container mx-auto px-6 mb-32">
        <div className="relative overflow-hidden rounded-[3rem] border border-foreground/10 bg-secondary/20 p-12 sm:p-20 shadow-2xl group">
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10 animate-pulse">
              <Send className="w-10 h-10 neon-text -rotate-12" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-4xl sm:text-6xl font-black uppercase italic leading-none tracking-tighter neon-text">
                {t(dictionary.liveOnTelegram)}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-foreground/40 uppercase tracking-[0.4em]">
                {t(dictionary.browseOrderTelegram)}
              </p>
            </div>
            <Button asChild className="h-20 px-12 rounded-2xl neon-bg text-white font-black uppercase text-sm tracking-[0.2em] border-none transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer">
              <a href="https://t.me/jamastore_aibot/app?startapp=from_web" target="_blank" rel="noopener noreferrer">
                <Send className="mr-3 w-6 h-6" />
                {t(dictionary.openApp)}
                <Sparkles className="ml-3 w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
