"use client"

import { useLanguage } from '@/hooks/use-language';

export function Footer({ className }: { className?: string }) {
  const { t, dictionary } = useLanguage();

  return (
    <footer className={`py-12 border-t border-white/5 text-center text-sm text-white/60 ${className}`}>
      <div className="container mx-auto">
        <p className="font-medium">{t(dictionary.allRightsReserved)}</p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">Telegram</span>
          <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">Instagram</span>
          <span className="hover:neon-text cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]">{t(dictionary.contact)}</span>
        </div>
      </div>
    </footer>
  );
}
