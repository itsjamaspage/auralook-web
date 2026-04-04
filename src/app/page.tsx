"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Background Grid & Energy Paths */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Hero Glows - Adjusted for Light Mode Visibility */}
        <div className="absolute top-[-10%] left-[-5%] w-[100%] h-[60%] lg:w-[60%] lg:h-[60%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[60px] lg:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[90%] h-[50%] lg:w-[50%] lg:h-[50%] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[80px] lg:blur-[140px]" />

        {/* Animated Energy Lanes */}
        {mounted && (
          <svg className="absolute inset-0 w-full h-full opacity-40 dark:opacity-100">
            <path 
              d="M 100,100 Q 200,400 500,450" 
              fill="none" 
              strokeWidth="2" 
              className="energy-line"
            />
            <path 
              d="M 500,450 Q 500,700 500,800" 
              fill="none" 
              strokeWidth="2" 
              className="energy-line"
              style={{ animationDelay: '2s' }}
            />
            <path 
              d="M -100,500 L 1200,100 Q 600,900 1300,500" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
              style={{ animationDelay: '5s' }}
            />
          </svg>
        )}
      </div>

      <section className="relative min-h-[80vh] lg:min-h-[90vh] flex flex-col items-center justify-center px-6 z-10 text-center py-20 lg:py-0">
        <div className="max-w-4xl space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] neon-text uppercase italic drop-shadow-[0_0_30px_var(--sync-shadow)]">
            {t(dictionary.heroTitle)}
          </h1>
          
          <p className="text-base sm:text-xl lg:text-2xl text-foreground/80 dark:text-white/60 max-w-2xl mx-auto font-light leading-relaxed px-4 lg:px-0 italic">
            {t(dictionary.heroSub)}
          </p>

          <div className="relative group w-full max-w-xs sm:max-w-md mx-auto pt-6 lg:pt-8">
            <Link href="/looks" className="w-full">
              <Button 
                size="lg" 
                className="neon-bg w-full h-14 lg:h-16 px-8 lg:px-12 text-base lg:text-xl font-black rounded-2xl transition-transform duration-500 hover:scale-105 active:scale-95 border-none uppercase tracking-widest shadow-2xl"
              >
                {t(dictionary.browseLooks)}
                <ArrowRight className="ml-2 w-5 h-5 lg:w-6 lg:h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}