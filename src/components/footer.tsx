
"use client"

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { Send } from 'lucide-react';

export function Footer({ className }: { className?: string }) {
  const { t, dictionary } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <footer className={`py-12 border-t border-foreground/10 text-center text-sm text-foreground/60 ${className}`}>
      <div className="container mx-auto px-6 space-y-6">
        {/* Social buttons */}
        <div className="flex justify-center gap-3">
          <a
            href="https://t.me/jamastore_aibot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9]/20 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <Send className="w-3.5 h-3.5" />
            Telegram
          </a>
          <a
            href="https://www.instagram.com/auralook.uz/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 hover:bg-pink-500/20 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            Instagram
          </a>
        </div>

        <p className="font-medium text-foreground/80">{t(dictionary.allRightsReserved)}</p>
        <div className="flex justify-center gap-6">
          <Link href="/about">
            <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">{t(dictionary.about)}</span>
          </Link>
          <a
            href="https://t.me/itsjamaspage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:neon-text transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            {t(dictionary.contact)}
          </a>
        </div>
      </div>
    </footer>
  );
}
