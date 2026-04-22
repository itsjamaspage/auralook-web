
"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

export function Footer({ className }: { className?: string }) {
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className={`py-12 border-t border-foreground/10 text-center text-sm text-foreground/60 ${className}`}>
      <div className="container mx-auto px-6">
        <p className="font-medium text-foreground/80">{t(dictionary.allRightsReserved)}</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="https://t.me/itsjamaspage" target="_blank">
            <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">Telegram</span>
          </Link>
          <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">Instagram</span>
          <Link href="/about">
            <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">{t(dictionary.about)}</span>
          </Link>
          <Link href="https://t.me/itsjamaspage" target="_blank">
            <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">{t(dictionary.contact)}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
