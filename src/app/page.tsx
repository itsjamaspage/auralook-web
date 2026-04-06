"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';

export default function Home() {
  const { t, dictionary, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const db = useFirestore();

  const featuredQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'), limit(3));
  }, [db]);

  const { data: featuredLooks, isLoading } = useCollection(featuredQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US').format(val).replace(/,/g, ' ');
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="flex flex-col items-center space-y-8 max-w-5xl mx-auto">
          <p className="text-[10px] font-black tracking-[0.5em] text-foreground/40 uppercase animate-in fade-in slide-in-from-top-4 duration-700">
            —— AURALOOK.UZ — SS/2025
          </p>
          
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-tight uppercase italic drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {t(dictionary.wear)} <br />
            <span className="neon-text">{t(dictionary.tomorrow)}</span> <br />
            {t(dictionary.today)}.
          </h1>

          <p className="text-xs sm:text-sm lg:text-base font-bold text-foreground/60 tracking-[0.3em] uppercase max-w-lg leading-relaxed">
            {t(dictionary.landingHeroSub)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-8">
            <Button asChild className="flex-1 h-14 rounded-xl neon-bg text-black font-black uppercase text-xs tracking-widest border-none transition-all hover:scale-105 active:scale-95 shadow-2xl group">
              <Link href="/looks">
                {t(dictionary.shopTheDrop)}
                <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-14 rounded-xl border-foreground/10 bg-transparent text-foreground font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all">
              <Link href="/looks">
                {t(dictionary.exploreLooks)}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* STATUS BAR (ANIMATED MARQUEE) */}
      <div className="border-y border-foreground/5 bg-foreground/[0.02] py-6 mb-24 overflow-hidden relative">
        <div className="flex animate-marquee-right whitespace-nowrap">
          {[1, 2].map((i) => (
            <div key={i} className="flex shrink-0 items-center gap-12 px-6">
              <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictionary.newArrivals)}
              </span>
              <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictionary.limitedEdition)}
              </span>
              <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictionary.freeDelivery)}
              </span>
              <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictionary.orderViaTelegram)}
              </span>
              <span className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
                <div className="w-1.5 h-1.5 neon-bg rotate-45" /> {t(dictionary.goodQuality)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED LOOKS */}
      <section className="container mx-auto px-6 mb-32">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-widest neon-text">
            {t(dictionary.featuredLooks)}
          </h2>
          <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground hover:bg-transparent p-0 group">
            <Link href="/looks">
              {t(dictionary.viewAll)}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-foreground/5 rounded-[2.5rem] animate-pulse" />
            ))
          ) : (
            featuredLooks?.map((look, index) => (
              <Link key={look.id} href={`/looks/${look.id}`} className="group block relative">
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-surface border-foreground/5 transition-all group-hover:border-primary/20">
                  <Image 
                    src={look.imageUrl} 
                    alt={look.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Status Tag */}
                  <div className="absolute top-6 left-6 px-3 py-1 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-sm">
                    {index === 0 ? t(dictionary.hotTag) : t(dictionary.newTag)}
                  </div>

                  {/* Index Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[120px] font-black text-white/5 uppercase italic tracking-tighter">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-1">{t(dictionary.lookNumber)} / 00{index + 1}</p>
                    <h3 className="text-lg font-black text-foreground uppercase italic mb-1 truncate">{look.name}</h3>
                    <p className="neon-text font-black tracking-tighter">
                      {look.currency === 'UZS' ? `${formatPrice(look.price)} UZS` : `$${look.price}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* PROMISE SECTION */}
      <section className="container mx-auto px-6 mb-32">
        <div className="relative p-12 sm:p-20 rounded-[3rem] border border-foreground/5 bg-foreground/[0.01] overflow-hidden group">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/20 m-8" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/20 m-8" />
          
          <div className="relative z-10 max-w-2xl">
            <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.4em] mb-6">—— {t(dictionary.auralookPromise)}</p>
            <h2 className="text-3xl sm:text-5xl font-black uppercase italic leading-tight tracking-tighter mb-10">
              {t(dictionary.promiseTitle1)} <br />
              <span className="neon-text">{t(dictionary.promiseTitle2)}</span> <br />
              {t(dictionary.promiseTitle3)}
            </h2>
            <Button asChild className="h-14 px-10 rounded-xl bg-transparent border border-foreground/10 text-foreground font-black uppercase text-[10px] tracking-[0.2em] hover:neon-bg hover:text-black hover:border-none transition-all">
              <Link href="/looks">
                {t(dictionary.claimYourLook)}
                <ArrowUpRight className="ml-3 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TELEGRAM BANNER */}
      <section className="container mx-auto px-6 mb-24">
        <div className="bg-[#050a0a] border border-foreground/5 rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:border-primary/10 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plane className="w-8 h-8 text-primary -rotate-45" />
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-lg font-black uppercase italic text-foreground tracking-tight">{t(dictionary.liveOnTelegram)}</h3>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t(dictionary.browseOrderTelegram)}</p>
            </div>
          </div>
          <Button asChild className="h-14 px-10 rounded-xl border border-foreground/10 bg-transparent text-foreground font-black uppercase text-[10px] tracking-[0.2em] hover:neon-text transition-all w-full sm:w-auto">
            <Link href="/looks">
              {t(dictionary.openApp)}
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* MINI FOOTER */}
      <footer className="container mx-auto px-6 py-12 border-t border-foreground/5 flex flex-col sm:flex-row justify-between items-center gap-8">
        <span className="text-xs font-black uppercase italic tracking-[0.3em] neon-text">AURALOOK</span>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-xl border-foreground/5 bg-transparent h-12 px-8 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground">{t(dictionary.about)}</Button>
          <Button variant="outline" className="rounded-xl border-foreground/5 bg-transparent h-12 px-8 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground">{t(dictionary.delivery)}</Button>
          <Button variant="outline" className="rounded-xl border-foreground/5 bg-transparent h-12 px-8 text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground">{t(dictionary.contact)}</Button>
        </div>
      </footer>
    </div>
  );
}
