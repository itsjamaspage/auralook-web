
"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FadeUp, FadeIn, StaggerContainer, StaggerItem } from '@/components/motion-reveal';
import { cn } from '@/lib/utils';
import { SnapLoader } from '@/components/snap-loader';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const { t, dictionary, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isDeepLinking, setIsDeepLinking] = useState(false);
  const router = useRouter();
  const db = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'), limit(8));
  }, [db]);

  const { data: featuredLooks, isLoading } = useCollection(featuredQuery);

  useEffect(() => { setMounted(true); }, []);

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
    return new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US')
      .format(val).replace(/,/g, ' ');
  };

  if (!mounted) return <SnapLoader />;

  if (isDeepLinking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-widest animate-pulse">
          Routing...
        </p>
      </div>
    );
  }

  // Split into words so each renders on its own line — works for all 3 languages
  const heroWords = t(dictionary.heroTitle).toUpperCase().split(' ');

  const featurePanels = [
    { num: '01', title: t(dictionary.qualityTitle),      sub: t(dictionary.chinaDirect),    dark: true  },
    { num: '02', title: t(dictionary.honestPriceTitle),  sub: t(dictionary.deliveryTimeVal), dark: false },
    { num: '03', title: t(dictionary.fastOrderTitle),    sub: '100+ ' + t(dictionary.ordersPlaced), dark: false },
    { num: '04', title: t(dictionary.aboutUs),           sub: t(dictionary.est2026),         dark: true  },
  ];

  return (
    <div className="relative min-h-screen text-foreground overflow-x-hidden">

      {/* ── EDITORIAL HERO ── */}
      <section className="min-h-[100svh] lg:min-h-0 lg:py-20 flex flex-col justify-between px-4 pb-8 pt-2">

        {/* Top meta label */}
        <FadeIn>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-foreground/30">
            —— EST. 2026 // TOSHKENT, UZ
          </p>
        </FadeIn>

        {/* Staircase: each word indented progressively */}
        <div className="-mx-2 overflow-hidden">
          {heroWords.map((word, i) => (
            <motion.div
              key={i}
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: i * 0.13, ease }}
              style={{ paddingLeft: i === 0 ? '0.5rem' : i === 1 ? '4vw' : `${i * 4}vw` }}
              className={cn(
                'font-black uppercase leading-[0.88] tracking-tighter',
                'text-[14vw] sm:text-[13vw] md:text-[10vw] lg:text-[7vw]',
                i === 1 ? 'neon-text' : 'text-foreground'
              )}
            >
              {word}
            </motion.div>
          ))}
        </div>

        {/* Bottom row: sub-text + circular arrow CTA */}
        <FadeUp delay={0.45}>
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs text-foreground/50 font-medium max-w-[200px] leading-relaxed">
                {t(dictionary.heroSub)}
              </p>
              <Link
                href="/about"
                className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:neon-text transition-colors"
              >
                {t(dictionary.aboutUs)} →
              </Link>
            </div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/looks"
                className="w-16 h-16 rounded-full neon-bg flex items-center justify-center shadow-xl shrink-0 magnetic-ring"
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      {/* ── TICKER ── */}
      <FadeIn>
        <div className="border-y border-foreground/5 bg-foreground/[0.02] py-3 overflow-hidden relative">
          <div className="flex animate-marquee-right whitespace-nowrap">
            {[1, 2].map((i) => (
              <div key={i} className="flex shrink-0 items-center gap-10 px-6">
                {[
                  dictionary.newArrivals,
                  dictionary.limitedEdition,
                  dictionary.freeDelivery,
                  dictionary.orderViaTelegram,
                  dictionary.goodQuality,
                ].map((dictKey, idx) => (
                  <span key={idx} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                    <div className="w-1.5 h-1.5 neon-bg rotate-45 shrink-0" /> {t(dictKey)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── NUMBERED LOOKS STRIP ── */}
      <section className="pt-8 pb-4 mb-2">
        <FadeUp>
          <div className="flex items-center justify-between px-4 mb-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-foreground/40">
              —— {t(dictionary.newArrivals)}
            </p>
            <Link href="/looks" className="text-[10px] font-black uppercase tracking-widest neon-text">
              {t(dictionary.viewAll)} →
            </Link>
          </div>
        </FadeUp>

        {isLoading ? (
          <div className="flex gap-3 px-4 overflow-hidden">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="shrink-0 w-[150px] aspect-[3/4] rounded-2xl bg-foreground/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 px-4 overflow-x-auto pb-3 no-scrollbar">
            {(featuredLooks ?? []).map((look, i) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07, ease }}
                className="shrink-0"
              >
                <Link href={`/looks/${look.id}`} className="group block w-[148px] sm:w-[168px]">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-foreground/5">
                    <Image
                      src={look.imageUrl}
                      alt={look.name}
                      fill
                      quality={85}
                      sizes="168px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Index number */}
                    <div className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 font-black">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {/* Price badge */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full neon-bg text-white text-[10px] font-black shadow">
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${look.price}`}
                    </div>
                  </div>
                  <p className="text-[11px] font-black uppercase mt-2 truncate tracking-tight text-foreground leading-tight">
                    {look.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURE PANELS — Dave Holloway service-card style ── */}
      <section className="px-4 mb-8">
        <FadeUp>
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-foreground/40 mb-4">
            —— {t(dictionary.whatWeStandFor)}
          </p>
        </FadeUp>

        <StaggerContainer className="grid grid-cols-2 gap-3">
          {featurePanels.map((panel) => (
            <StaggerItem key={panel.num}>
              <div className={cn(
                'p-4 rounded-2xl flex flex-col justify-between aspect-square',
                panel.dark
                  ? 'bg-foreground text-background'
                  : 'bg-secondary/50 border border-foreground/[0.08] text-foreground'
              )}>
                <p className={cn('text-[10px] font-mono', panel.dark ? 'opacity-40' : 'text-foreground/30')}>
                  {panel.num}
                </p>
                <div className="space-y-1">
                  <h3 className={cn(
                    'text-sm font-black uppercase italic leading-tight',
                    panel.dark ? 'text-background' : 'text-foreground'
                  )}>
                    {panel.title}
                  </h3>
                  <p className={cn(
                    'text-[9px] font-bold uppercase tracking-wide leading-snug',
                    panel.dark ? 'opacity-45' : 'text-foreground/35'
                  )}>
                    {panel.sub}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.15}>
          <Button
            asChild
            className="w-full h-12 rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none shadow-xl mt-3 magnetic-ring"
          >
            <Link href="/looks">
              {t(dictionary.shopTheDrop)} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </FadeUp>
      </section>

      {/* ── TELEGRAM CTA ── */}
      <FadeUp delay={0.05}>
        <section className="px-4 mb-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary/30 border border-foreground/5 p-7 shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-foreground/30 mb-4">
              —— {t(dictionary.orderViaTelegram)}
            </p>
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full neon-bg flex items-center justify-center shrink-0 shadow-xl"
              >
                <Send className="w-5 h-5 text-white -rotate-12" />
              </motion.div>
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-black uppercase tracking-wide text-foreground mb-0.5">
                  {t(dictionary.liveOnTelegram)}
                </h3>
                <p className="text-[11px] text-foreground/50 font-medium leading-snug">
                  {t(dictionary.browseOrderTelegram)}
                </p>
              </div>
            </div>
            <Button
              asChild
              className="w-full h-11 mt-5 rounded-2xl border border-foreground/15 bg-transparent font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text text-foreground transition-all"
            >
              <a href="https://t.me/jamastore_aibot/auralook?startapp=from_web" target="_blank" rel="noopener noreferrer">
                {t(dictionary.openApp)} <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>
      </FadeUp>

    </div>
  );
}
