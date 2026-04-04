
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function LoginPage() {
  const router = useRouter();
  const { t, dictionary } = useLanguage();

  useEffect(() => {
    // Instant redirect: Login is handled silently by TelegramUserProvider
    router.replace('/');
  }, [router]);

  return (
    <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">{t(dictionary.bridgingIdentity)}</p>
      </div>
    </div>
  );
}
