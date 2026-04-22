"use client"

import { useState, useMemo, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2, ShoppingCart, ArrowRight, CheckCircle2, Phone, Send, Ruler } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { notifyAdminOfBatchOrder, notifyCustomerOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion-reveal';

type CheckoutStep = 'ENTER_MEASUREMENTS' | 'CONTACT';

export default function CartPage() {
  const db = useFirestore();
  const { user: tgUser, isVerified } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary, lang } = useLanguage();
  const router = useRouter();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('ENTER_MEASUREMENTS');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedShoeSize, setSelectedShoeSize] = useState('');
  const [showShoeSize, setShowShoeSize] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ height: '', weight: '', phone: '+998 ', telegram: '' });

  useEffect(() => {
    if (tgUser && isVerified) {
      setOrderDetails(prev => ({
        ...prev,
        telegram: tgUser.username ? `@${tgUser.username.replace('@', '')}` : prev.telegram,
        phone: tgUser.phone || prev.phone,
      }));
    }
  }, [tgUser, isVerified]);

  const cartQuery = useMemoFirebase(() => {
    if (isUserLoading || !tgUser || !isVerified) return null;
    return collection(db, 'users', tgUser.id, 'cart');
  }, [db, tgUser, isUserLoading, isVerified]);

  const { data: cartItems, isLoading } = useCollection(cartQuery ?? undefined);

  const totals = useMemo(() => {
    if (!cartItems) return { usd: 0, uzs: 0 };
    return cartItems.reduce((acc, item) => {
      if (item.currency === 'UZS') acc.uzs += Number(item.price || 0);
      else acc.usd += Number(item.price || 0);
      return acc;
    }, { usd: 0, uzs: 0 });
  }, [cartItems]);

  const handleRemove = async (itemId: string) => {
    if (!tgUser) return;
    await deleteDoc(doc(db, 'users', tgUser.id, 'cart', itemId)).catch(console.error);
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('uz-UZ').format(val).replace(/,/g, ' ');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith('+998')) { setOrderDetails(p => ({ ...p, phone: '+998 ' })); return; }
    const digits = val.substring(4).replace(/\D/g, '').substring(0, 9);
    let res = '+998';
    if (digits.length > 0) res += ' ' + digits.substring(0, 2);
    if (digits.length > 2) res += ' ' + digits.substring(2, 5);
    if (digits.length > 5) res += ' ' + digits.substring(5, 7);
    if (digits.length > 7) res += ' ' + digits.substring(7, 9);
    setOrderDetails(p => ({ ...p, phone: res }));
  };

  const handleCheckout = async () => {
    if (orderDetails.phone.length < 17 || !orderDetails.telegram || !tgUser || !firebaseUser || !cartItems) return;
    setIsOrdering(true);
    try {
      const timestamp = new Date().toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
      const orderIds: string[] = [];
      const itemsForAdmin: any[] = [];

      const shoeSize = showShoeSize && selectedShoeSize ? selectedShoeSize : undefined;

      for (const item of cartItems) {
        const orderData = {
          userId: firebaseUser.uid, firebaseUid: firebaseUser.uid, telegramId: tgUser.id,
          customerName: tgUser.firstName || orderDetails.telegram,
          orderDate: new Date().toISOString(), status: 'New',
          totalAmount: item.price, currency: item.currency || 'USD',
          lookId: item.lookId, lookName: item.name, lookImageUrl: item.imageUrl,
          size: selectedSize || 'M',
          ...(shoeSize && { shoeSize }),
          phoneNumber: orderDetails.phone, telegramUsername: orderDetails.telegram,
          createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          measurements: { height: orderDetails.height || "Noma'lum", weight: orderDetails.weight || "Noma'lum" },
        };
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        orderIds.push(docRef.id);
        itemsForAdmin.push({ productName: item.name, size: orderData.size, imageUrl: item.imageUrl, lookId: item.lookId, shoeSize });
        await notifyCustomerOfOrder({
          customerName: orderData.customerName, orderId: docRef.id, lookId: item.lookId,
          currentStatus: 'New', productName: item.name, phoneNumber: orderData.phoneNumber,
          telegramUsername: orderData.telegramUsername, customerTelegramId: tgUser.telegramId,
          imageUrl: item.imageUrl, language: 'uz', timestamp,
          physique: { height: orderDetails.height || undefined, weight: orderDetails.weight || undefined, size: orderData.size },
          shoeSize,
        });
        await deleteDoc(doc(db, 'users', tgUser.id, 'cart', item.id));
      }

      await notifyAdminOfBatchOrder({
        customerName: tgUser.firstName || orderDetails.telegram,
        telegramUsername: orderDetails.telegram, phoneNumber: orderDetails.phone,
        physique: { height: orderDetails.height, weight: orderDetails.weight },
        items: itemsForAdmin, timestamp, orderIds,
      });

      toast({ title: t(dictionary.orderSuccessTitle), description: t(dictionary.orderSuccessDescription) });
      setShowCheckout(false);
      router.push('/orders');
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: t(dictionary.errorTitle) });
    } finally { setIsOrdering(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin neon-text" /></div>;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-28 text-center space-y-5">
        <ShoppingCart className="w-12 h-12 text-foreground/10 mx-auto" />
        <p className="text-sm font-black text-foreground/30 uppercase tracking-widest">{t(dictionary.emptyCart)}</p>
        <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-foreground/10 font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all">
          <Link href="/looks">{t(dictionary.browseLooks)}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">

        <FadeUp>
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-5 h-5 neon-text" />
            <h1 className="text-lg font-black text-foreground uppercase tracking-wide">{t(dictionary.cart)}</h1>
            <span className="ml-auto text-xs font-bold text-foreground/40 uppercase tracking-widest">{cartItems.length}</span>
          </div>
        </FadeUp>

        {/* Cart items */}
        <StaggerContainer className="space-y-3 mb-6">
          <AnimatePresence>
            {cartItems.map((item) => (
              <StaggerItem key={item.id}>
                <motion.div exit={{ opacity: 0, x: -20, height: 0 }} transition={{ duration: 0.25 }}>
                  <div className="group flex gap-4 bg-secondary/30 rounded-[1.5rem] p-3 border border-foreground/5">
                    {/* Image */}
                    <div className="relative w-[90px] h-[110px] rounded-[1rem] overflow-hidden shrink-0 bg-foreground/5">
                      <Image src={item.imageUrl} alt={item.name} fill quality={80} sizes="90px" className="object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-grow flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight truncate">{item.name}</h3>
                        <p className="text-sm font-black neon-text mt-0.5">
                          {item.currency === 'UZS' ? `${formatPrice(item.price)} UZS` : `$${item.price}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex items-center gap-1.5 text-foreground/30 hover:text-destructive transition-colors w-fit mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </AnimatePresence>
        </StaggerContainer>

        {/* Total + checkout */}
        <FadeUp delay={0.1}>
          <div className="bg-secondary/30 rounded-[1.5rem] p-5 border border-foreground/5 space-y-4">
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.total)}</p>
            <div className="space-y-1">
              {totals.usd > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-foreground/50 uppercase">USD</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">${totals.usd}</span>
                </div>
              )}
              {totals.uzs > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-foreground/50 uppercase">UZS</span>
                  <span className="text-2xl font-black neon-text tracking-tight">{formatPrice(totals.uzs)}</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowCheckout(true)}
              className="w-full h-14 rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t(dictionary.checkout)} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </FadeUp>
      </div>

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="bg-background border border-foreground/10 rounded-[2rem] text-foreground p-6 max-w-[92vw] sm:max-w-md mx-auto shadow-2xl">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-black italic uppercase neon-text flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> {t(dictionary.checkoutTitle)}
            </DialogTitle>
          </DialogHeader>

          {checkoutStep === 'ENTER_MEASUREMENTS' && (
            <div className="space-y-5 py-1">
              {/* Height + Weight */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{t(dictionary.enterMeasurementsTitle)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-foreground/50">{t(dictionary.heightShortLabel)}</Label>
                    <Input type="number" placeholder="175" value={orderDetails.height} onChange={e => setOrderDetails(p => ({ ...p, height: e.target.value }))} className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-black text-foreground/50">{t(dictionary.weightShortLabel)}</Label>
                    <Input type="number" placeholder="70" value={orderDetails.weight} onChange={e => setOrderDetails(p => ({ ...p, weight: e.target.value }))} className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
                  </div>
                </div>
              </div>

              {/* Shoe size toggle */}
              <div className="border border-foreground/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👟</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Poyabzal o'lchami (EUR)</p>
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
                    {['36','37','38','39','40','41','42','43','44','45'].map(size => (
                      <button key={size} onClick={() => setSelectedShoeSize(size)}
                        className={cn("h-10 rounded-xl text-xs font-black transition-all border flex items-center justify-center",
                          selectedShoeSize === size ? 'neon-bg border-none text-white animate-pop' : 'bg-secondary/50 border-foreground/10 text-foreground hover:border-foreground/30')}
                      >{size}</button>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={() => setCheckoutStep('CONTACT')} className="w-full h-12 rounded-2xl neon-bg text-white font-black uppercase tracking-widest">{t(dictionary.nextStep)}</Button>
            </div>
          )}

          {checkoutStep === 'CONTACT' && (
            <div className="space-y-4 py-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 neon-text" /><p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{t(dictionary.phoneNumber)}</p></div>
                <Input placeholder="+998 90 123 45 67" value={orderDetails.phone} onChange={handlePhoneChange} className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Send className="w-4 h-4 neon-text" /><p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{t(dictionary.telegramUsername)}</p></div>
                <Input placeholder={t(dictionary.telegramPlaceholder)} value={orderDetails.telegram} onChange={e => setOrderDetails(p => ({ ...p, telegram: e.target.value }))} className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
              </div>
              <Button onClick={handleCheckout} disabled={isOrdering || orderDetails.phone.length < 17 || !orderDetails.telegram} className="w-full h-14 rounded-2xl neon-bg text-white font-black uppercase tracking-widest mt-1 shadow-xl">
                {isOrdering ? <Loader2 className="animate-spin text-white" /> : t(dictionary.executePurchase)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
