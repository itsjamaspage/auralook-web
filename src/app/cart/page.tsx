
"use client"

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Trash2, ShoppingCart, ArrowRight, CheckCircle2, Phone, Send, Ruler, Sparkles, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { notifyAdminOfOrder, notifyCustomerOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';

type CheckoutStep = 'CHOOSE_SIZE' | 'ENTER_MEASUREMENTS' | 'CONTACT';

export default function CartPage() {
  const db = useFirestore();
  const { user: tgUser, isVerified } = useTelegramUser();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary, lang } = useLanguage();
  const router = useRouter();

  const [showCheckout, setShowCheckout] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('CHOOSE_SIZE');
  const [selectedSize, setSelectedSize] = useState('M');
  const [orderDetails, setOrderDetails] = useState({
    height: '',
    weight: '',
    phone: '+998 ',
    telegram: ''
  });

  const cartQuery = useMemoFirebase(() => {
    if (isUserLoading || !firebaseUser || !tgUser || !isVerified) return null;
    return collection(db, 'users', firebaseUser.uid, 'cart');
  }, [db, tgUser, firebaseUser, isUserLoading, isVerified]);

  const { data: cartItems, isLoading } = useCollection(cartQuery ?? undefined);

  const totals = useMemo(() => {
    if (!cartItems) return { usd: 0, uzs: 0 };
    return cartItems.reduce((acc, item) => {
      const price = Number(item.price || 0);
      if (item.currency === 'UZS') acc.uzs += price;
      else acc.usd += price;
      return acc;
    }, { usd: 0, uzs: 0 });
  }, [cartItems]);

  const handleRemove = async (itemId: string) => {
    if (!firebaseUser) return;
    try {
      await deleteDoc(doc(db, 'users', firebaseUser.uid, 'cart', itemId));
    } catch (e) { console.error(e); }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val).replace(/,/g, ' ');
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

  const handleCheckout = async () => {
    if (orderDetails.phone.length < 17 || !orderDetails.telegram || !firebaseUser || !cartItems) return;

    setIsOrdering(true);
    try {
      const timestamp = new Date().toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
      
      for (const item of cartItems) {
        const orderData = {
          userId: firebaseUser.uid,
          firebaseUid: firebaseUser.uid,
          customerName: tgUser?.firstName || orderDetails.telegram,
          orderDate: new Date().toISOString(),
          status: 'New',
          totalAmount: item.price,
          currency: item.currency || 'USD',
          lookId: item.lookId,
          lookName: item.name,
          lookImageUrl: item.imageUrl,
          size: selectedSize || `M (${t(dictionary.managerAdviceLabel)})`,
          phoneNumber: orderDetails.phone,
          telegramUsername: orderDetails.telegram,
          measurements: {
            height: orderDetails.height || 'Noma\'lum',
            weight: orderDetails.weight || 'Noma\'lum',
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        // Bilateral Notification Protocol
        const notificationInput = {
          customerName: orderData.customerName,
          orderId: docRef.id,
          currentStatus: 'New' as const,
          productName: item.name,
          phoneNumber: orderData.phoneNumber,
          telegramUsername: orderData.telegramUsername,
          customerTelegramId: tgUser?.telegramId, // Critical for customer bot message
          imageUrl: item.imageUrl,
          language: 'uz' as const,
          timestamp: timestamp,
          physique: {
            height: orderDetails.height || undefined,
            weight: orderDetails.weight || undefined,
            size: orderData.size,
          }
        };

        await notifyAdminOfOrder(notificationInput);
        await notifyCustomerOfOrder(notificationInput);

        // Clear item from cart
        await deleteDoc(doc(db, 'users', firebaseUser.uid, 'cart', item.id));
      }

      toast({ title: t(dictionary.orderSuccessTitle), description: t(dictionary.orderSuccessDescription) });
      setShowCheckout(false);
      router.push('/orders');
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: t(dictionary.errorTitle) });
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground font-mono text-xs uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center space-y-6">
        <ShoppingCart className="w-16 h-16 neon-text mx-auto opacity-20" />
        <h1 className="text-xl font-black text-foreground uppercase italic">{t(dictionary.emptyCart)}</h1>
        <Button asChild variant="outline" className="rounded-xl border-foreground/10 text-foreground">
          <Link href="/looks">{t(dictionary.browseLooks)}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 space-y-8 min-h-screen pb-48">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 neon-text" />
        <h1 className="text-2xl font-black text-foreground italic uppercase tracking-tight">
          {t(dictionary.cart)}
        </h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="glass-surface border-foreground/10 p-4 rounded-[2rem] flex items-center gap-4 group">
              <div className="relative w-20 h-24 sm:w-24 sm:h-32 shrink-0 rounded-xl overflow-hidden border border-foreground/10 bg-muted/20">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-grow space-y-1">
                <h3 className="text-sm font-black text-foreground uppercase italic truncate">{item.name}</h3>
                <p className="neon-text font-black tracking-tighter">
                  {item.currency === 'UZS' ? `${formatPrice(item.price)} UZS` : `$${item.price}`}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemove(item.id)}
                className="text-foreground/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-4">
          <Card className="glass-surface border-foreground/10 p-10 rounded-[3rem] space-y-10 sticky top-24 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{t(dictionary.total)}</h2>
            
            <div className="space-y-6 pt-6 border-t border-foreground/5">
              {totals.usd > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.2em]">USD</span>
                  <span className="text-3xl font-black text-foreground tracking-tighter">${totals.usd}</span>
                </div>
              )}
              {totals.uzs > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.2em]">UZS</span>
                  <span className="text-3xl font-black neon-text tracking-tighter">{formatPrice(totals.uzs)}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={() => setShowCheckout(true)}
              className="w-full h-20 rounded-[2rem] neon-bg text-black font-black uppercase tracking-[0.15em] border-none shadow-[0_0_40px_var(--sync-shadow)] hover:scale-105 transition-transform text-lg"
            >
              {t(dictionary.checkout)}
              <ArrowRight className="ml-3 w-6 h-6 stroke-[3px]" />
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="glass-surface border-foreground/10 rounded-[2.5rem] text-foreground p-8 max-w-[90vw] sm:max-w-md mx-auto shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase neon-text flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              {t(dictionary.checkoutTitle)}
            </DialogTitle>
          </DialogHeader>

          {checkoutStep === 'CHOOSE_SIZE' && (
            <div className="space-y-8 py-2">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <CheckCircle2 className="w-4 h-4 neon-text" />
                <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.selectSizeTitle)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-xl text-xs font-black transition-all border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none text-black animate-pop' : 'bg-foreground/5 border-foreground/10 text-foreground hover:border-foreground/30'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setCheckoutStep('ENTER_MEASUREMENTS')}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black uppercase tracking-widest mt-4"
              >
                {t(dictionary.nextStep)}
              </Button>
            </div>
          )}

          {checkoutStep === 'ENTER_MEASUREMENTS' && (
            <div className="space-y-8 py-2">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Ruler className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.enterMeasurementsTitle)}</p>
                </div>
                <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground italic font-bold leading-relaxed">{t(dictionary.managerAdvisory)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground">Bo'y (cm)</Label>
                  <Input type="number" placeholder="175" value={orderDetails.height} onChange={(e) => setOrderDetails({...orderDetails, height: e.target.value})} className="bg-foreground/5 border-foreground/10 h-12 rounded-xl text-foreground focus:neon-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground">Vazn (kg)</Label>
                  <Input type="number" placeholder="70" value={orderDetails.weight} onChange={(e) => setOrderDetails({...orderDetails, weight: e.target.value})} className="bg-foreground/5 border-foreground/10 h-12 rounded-xl text-foreground focus:neon-border" />
                </div>
              </div>
              <Button onClick={() => setCheckoutStep('CONTACT')} className="w-full h-14 rounded-2xl neon-bg text-black font-black uppercase tracking-widest">{t(dictionary.nextStep)}</Button>
            </div>
          )}

          {checkoutStep === 'CONTACT' && (
            <div className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.phoneNumber)}</p>
                </div>
                <Input placeholder="+998 90 123 45 67" value={orderDetails.phone} onChange={handlePhoneChange} className="bg-foreground/5 border-foreground/10 h-12 rounded-xl text-foreground focus:neon-border" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Send className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.telegramUsername)}</p>
                </div>
                <Input placeholder={t(dictionary.telegramPlaceholder)} value={orderDetails.telegram} onChange={(e) => setOrderDetails({...orderDetails, telegram: e.target.value})} className="bg-foreground/5 border-foreground/10 h-12 rounded-xl text-foreground focus:neon-border" />
              </div>
              <Button onClick={handleCheckout} disabled={isOrdering || orderDetails.phone.length < 17 || !orderDetails.telegram} className="w-full h-14 sm:h-16 rounded-2xl neon-bg text-black font-black uppercase tracking-[0.2em] mt-2 shadow-2xl">
                {isOrdering ? <Loader2 className="animate-spin text-black" /> : t(dictionary.executePurchase)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
