"use client"

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Star, User2, EyeOff, Loader2, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUser, useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

function StarRow({
  value,
  interactive = false,
  size = 'sm',
  hoverValue = 0,
  onSelect,
  onHover,
  onLeave,
}: {
  value: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  hoverValue?: number;
  onSelect?: (n: number) => void;
  onHover?: (n: number) => void;
  onLeave?: () => void;
}) {
  const sz = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6';
  const display = hoverValue || value;
  return (
    <div
      className={cn('flex gap-0.5', interactive && 'cursor-pointer')}
      onMouseLeave={onLeave}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            sz,
            'transition-colors duration-100',
            n <= display ? 'fill-current neon-text' : 'text-foreground/20'
          )}
          onClick={interactive ? () => onSelect?.(n) : undefined}
          onMouseEnter={interactive ? () => onHover?.(n) : undefined}
        />
      ))}
    </div>
  );
}

export function RatingsSection({ lookId }: { lookId: string }) {
  const { storage } = useFirebase();
  const { user: tgUser } = useTelegramUser();
  const { user: firebaseUser } = useUser();
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();

  const [ratings, setRatings] = useState<any[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(`/api/ratings?lookId=${encodeURIComponent(lookId)}`);
      if (res.ok) {
        const data = await res.json();
        setRatings(data.ratings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRatings(false);
    }
  }, [lookId]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const avgStars =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + (r.stars || 0), 0) / ratings.length
      : 0;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!stars || !firebaseUser) return;
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      if (photo && storage) {
        const storageRef = ref(storage, `ratings/${lookId}/${Date.now()}_photo`);
        await uploadBytes(storageRef, photo);
        photoUrl = await getDownloadURL(storageRef);
      }

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookId,
          stars,
          text: text.trim(),
          anonymous,
          photoUrl,
          userId: firebaseUser.uid,
          telegramId: tgUser?.telegramId ?? null,
          telegramUsername: anonymous ? null : (tgUser?.username ? `@${tgUser.username}` : null),
          telegramPhoto: anonymous ? null : (tgUser?.photoUrl ?? null),
          displayName: anonymous ? null : (tgUser?.firstName ?? null),
        }),
      });

      if (!res.ok) throw new Error('Submit failed');

      toast({ title: t(dictionary.ratingSubmitted) });
      setShowForm(false);
      setStars(0);
      setText('');
      setPhoto(null);
      setPhotoPreview(null);
      setAnonymous(false);
      await fetchRatings();
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: t(dictionary.errorTitle) });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: any) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d.seconds ? d.toDate() : new Date(d);
    return new Intl.DateTimeFormat('uz-UZ', { month: 'short', day: '2-digit' }).format(date);
  };

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <StarRow value={Math.round(avgStars)} size="md" />
          <span className="text-xs font-black text-foreground/50">
            {ratings.length > 0
              ? `${avgStars.toFixed(1)} · ${ratings.length} ${t(dictionary.ratingsLabel)}`
              : t(dictionary.noRatingsYet)}
          </span>
        </div>
        {firebaseUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm((v) => !v)}
            className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest neon-text hover:bg-foreground/5 border border-foreground/10"
          >
            {showForm ? t(dictionary.cancel) : t(dictionary.leaveRating)}
          </Button>
        )}
      </div>

      {/* Submit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-secondary/30 rounded-[1.5rem] p-4 border border-foreground/5 space-y-4">
              {/* Star picker */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                  {t(dictionary.rateThisLook)}
                </p>
                <StarRow
                  value={stars}
                  hoverValue={hoverStar}
                  interactive
                  size="lg"
                  onSelect={setStars}
                  onHover={setHoverStar}
                  onLeave={() => setHoverStar(0)}
                />
              </div>

              {/* Text */}
              <Textarea
                placeholder={t(dictionary.ratingPlaceholder)}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="bg-background/50 border-foreground/10 rounded-xl text-sm text-foreground resize-none focus:neon-border"
              />

              {/* Photo upload */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl border flex items-center justify-center transition-all',
                      photo
                        ? 'neon-border neon-text'
                        : 'border-foreground/10 text-foreground/40 hover:border-foreground/30'
                    )}
                  >
                    <ImagePlus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide">
                    {t(dictionary.addPhoto)}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
                {photoPreview && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                    <Image src={photoPreview} alt="preview" fill className="object-cover" sizes="48px" />
                    <button
                      onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Anonymous toggle */}
              <button
                onClick={() => setAnonymous((v) => !v)}
                className="flex items-center gap-2.5 w-full text-left"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl border flex items-center justify-center transition-all shrink-0',
                    anonymous ? 'neon-border neon-text' : 'border-foreground/10 text-foreground/40'
                  )}
                >
                  {anonymous ? <EyeOff className="w-4 h-4" /> : <User2 className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">
                    {anonymous ? t(dictionary.anonymous) : t(dictionary.showProfile)}
                  </p>
                  <p className="text-[9px] text-foreground/40">
                    {anonymous ? t(dictionary.anonymousHint) : t(dictionary.showProfileHint)}
                  </p>
                </div>
              </button>

              <Button
                onClick={handleSubmit}
                disabled={!stars || submitting}
                className="w-full h-11 rounded-2xl neon-bg text-white font-black text-xs uppercase tracking-widest"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t(dictionary.submitRating)}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {ratings.length > 0 && (
        <div className="space-y-3">
          {ratings.map((r) => (
            <div
              key={r.id}
              className="bg-secondary/20 rounded-[1.25rem] p-3.5 border border-foreground/5 space-y-2"
            >
              <div className="flex items-start gap-2.5">
                {!r.anonymous && r.telegramPhoto ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-foreground/10">
                    <Image src={r.telegramPhoto} alt="avatar" fill className="object-cover" sizes="32px" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center shrink-0">
                    <User2 className="w-4 h-4 text-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-foreground truncate">
                      {r.anonymous
                        ? t(dictionary.anonymous)
                        : r.telegramUsername || r.displayName || t(dictionary.anonymous)}
                    </p>
                    <span className="text-[9px] text-foreground/30 shrink-0">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarRow value={r.stars || 0} size="sm" />
                </div>
              </div>
              {r.text && (
                <p className="text-xs text-foreground/70 font-medium leading-relaxed">{r.text}</p>
              )}
              {r.photoUrl && (
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '4/3', maxHeight: 200 }}>
                  <Image
                    src={r.photoUrl}
                    alt="review photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) calc(100vw - 56px), 600px"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
