"use client"

import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const { t, dictionary } = useLanguage();
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-look');

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        <div className="hero-glow top-1/4 left-1/4" />
        <div className="hero-glow bottom-1/4 right-1/4" />
        
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src={heroImage?.imageUrl || "https://picsum.photos/seed/fashion-runway-99/1200/800"} 
            alt="Fashion Background" 
            fill 
            className="object-cover opacity-60"
            priority
            data-ai-hint={heroImage?.imageHint || "fashion runway"}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
        </div>

        <div className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <Badge className="bg-primary/20 text-primary border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium animate-float">
            <Sparkles className="w-4 h-4 mr-2 inline" />
            {t(dictionary.vibeCheckedByAI)}
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            {t(dictionary.heroTitle)}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light">
            {t(dictionary.heroSub)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-2xl h-16 px-12 text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-xl shadow-primary/20">
              {t(dictionary.browseLooks)}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
