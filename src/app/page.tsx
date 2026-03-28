"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [randomDurations, setRandomDurations] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
    setRandomDurations([...Array(12)].map(() => 7 + Math.random() * 5));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[140px] animate-float" />

        {/* Vertical Data Streams */}
        {mounted && randomDurations.length > 0 && [...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="data-stream" 
            style={{ 
              left: `${(i + 1) * 8}%`, 
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${randomDurations[i]}s`
            }} 
          />
        ))}

        {/* Ambient Moving Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full blur-sm animate-float opacity-50" />
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-secondary/30 rounded-full blur-sm animate-pulse opacity-40" />
      </div>

      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6">
        <div className="max-w-4xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-neon-text">
            {t(dictionary.heroTitle)}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {t(dictionary.heroSub)}
          </p>

          <div className="relative group w-full max-w-md mx-auto">
            {/* The Moving Lane Interaction - Top */}
            <div className="absolute -top-12 left-0 right-0 h-[8px] overflow-hidden">
              <div className="signal-lane" />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 items-center relative z-10">
              <Link href="/looks" className="w-full">
                <Button 
                  size="lg" 
                  className="animate-neon-bg w-full h-16 px-12 text-xl font-black rounded-2xl hover:scale-105 transition-all duration-500 shadow-2xl border-none text-black"
                >
                  {t(dictionary.browseLooks)}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </div>

            {/* The Moving Lane Interaction - Bottom */}
            <div className="absolute -bottom-12 left-0 right-0 h-[8px] overflow-hidden">
              <div className="signal-lane" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}