"use client"

import Image from 'next/image';
import Link from 'next/link';
import { MOCK_LOOKS } from '@/lib/mock-data';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, Sparkles, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { t, dictionary } = useLanguage();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden px-6">
        <div className="hero-glow top-1/4 left-1/4" />
        <div className="hero-glow bottom-1/4 right-1/4" />
        
        <div className="absolute inset-0 z-[-1] opacity-30">
          <Image 
            src="https://picsum.photos/seed/fashion1/1200/800" 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <Badge className="bg-primary/20 text-primary border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium animate-float">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            Vibe Checked by AI
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            {t(dictionary.heroTitle)}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            {t(dictionary.heroSub)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-2xl h-16 px-12 text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform">
              {t(dictionary.browseLooks)}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Lookbook Grid */}
      <section className="container mx-auto px-6 space-y-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">{t(dictionary.curatedLooks)}</h2>
            <p className="text-muted-foreground max-w-md">{t(dictionary.curatedLooksSub)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-full px-4 py-1 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all">{t(dictionary.all)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_LOOKS.map((look, idx) => (
            <Link key={look.id} href={`` + `/looks/${look.id}`} className="group relative block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl glass border-white/5">
                <Image 
                  src={look.imageUrl} 
                  alt={t(look.name)} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                  <Button className="w-full bg-primary text-primary-foreground font-bold rounded-2xl">
                    {t(dictionary.viewDetails)}
                  </Button>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{t(look.name)}</h3>
                  <span className="font-mono text-primary">${look.price}</span>
                </div>
                <div className="flex gap-2">
                  {look.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-widest text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Section */}
      <section className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-dark p-10 rounded-[3rem] border-white/5 space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Sparkles />
            </div>
            <h3 className="text-2xl font-bold">{t(dictionary.aiSizeEngine)}</h3>
            <p className="text-muted-foreground font-light">{t(dictionary.aiSizeEngineSub)}</p>
          </div>
          <div className="glass-dark p-10 rounded-[3rem] border-white/5 space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <ShoppingCart />
            </div>
            <h3 className="text-2xl font-bold">{t(dictionary.quickLogistics)}</h3>
            <p className="text-muted-foreground font-light">{t(dictionary.quickLogisticsSub)}</p>
          </div>
          <div className="glass-dark p-10 rounded-[3rem] border-white/5 space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Globe />
            </div>
            <h3 className="text-2xl font-bold">{t(dictionary.globalAesthetics)}</h3>
            <p className="text-muted-foreground font-light">{t(dictionary.globalAestheticsSub)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
