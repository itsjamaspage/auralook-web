"use client"

import { useLanguage } from '@/hooks/use-language';

export function Footer() {
  const { t, dictionary } = useLanguage();

  return (
    <footer className="py-12 border-t border-white/5 text-center text-sm text-muted-foreground">
      <div className="container mx-auto">
        <p>{t(dictionary.allRightsReserved)}</p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="hover:text-primary cursor-pointer transition-colors">Telegram</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Instagram</span>
          <span className="hover:text-primary cursor-pointer transition-colors">{t(dictionary.contact)}</span>
        </div>
      </div>
    </footer>
  );
}
