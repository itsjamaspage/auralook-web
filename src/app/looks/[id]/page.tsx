
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
import { 
  Loader2, 
  ChevronLeft,
  Ruler,
  Phone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Send,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { notifyAdminOfOrder, notifyCustomerOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { cn } from '@/lib/utils';

type CheckoutStep = 'ASK_KNOWLEDGE' | 'CHOOSE_SIZE' | 'ENTER_MEASUREMENTS' | 'CONTACT';

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
  const [step, setStep] = useState<CheckoutStep>('ASK_KNOWLEDGE');
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [country, setCountry] = useState('UZB');
  
  const [orderDetails, setOrderDetails] = useState({
    height: '',
    weight: '',
    phone: '+998 ',
    telegram: ''
  });

  // IDENTITY RECOGNITION PROTOCOL
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
    if (!firebaseUser || !look) return;
    setIsAddingToCart(true);
    try {
      const cartItemRef = doc(db, 'users', firebaseUser.uid, 'cart', look.id);
      await setDoc(cartItemRef, {
        lookId: look.id,
        name: look.name,
        imageUrl: look.imageUrl,
        price: look.price,
        currency: look.currency || 'USD',
        addedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground font-mono text-[10px] uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-foreground/40 uppercase font-black italic">Look not found</div>;

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
        size: selectedSize || `M (${t(dictionary.managerAdviceLabel)})`,
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

      await notifyAdminOfOrder(notificationInput);
      await notifyCustomerOfOrder(notificationInput);

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
    <div className="min-h-screen lg:min-h-[calc(100vh-100px)] bg-background text-foreground flex items-start lg:items-center justify-center py-6 lg:py-4">
      <div className="container mx-auto px-4 max-w-5xl relative pb-10 lg:pb-0">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-center relative z-10">
          
          <div className="lg:col-span-5 flex flex-col relative mx-auto w-full max-w-md">
            <div className="absolute -top-10 left-0 z-20">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-full w-10 h-10 p-0 border border-foreground/10 glass-surface hover:neon-border text-foreground transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden glass-surface border-foreground/10 shadow-2xl group bg-muted/20">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col h-full justify-center">
            <div className="space-y-6 lg:space-y-8 glass-surface border-foreground/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">
                    {look.currency === 'UZS' ? `${formatPrice(look.price)}` : `$${formatPrice(look.price)}`}
                  </span>
                  <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em]">{look.currency || 'USD'}</span>
                </div>
                <h1 className="text-xl lg:text-2xl font-black neon-text italic uppercase tracking-tight leading-tight">{look.name}</h1>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.2em]">{t(dictionary.technicalDetails)}</p>
                <div className="text-sm text-foreground/80 font-medium italic leading-relaxed whitespace-pre-line">
                  {look.description}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-14 lg:h-16 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-[0.2em] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t(dictionary.executePurchase)}
                  <ArrowRight className="ml-2 w-5 h-5 lg:w-6 lg:h-6 text-black" />
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  variant="outline"
                  className="w-full h-14 lg:h-16 rounded-2xl border-foreground/10 text-foreground font-black text-sm uppercase tracking-[0.2em] hover:neon-border transition-all"
                >
                  {isAddingToCart ? <Loader2 className="animate-spin" /> : (
                    <>
                      <ShoppingCart className="mr-2 w-5 h-5" />
                      {t(dictionary.addToCart)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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

          {step === 'ASK_KNOWLEDGE' && (
            <div className="space-y-8 py-2">
              <h3 className="text-lg font-bold text-center italic text-foreground">{t(dictionary.knowSizeQuestion)}</h3>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => setStep('CHOOSE_SIZE')}
                  variant="outline"
                  className="h-14 rounded-2xl border-foreground/10 hover:neon-border hover:neon-text font-black uppercase text-xs text-foreground"
                >
                  {t(dictionary.yesIKnow)}
                </Button>
                <Button 
                  onClick={() => setStep('ENTER_MEASUREMENTS')}
                  variant="outline"
                  className="h-14 rounded-2xl border-foreground/10 hover:neon-border hover:neon-text font-black uppercase text-xs text-foreground"
                >
                  {t(dictionary.noHelpMe)}
                </Button>
              </div>
            </div>
          )}

          {step === 'CHOOSE_SIZE' && (
            <div className="space-y-8 py-2">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <CheckCircle2 className="w-4 h-4 neon-text" />
                <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.selectSizeTitle)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-12 rounded-xl text-xs font-black transition-all border flex items-center justify-center",
                      selectedSize === size ? 'neon-bg border-none text-black animate-pop' : 'bg-foreground/5 border-foreground/10 text-foreground hover:border-foreground/30'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setStep('CONTACT')}
                disabled={!selectedSize}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black uppercase tracking-widest mt-4"
              >
                {t(dictionary.nextStep)}
              </Button>
            </div>
          )}

          {step === 'ENTER_MEASUREMENTS' && (
            <div className="space-y-8 py-2">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Ruler className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.enterMeasurementsTitle)}</p>
                </div>
                <div className="flex items-start gap-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground italic font-bold leading-relaxed">
                    {t(dictionary.managerAdvisory)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground">Bo'y (cm)</Label>
                  <Input 
                    type="number" 
                    placeholder="175"
                    value={orderDetails.height}
                    onChange={(e) => setOrderDetails({...orderDetails, height: e.target.value})}
                    className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-foreground">Vazn (kg)</Label>
                  <Input 
                    type="number" 
                    placeholder="70"
                    value={orderDetails.weight}
                    onChange={(e) => setOrderDetails({...orderDetails, weight: e.target.value})}
                    className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground text-sm"
                  />
                </div>
              </div>
              <Button 
                onClick={() => setStep('CONTACT')}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black uppercase tracking-widest"
              >
                {t(dictionary.nextStep)}
              </Button>
            </div>
          )}

          {step === 'CONTACT' && (
            <div className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Globe className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.countryLabel)}</p>
                </div>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground text-sm uppercase font-bold tracking-widest">
                    <SelectValue placeholder={t(dictionary.selectPlaceholder)} />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-foreground/10 text-foreground">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-foreground hover:bg-foreground/10">
                        {c.name} ({c.dial})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.phoneNumber)}</p>
                </div>
                <Input 
                  placeholder="+998 90 123 45 67"
                  value={orderDetails.phone}
                  onChange={handlePhoneChange}
                  className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Send className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.telegramUsername)}</p>
                </div>
                <Input 
                  placeholder={t(dictionary.telegramPlaceholder)}
                  value={orderDetails.telegram}
                  onChange={(e) => setOrderDetails({...orderDetails, telegram: e.target.value})}
                  className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground text-sm"
                />
              </div>

              <Button 
                onClick={handlePurchase}
                disabled={isOrdering || orderDetails.phone.length < 17 || !orderDetails.telegram}
                className="w-full h-14 sm:h-16 rounded-2xl neon-bg text-black font-black uppercase tracking-[0.2em] mt-2"
              >
                {isOrdering ? <Loader2 className="animate-spin text-black" /> : t(dictionary.executePurchase)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
