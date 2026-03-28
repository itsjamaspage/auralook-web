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
        {/* Futuristic Ambient Background */}
        <div className="absolute inset-0 z-[-1]">
          {/* Deep Base */}
          <div className="absolute inset-0 bg-[#0a0a0a]" />
          
          {/* Main Neon Glows */}
          <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-primary/15 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[160px] animate-float" />
          
          {/* Floating Ambient Particles (Something else instead of grids) */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full blur-sm animate-float opacity-50" />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-yellow-400/30 rounded-full blur-sm animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/20 rounded-full blur-[1px] animate-float opacity-30" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-primary/20 rounded-full blur-md animate-pulse opacity-20" style={{ animationDelay: '0.5s' }} />

          {/* Dynamic Light Streaks */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-md opacity-20 animate-pulse" />
          <div className="absolute top-1/3 right-0 w-3/4 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent blur-sm opacity-10 animate-float" />

          {/* Subtle Color Wash */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,191,0,0.02),transparent_70%)]" />

          {/* Bottom Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />
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
