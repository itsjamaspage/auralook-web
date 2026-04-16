
"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Send, Heart, ShoppingCart, ChevronRight } from 'lucide-react';
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
  const router = useRouter();
  const db = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'), limit(6));
  }, [db]);

  const { data: featuredLooks, isLoading } = useCollection(featuredQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('tgWebAppStartParam');
    const sdkStartParam = (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
    const startParam = urlStartParam || sdkStartParam;

    if (startParam?.startsWith('product_')) {
      const id = startParam.replace('product_', '');
      setIsDeepLinking(true);
      router.replace(`/looks/${id}`);
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
        <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-widest animate-pulse">Routing to Asset...</p>
      </div>
    );
  }

  const heroLook = featuredLooks?.[0];
  const gridLooks = featuredLooks?.slice(1, 5) ?? [];

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* HERO CARD — big outfit photo like the left screen in the design */}
      <section className="px-4 mb-8">
        <div className="max-w-2xl mx-auto">
          {isLoading || !heroLook ? (
            <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/3] bg-foreground/5 animate-pulse" />
          ) : (
            <Link href={`/looks/${heroLook.id}`} className="group block relative rounded-[2rem] overflow-hidden aspect-[3/4] sm:aspect-[4/3] shadow-2xl">
              <Image
                src={heroLook.imageUrl}
                alt={heroLook.name}
                fill
                quality={100}
                priority
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* top badge */}
              <div className="absolute top-5 left-5">
                <span className="px-3 py-1.5 neon-bg text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  {t(dictionary.newTag)}
                </span>
              </div>

              {/* bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.25em]">
                    {t(dictionary.featuredLooks)}
                  </p>
                  <h2 className="text-white text-xl sm:text-2xl font-black italic uppercase leading-tight max-w-[200px]">
                    {heroLook.name}
                  </h2>
                  <p className="neon-text text-lg font-black tracking-tight">
                    {heroLook.currency === 'UZS' ? `${formatPrice(heroLook.price)} UZS` : `$${formatPrice(heroLook.price)}`}
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full neon-bg flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* SCROLLING TICKER */}
      <div className="border-y border-foreground/5 bg-foreground/[0.02] py-4 mb-8 overflow-hidden relative">
        <div className="flex animate-marquee-right whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex shrink-0 items-center gap-10 px-6">
              {[
                dictionary.newArrivals,
                dictionary.limitedEdition,
                dictionary.freeDelivery,
                dictionary.orderViaTelegram,
                dictionary.goodQuality
              ].map((dictKey, idx) => (
                <span key={idx} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                  <div className="w-1.5 h-1.5 neon-bg rotate-45 shrink-0" /> {t(dictKey)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* NEW ARRIVALS GRID — like "Special Offers" section in the middle screen */}
      <section className="px-4 mb-10">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black uppercase tracking-wide text-foreground">
              {t(dictionary.newArrivals)}
            </h2>
            <Link href="/looks" className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-foreground/50 hover:neon-text transition-colors">
              {t(dictionary.viewAll)}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[1.5rem] bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {gridLooks.map((look) => (
                <Link
                  key={look.id}
                  href={`/looks/${look.id}`}
                  className="group block bg-secondary/40 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  {/* image */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-[1.5rem]">
                    <Image
                      src={look.imageUrl}
                      alt={look.name}
                      fill
                      quality={90}
                      sizes="(max-width: 672px) 50vw, 336px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* info */}
                  <div className="p-3 space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">
                      {look.name}
                    </h3>
                    <p className="text-sm font-black neon-text">
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${formatPrice(look.price)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Browse all button */}
          <div className="mt-6">
            <Button
              asChild
              className="w-full h-12 rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <Link href="/looks">
                {t(dictionary.shopTheDrop)}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TELEGRAM CTA */}
      <section className="px-4 mb-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary/30 border border-foreground/5 p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-full neon-bg flex items-center justify-center shrink-0 shadow-xl">
                <Send className="w-6 h-6 text-white -rotate-12" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-base font-black uppercase tracking-wide text-foreground mb-0.5">
                  {t(dictionary.liveOnTelegram)}
                </h3>
                <p className="text-xs text-foreground/50 font-medium">
                  {t(dictionary.browseOrderTelegram)}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="shrink-0 h-11 px-6 rounded-2xl border-foreground/15 font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all"
              >
                <a href="https://t.me/jamastore_aibot/auralook?startapp=from_web" target="_blank" rel="noopener noreferrer">
                  {t(dictionary.openApp)}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
