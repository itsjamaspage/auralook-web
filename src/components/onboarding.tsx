"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

const STORAGE_KEY = 'auralook_onboarded';

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    emoji: '🔥',
    heading: 'Welcome to AURALOOK',
    sub: 'Techwear drops. Direct to you.',
    options: null,
  },
  {
    emoji: '👗',
    heading: 'What\'s your style?',
    sub: 'Pick the vibe that fits you.',
    options: ['Minimalist', 'Streetwear', 'Techwear', 'All styles'],
  },
  {
    emoji: '💸',
    heading: 'Your budget range?',
    sub: 'We\'ll show you the right drops.',
    options: ['Under $30', '$30 – $80', '$80 – $150', 'No limit'],
  },
];

export function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    // Small delay so page renders first
    const timer = setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleOption = (opt: string) => {
    setPicked(p => [...p, opt]);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={finish}
          />

          {/* Card */}
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            className="relative w-full sm:max-w-sm bg-background rounded-t-[2.5rem] sm:rounded-[2.5rem] p-7 shadow-2xl border border-foreground/10 z-10"
          >
            {/* Close */}
            <button onClick={finish} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 8,
                    background: i <= step ? 'var(--sync-color)' : 'hsl(var(--foreground)/0.1)',
                  }}
                />
              ))}
            </div>

            {/* Emoji */}
            <div className="text-4xl mb-4">{current.emoji}</div>

            {/* Text */}
            <h2 className="text-xl font-black uppercase italic tracking-tight text-foreground mb-1">
              {current.heading}
            </h2>
            <p className="text-sm text-foreground/50 font-medium mb-6">{current.sub}</p>

            {/* Options or Next */}
            {current.options ? (
              <div className="grid grid-cols-2 gap-2.5">
                {current.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleOption(opt)}
                    className="h-11 rounded-2xl bg-secondary/60 border border-foreground/10 text-sm font-bold text-foreground hover:neon-border hover:neon-text transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="w-full h-12 rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all border-none"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
