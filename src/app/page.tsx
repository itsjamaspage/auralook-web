"use client"

import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function Home() {
  const { t, dictionary } = useLanguage();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden px-6">
        {/* Futuristic Background with Neon Glows and Technical Patterns */}
        <div className="absolute inset-0 z-[-1]">
          {/* Solid Base */}
          <div className="absolute inset-0 bg-background" />
          
          {/* Large Primary Glow Orb */}
          <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-primary/15 rounded-full blur-[140px] animate-pulse" />
          
          {/* Secondary Accent Orb */}
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[160px] animate-float" />
          
          {/* Subtle Technical Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04]" 
            style={{ 
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} 
          />

          {/* Center Glow for Depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-50" />

          {/* Bottom Vignette to transition to content */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
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
            <Link href="/looks">
              <Button size="lg" className="rounded-2xl h-16 px-12 text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-xl shadow-primary/20 w-full sm:w-auto">
                {t(dictionary.browseLooks)}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
