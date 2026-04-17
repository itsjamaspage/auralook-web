"use client"

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Heart, HeartOff, ArrowRight, Send } from 'lucide-react';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem, FadeUp } from '@/components/motion-reveal';

export default function FavoritesPage() {
  const db = useFirestore();
  const { user: tgUser } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: allLooks, isLoading: looksLoading } = useCollection(looksQuery);

  const likedLooksQuery = useMemoFirebase(() => {
    if (isUserLoading || !tgUser || !firebaseUser || tgUser.firebaseUid === 'pending') return null;
    return collection(db, 'users', tgUser.id, 'liked_looks');
  }, [db, tgUser, firebaseUser, isUserLoading]);

  const { data: likedData } = useCollection(likedLooksQuery ?? undefined);
  const likedIds = useMemo(() => new Set(likedData?.map(l => l.lookId) || []), [likedData]);
  const myFavorites = useMemo(() => allLooks?.filter(look => likedIds.has(look.id)) || [], [allLooks, likedIds]);

  const handleRemove = async (e: React.MouseEvent, lookId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!tgUser || !firebaseUser) return;
    setRemovingId(lookId);
    try {
      await deleteDoc(doc(db, 'users', tgUser.id, 'liked_looks', lookId));
    } catch (err) { console.error(err); }
    finally { setRemovingId(null); }
  };

  if (looksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin neon-text" />
      </div>
    );
  }

  if (!tgUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <Heart className="w-14 h-14 neon-text mx-auto opacity-20" />
        <h1 className="text-lg font-black text-foreground uppercase">{t(dictionary.identificationRequired)}</h1>
        <Button asChild className="h-12 px-8 rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none">
          <a href="https://t.me/jamastore_aibot" target="_blank" rel="noopener noreferrer">
            <Send className="w-4 h-4 mr-2" /> Open in Telegram
          </a>
        </Button>
      </div>
    );
  }

  const formatPrice = (item: any) =>
    item.currency === 'UZS'
      ? `${new Intl.NumberFormat('uz-UZ').format(item.price).replace(/,/g, ' ')} UZS`
      : `$${item.price}`;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">

        <FadeUp>
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-5 h-5 neon-text fill-current" />
            <h1 className="text-lg font-black text-foreground uppercase tracking-wide">
              {t(dictionary.favorites)}
            </h1>
            {myFavorites.length > 0 && (
              <span className="ml-auto text-xs font-bold text-foreground/40 uppercase tracking-widest">
                {myFavorites.length}
              </span>
            )}
          </div>
        </FadeUp>

        {myFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-28 text-center space-y-5"
          >
            <HeartOff className="w-12 h-12 text-foreground/10 mx-auto" />
            <p className="text-sm font-black text-foreground/30 uppercase tracking-widest">
              {t(dictionary.repositoryEmpty)}
            </p>
            <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-foreground/10 font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all">
              <Link href="/looks">{t(dictionary.browseLooks)}</Link>
            </Button>
          </motion.div>
        ) : (
          <StaggerContainer className="space-y-3">
            <AnimatePresence>
              {myFavorites.map((look) => (
                <StaggerItem key={look.id}>
                  <motion.div
                    exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(removingId === look.id && 'pointer-events-none')}
                  >
                    <Link
                      href={`/looks/${look.id}`}
                      className="group flex gap-4 bg-secondary/30 rounded-[1.5rem] p-3 hover:bg-secondary/50 transition-all border border-transparent hover:border-foreground/5"
                    >
                      {/* Image */}
                      <div className="relative w-[110px] h-[130px] rounded-[1.1rem] overflow-hidden shrink-0 bg-foreground/5">
                        <Image
                          src={look.imageUrl || 'https://picsum.photos/seed/look/300/400'}
                          alt={look.name}
                          fill quality={90} sizes="110px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full neon-bg text-white text-[10px] font-black shadow-lg">
                          {formatPrice(look)}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-grow flex flex-col justify-between py-1 min-w-0">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight truncate">
                            {look.name}
                          </h3>
                          {look.description && (
                            <p className="text-xs text-foreground/50 font-medium leading-relaxed line-clamp-2">
                              {look.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {/* Unlike */}
                          <button
                            onClick={(e) => handleRemove(e, look.id)}
                            className="w-9 h-9 rounded-full border border-foreground/10 flex items-center justify-center text-foreground/40 hover:border-destructive/40 hover:text-destructive transition-all"
                          >
                            {removingId === look.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <HeartOff className="w-4 h-4" />}
                          </button>
                          {/* Go */}
                          <div className="ml-auto w-9 h-9 rounded-full neon-bg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
