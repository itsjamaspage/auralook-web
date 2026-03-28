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

        {/* Animated Energy Lanes connecting brand points */}
        {mounted && (
          <svg className="absolute inset-0 w-full h-full opacity-60">
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
            <path 
              d="M 1000,-100 Q 200,500 1100,1100" 
              fill="none" 
              strokeWidth="1.5" 
              className="energy-line"
              style={{ animationDelay: '1s' }}
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