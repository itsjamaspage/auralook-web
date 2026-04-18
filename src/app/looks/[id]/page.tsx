
"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import {
  Loader2,
  ChevronLeft,
  Ruler,
  Phone,
  CheckCircle2,
  ArrowRight,
  Send,
  Globe,
  ShoppingCart,
  Link as LinkIcon,
  Maximize2,
  ZoomIn,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { notifyAdminOfOrder, notifyCustomerOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { cn } from '@/lib/utils';
import { getProductDeepLink } from '@/lib/telegram-link';
import { StaggerContainer, StaggerItem, FadeUp } from '@/components/motion-reveal';
import { RatingsSection } from '@/components/ratings-section';

type CheckoutStep = 'ENTER_MEASUREMENTS' | 'CONTACT';

const COUNTRIES = [
  { name: "O'zbekiston", code: 'UZB', dial: '+998' },
];

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary, lang } = useLanguage();
  const { toast } = useToast();
  const db = useFirestore();
  const router = useRouter();
  const { user: tgUser, isVerified } = useTelegramUser();
  const { user: firebaseUser } = useUser();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [pinchStart, setPinchStart] = useState<{ dist: number; scale: number } | null>(null);
  const [step, setStep] = useState<CheckoutStep>('ENTER_MEASUREMENTS');
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedShoeSize, setSelectedShoeSize] = useState('');
  const [showShoeSize, setShowShoeSize] = useState(false);
  const [country, setCountry] = useState('UZB');

  const [orderDetails, setOrderDetails] = useState({
    height: '',
    weight: '',
    phone: '+998 ',
    telegram: ''
  });

  useEffect(() => {
    if (tgUser && isVerified) {
      setOrderDetails(prev => ({
        ...prev,
        telegram: tgUser.username ? `@${tgUser.username.replace('@', '')}` : prev.telegram,
        phone: tgUser.phone || prev.phone || '+998 '
      }));
    }
  }, [tgUser, isVerified]);

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  // Related looks — latest 4 excluding current
  const relatedQuery = useMemoFirebase(
    () => query(collection(db, 'looks'), orderBy('createdAt', 'desc'), limit(5)),
    [db]
  );
  const { data: relatedRaw } = useCollection(relatedQuery);
  const relatedLooks = relatedRaw?.filter(l => l.id !== id).slice(0, 4) ?? [];

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US').format(val).replace(/,/g, ' ');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith('+998')) {
      setOrderDetails(prev => ({ ...prev, phone: '+998 ' }));
      return;
    }
    const digits = val.substring(4).replace(/\D/g, '').substring(0, 9);
    let res = '+998';
    if (digits.length > 0) res += ' ' + digits.substring(0, 2);
    if (digits.length > 2) res += ' ' + digits.substring(2, 5);
    if (digits.length > 5) res += ' ' + digits.substring(5, 7);
    if (digits.length > 7) res += ' ' + digits.substring(7, 9);
    setOrderDetails(prev => ({ ...prev, phone: res }));
  };

  const handleAddToCart = async () => {
    if (!tgUser || !look) return;
    setIsAddingToCart(true);
    try {
      const cartItemRef = doc(db, 'users', tgUser.id, 'cart', look.id);
      await setDoc(cartItemRef, {
        lookId: look.id,
        name: look.name,
        imageUrl: look.imageUrl,
        price: look.price,
        currency: look.currency || 'USD',
        hasShoe: look.hasShoe || false,
        addedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: t(dictionary.addedToCart) });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCopyLink = () => {
    const link = getProductDeepLink(id);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Direct link to this outfit is in your clipboard."
    });
  };

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin neon-text" />
        <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!look) return (
    <div className="p-16 text-center text-foreground/40 uppercase font-black text-sm">Look not found</div>
  );

  const handlePurchase = async () => {
    if (orderDetails.phone.length < 17 || !orderDetails.telegram) {
      toast({
        variant: "destructive",
        title: t(dictionary.missingInformation),
        description: t(dictionary.phoneAndTelegramRequired)
      });
      return;
    }

    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: t(dictionary.identityPendingTitle),
        description: t(dictionary.identityPendingDescription)
      });
      return;
    }

    setIsOrdering(true);
    try {
      const timestamp = new Date().toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
      const orderData = {
        userId: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        customerName: tgUser?.firstName || orderDetails.telegram,
        orderDate: new Date().toISOString(),
        status: 'New',
        totalAmount: look.price,
        currency: look.currency || 'USD',
        lookId: look.id,
        lookName: look.name,
        lookImageUrl: look.imageUrl,
        size: selectedSize || 'M',
        ...(showShoeSize && selectedShoeSize && { shoeSize: selectedShoeSize }),
        phoneNumber: orderDetails.phone,
        telegramUsername: orderDetails.telegram,
        country: 'UZB',
        shippingAddress: t(dictionary.tashkentDirectContact),
        measurements: {
          height: orderDetails.height || 'Noma\'lum',
          weight: orderDetails.weight || 'Noma\'lum',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      const notificationInput = {
        customerName: orderData.customerName,
        orderId: docRef.id,
        lookId: look.id,
        currentStatus: 'New' as const,
        productName: look.name,
        phoneNumber: orderData.phoneNumber,
        telegramUsername: orderData.telegramUsername,
        customerTelegramId: tgUser?.telegramId,
        imageUrl: look.imageUrl,
        language: 'uz' as const,
        timestamp: timestamp,
        physique: {
          height: orderDetails.height || undefined,
          weight: orderDetails.weight || undefined,
          size: orderData.size,
        }
      };

      const shoeSize = showShoeSize && selectedShoeSize ? selectedShoeSize : undefined;
      await notifyAdminOfOrder(notificationInput);
      await notifyCustomerOfOrder({ ...notificationInput, shoeSize });

      toast({
        title: t(dictionary.orderSuccessTitle),
        description: t(dictionary.orderSuccessDescription),
      });
      setShowCheckout(false);
      router.push('/orders');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: t(dictionary.errorTitle),
        description: t(dictionary.errorDescription),
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">

        {/* Back + share buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full w-10 h-10 bg-secondary/50 hover:bg-secondary border-none text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyLink}
            className="rounded-full w-10 h-10 bg-secondary/50 hover:bg-secondary border-none text-foreground"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Hero image — full-width, tall */}
        <div
          className="relative rounded-[2rem] overflow-hidden mb-5 cursor-zoom-in shadow-xl group"
          style={{ aspectRatio: '3/4', maxHeight: '70vh' }}
          onClick={() => setShowFullscreen(true)}
        >
          <Image
            src={look.imageUrl}
            alt={look.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            quality={100}
            sizes="(max-width: 672px) calc(100vw - 32px), 640px"
          />
          <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Info card */}
        <div className="bg-secondary/30 rounded-[1.5rem] p-5 space-y-4 mb-4 border border-foreground/5">
          {/* Price + name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground tracking-tighter">
                {look.currency === 'UZS' ? formatPrice(look.price) : `$${formatPrice(look.price)}`}
              </span>
              <span className="text-xs font-black text-foreground/40 uppercase tracking-wider">{look.currency || 'USD'}</span>
            </div>
            <h1 className="text-lg font-black neon-text italic uppercase tracking-tight leading-snug">
              {look.name}
            </h1>
          </div>

          {/* Divider */}
          <div className="h-px bg-foreground/5" />

          {/* Description */}
          {look.description && (
            <div className="space-y-1">
              <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em]">
                {t(dictionary.technicalDetails)}
              </p>
              <p className="text-sm text-foreground/70 font-medium leading-relaxed whitespace-pre-line">
                {look.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {look.tags && look.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {look.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-foreground/5 rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowCheckout(true)}
            className="w-full h-14 rounded-2xl neon-bg text-white font-black text-xs uppercase tracking-widest border-none transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
          >
            {t(dictionary.executePurchase)}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            variant="outline"
            className="w-full h-14 rounded-2xl border-foreground/10 bg-secondary/30 text-foreground font-black text-xs uppercase tracking-widest hover:neon-border transition-all"
          >
            {isAddingToCart ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <ShoppingCart className="mr-2 w-4 h-4" />
                {t(dictionary.addToCart)}
              </>
            )}
          </Button>
        </div>

        {/* ── RATINGS ── */}
        <RatingsSection lookId={id} />

        {/* ── RELATED LOOKS ── */}
        {relatedLooks.length > 0 && (
          <div className="mt-8">
            <FadeUp>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground/50 mb-4">
                You may also like
              </h2>
            </FadeUp>
            <StaggerContainer className="grid grid-cols-2 gap-3">
              {relatedLooks.map((rel) => (
                <StaggerItem key={rel.id}>
                  <Link
                    href={`/looks/${rel.id}`}
                    className="group block bg-secondary/30 rounded-[1.3rem] overflow-hidden border border-foreground/5 hover:border-foreground/10 transition-all"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-[1.3rem]">
                      <Image
                        src={rel.imageUrl}
                        alt={rel.name}
                        fill quality={80}
                        sizes="(max-width: 672px) 50vw, 200px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2.5 space-y-0.5">
                      <h3 className="text-xs font-bold text-foreground truncate uppercase tracking-tight">{rel.name}</h3>
                      <p className="text-xs font-black neon-text">
                        {rel.currency === 'UZS'
                          ? `${new Intl.NumberFormat('uz-UZ').format(rel.price).replace(/,/g, ' ')} UZS`
                          : `$${rel.price}`}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </div>

      {/* Fullscreen image viewer with zoom */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => { setShowFullscreen(false); setZoomScale(1); setPinchStart(null); }}
        >
          {/* Close button */}
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center z-10"
            onClick={() => { setShowFullscreen(false); setZoomScale(1); setPinchStart(null); }}
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Zoom hint */}
          {zoomScale === 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full pointer-events-none">
              <ZoomIn className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold sm:block hidden">Hold to zoom</span>
              <span className="text-white text-xs font-bold sm:hidden">Pinch to zoom</span>
            </div>
          )}

          {/* Image container */}
          <div
            className="relative w-full h-full overflow-hidden select-none"
            style={{
              cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in',
              touchAction: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomOrigin({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
              setZoomScale(2.5);
            }}
            onMouseMove={(e) => {
              if (zoomScale <= 1) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomOrigin({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
            onMouseUp={() => setZoomScale(1)}
            onMouseLeave={() => setZoomScale(1)}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                setPinchStart({ dist, scale: zoomScale });
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && pinchStart) {
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                const newScale = Math.min(4, Math.max(1, pinchStart.scale * (dist / pinchStart.dist)));
                const rect = e.currentTarget.getBoundingClientRect();
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                setZoomOrigin({
                  x: ((midX - rect.left) / rect.width) * 100,
                  y: ((midY - rect.top) / rect.height) * 100,
                });
                setZoomScale(newScale);
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) {
                setPinchStart(null);
                if (zoomScale < 1.2) setZoomScale(1);
              }
            }}
          >
            <Image
              src={look.imageUrl}
              alt={look.name}
              fill
              quality={100}
              sizes="100vw"
              priority
              draggable={false}
              style={{
                objectFit: 'contain',
                transform: `scale(${zoomScale})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transition: zoomScale === 1 && !pinchStart ? 'transform 0.3s ease' : 'none',
                userSelect: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="bg-background border border-foreground/10 rounded-[2rem] text-foreground p-6 max-w-[92vw] sm:max-w-md mx-auto shadow-2xl">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-xl font-black italic uppercase neon-text flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {t(dictionary.checkoutTitle)}
            </DialogTitle>
          </DialogHeader>

          {step === 'ENTER_MEASUREMENTS' && (
            <div className="space-y-5 py-1">
              {/* Height + Weight */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.enterMeasurementsTitle)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-foreground/50">{t(dictionary.heightShortLabel)}</Label>
                    <Input type="number" placeholder="175" value={orderDetails.height}
                      onChange={(e) => setOrderDetails({...orderDetails, height: e.target.value})}
                      className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-foreground/50">{t(dictionary.weightShortLabel)}</Label>
                    <Input type="number" placeholder="70" value={orderDetails.weight}
                      onChange={(e) => setOrderDetails({...orderDetails, weight: e.target.value})}
                      className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
                  </div>
                </div>
              </div>

              {/* Shoe size toggle */}
              <div className="border border-foreground/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👟</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Poyabzal o'lchami (EUR)</p>
                  </div>
                  <button
                    onClick={() => { setShowShoeSize(v => !v); setSelectedShoeSize(''); }}
                    className={cn("relative w-11 h-6 rounded-full transition-all duration-200 shrink-0", showShoeSize ? 'neon-bg' : 'bg-foreground/20')}
                    aria-label="Toggle shoe size"
                  >
                    <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200", showShoeSize ? 'left-[1.375rem]' : 'left-0.5')} />
                  </button>
                </div>
                {showShoeSize && (
                  <div className="grid grid-cols-5 gap-2">
                    {['36','37','38','39','40','41','42','43','44','45'].map((size) => (
                      <button key={size} onClick={() => setSelectedShoeSize(size)}
                        className={cn("h-10 rounded-xl text-xs font-black transition-all border flex items-center justify-center",
                          selectedShoeSize === size ? 'neon-bg border-none text-white animate-pop' : 'bg-secondary/50 border-foreground/10 text-foreground hover:border-foreground/30')}
                      >{size}</button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={() => setStep('CONTACT')} className="w-full h-12 rounded-2xl neon-bg text-white font-black uppercase tracking-widest">
                {t(dictionary.nextStep)}
              </Button>
            </div>
          )}

          {step === 'CONTACT' && (
            <div className="space-y-5 py-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.countryLabel)}</p>
                </div>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-sm font-bold uppercase tracking-widest">
                    <SelectValue placeholder={t(dictionary.selectPlaceholder)} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-foreground/10 text-foreground">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-foreground">
                        {c.name} ({c.dial})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.phoneNumber)}</p>
                </div>
                <Input
                  placeholder="+998 90 123 45 67"
                  value={orderDetails.phone}
                  onChange={handlePhoneChange}
                  className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.telegramUsername)}</p>
                </div>
                <Input
                  placeholder={t(dictionary.telegramPlaceholder)}
                  value={orderDetails.telegram}
                  onChange={(e) => setOrderDetails({...orderDetails, telegram: e.target.value})}
                  className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-sm"
                />
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isOrdering || orderDetails.phone.length < 17 || !orderDetails.telegram}
                className="w-full h-14 rounded-2xl neon-bg text-white font-black uppercase tracking-widest mt-1"
              >
                {isOrdering ? <Loader2 className="animate-spin text-white" /> : t(dictionary.executePurchase)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
