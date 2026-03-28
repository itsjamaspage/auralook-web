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
        {/* Ambient Hero Glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[140px] animate-float" />

        {/* Vertical Data Streams */}
        {mounted && [...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="data-stream" 
            style={{ 
              left: `${(i + 1) * 8}%`, 
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }} 
          />
        ))}

        {/* Messy Animated Energy Lanes Connecting Brand Points */}
        {mounted && (
          <svg className="absolute inset-0 w-full h-full opacity-40">
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="50%" stopColor="var(--secondary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            {/* Connection: Top Left (Auralook.uz) to Center (Next Gen Style) */}
            <path 
              d="M 50,50 Q 150,300 500,400 T 800,200" 
              fill="none" 
              stroke="url(#neonGradient)" 
              strokeWidth="1.5" 
              className="energy-line neon-text"
              style={{ animationDelay: '0s', animationDuration: '12s' }}
            />
            {/* Connection: Center to Bottom Button Area */}
            <path 
              d="M 800,200 Q 600,600 500,800 S 200,900 100,600" 
              fill="none" 
              stroke="url(#neonGradient)" 
              strokeWidth="1" 
              className="energy-line neon-text"
              style={{ animationDelay: '2s', animationDuration: '15s' }}
            />
            {/* Messy Random Paths */}
            <path 
              d="M -100,500 L 1200,100 Q 600,900 1300,500" 
              fill="none" 
              stroke="url(#neonGradient)" 
              strokeWidth="0.5" 
              className="energy-line neon-text"
              style={{ animationDelay: '5s', animationDuration: '18s' }}
            />
            <path 
              d="M 1000,-100 Q 200,500 1100,1100" 
              fill="none" 
              stroke="url(#neonGradient)" 
              strokeWidth="1" 
              className="energy-line neon-text"
              style={{ animationDelay: '1s', animationDuration: '14s' }}
            />
          </svg>
        )}
      </div>

      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 z-10">
        <div className="max-w-4xl text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none bg-clip-text text-transparent neon-text">
            {t(dictionary.heroTitle)}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {t(dictionary.heroSub)}
          </p>

          <div className="relative group w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 items-center relative z-10">
              <Link href="/looks" className="w-full">
                <Button 
                  size="lg" 
                  className="neon-bg w-full h-16 px-12 text-xl font-black rounded-2xl hover:scale-105 transition-all duration-500 shadow-2xl border-none text-black"
                >
                  {t(dictionary.browseLooks)}
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
