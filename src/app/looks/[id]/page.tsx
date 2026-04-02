
"use client"

import { use, useState } from 'react';
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
  Loader2, 
  Heart,
  ChevronLeft,
  Ruler,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { notifyAdminOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';

type CheckoutStep = 'ASK_KNOWLEDGE' | 'CHOOSE_SIZE' | 'ENTER_MEASUREMENTS' | 'CONTACT';

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('ASK_KNOWLEDGE');
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  
  const [orderDetails, setOrderDetails] = useState({
    height: '',
    weight: '',
    phone: '',
    address: ''
  });

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  const likedLookRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'liked_looks', id);
  }, [db, user, id]);
  const { data: likedLook } = useDoc(likedLookRef);

  const isLiked = !!likedLook;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">SYNCING REPOSITORY...</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-white/40 uppercase font-black italic">Look not found</div>;

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: t(dictionary.welcomeBack),
        description: t(dictionary.accessOrders),
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    if (!likedLookRef) return;

    try {
      if (isLiked) {
        await deleteDoc(likedLookRef);
      } else {
        await setDoc(likedLookRef, {
          lookId: id,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startCheckout = () => {
    if (!user) {
      toast({
        title: t(dictionary.welcomeBack),
        description: t(dictionary.accessOrders),
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
    setShowCheckout(true);
    setStep('ASK_KNOWLEDGE');
  };

  const handlePurchase = async () => {
    if (!orderDetails.phone) {
      toast({
        variant: "destructive",
        title: t(dictionary.phoneNumber),
        description: t(dictionary.phonePlaceholder)
      });
      return;
    }

    setIsOrdering(true);
    try {
      const orderData = {
        userId: user!.uid,
        customerName: user!.displayName || user!.email?.split('@')[0] || 'Customer',
        orderDate: new Date().toISOString(),
        status: 'New',
        totalAmount: look.price,
        currency: look.currency || 'USD',
        lookId: look.id,
        lookName: look.name,
        lookImageUrl: look.imageUrl,
        size: selectedSize || 'Tanlanmagan',
        phoneNumber: orderDetails.phone,
        shippingAddress: orderDetails.address || 'Tashkent',
        measurements: {
          height: orderDetails.height || 'Noma\'lum',
          weight: orderDetails.weight || 'Noma\'lum',
        },
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Trigger Telegram notification
      notifyAdminOfOrder({
        customerName: orderData.customerName,
        orderId: docRef.id,
        currentStatus: 'New',
        productName: look.name,
        phoneNumber: orderData.phoneNumber,
        imageUrl: look.imageUrl,
        language: 'uz',
        physique: {
          height: orderDetails.height || 'Noma\'lum',
          weight: orderDetails.weight || 'Noma\'lum',
          size: selectedSize || 'Noma\'lum',
        }
      });

      toast({
        title: "Buyurtma qabul qilindi",
        description: "Tez orada menejerimiz siz bilan bog'lanadi.",
      });
      setShowCheckout(false);
      router.push('/orders');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Tizimda xatolik yuz berdi. Qaytadan urunib ko'ring.",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-[calc(100vh-100px)] bg-background text-foreground flex items-center justify-center py-4">
      <div className="container mx-auto px-4 max-w-5xl relative">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
          
          <div className="lg:col-span-6 flex flex-col relative">
            <div className="absolute -top-10 left-0 z-20">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-full w-8 h-8 p-0 border border-white/10 glass-dark hover:neon-border text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative flex-grow aspect-[4/5] rounded-[2rem] overflow-hidden glass-dark border border-white/10 shadow-2xl group bg-[#080808]">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              <button 
                onClick={handleToggleLike}
                className={`absolute bottom-6 right-6 w-10 h-10 rounded-full glass-dark border flex items-center justify-center transition-all shadow-2xl z-20 hover:scale-110 ${isLiked ? 'neon-border neon-text bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col h-full justify-center">
            <div className="space-y-8 glass-dark border border-white/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl bg-white/[0.02]">
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {look.currency === 'UZS' ? `${formatPrice(look.price)}` : `$${formatPrice(look.price)}`}
                  </span>
                  <span className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{look.currency || 'USD'}</span>
                </div>
                <h1 className="text-xl font-black neon-text italic uppercase tracking-tight">{look.name}</h1>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t(dictionary.technicalDetails)}</p>
                <div className="text-sm lg:text-base text-white/80 font-medium italic leading-relaxed whitespace-pre-line">
                  {look.description}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  onClick={startCheckout}
                  className="w-full h-16 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-[0.2em] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t(dictionary.executePurchase)}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center">
                  {t(dictionary.secureCheckout)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="glass-dark border-white/10 rounded-[2.5rem] text-white p-8 max-w-md">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase neon-text flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Checkout
            </DialogTitle>
          </DialogHeader>

          {step === 'ASK_KNOWLEDGE' && (
            <div className="space-y-8 py-4">
              <h3 className="text-lg font-bold text-center italic">{t(dictionary.knowSizeQuestion)}</h3>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => setStep('CHOOSE_SIZE')}
                  className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:neon-border hover:neon-text font-black uppercase text-xs"
                >
                  {t(dictionary.yesIKnow)}
                </Button>
                <Button 
                  onClick={() => setStep('ENTER_MEASUREMENTS')}
                  className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:neon-border hover:neon-text font-black uppercase text-xs"
                >
                  {t(dictionary.noHelpMe)}
                </Button>
              </div>
            </div>
          )}

          {step === 'CHOOSE_SIZE' && (
            <div className="space-y-8 py-4">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <CheckCircle2 className="w-4 h-4 neon-text" />
                <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.selectSizeTitle)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-xl text-xs font-black transition-all border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
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
            <div className="space-y-8 py-4">
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 text-white/40">
                  <Ruler className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.enterMeasurementsTitle)}</p>
                </div>
                <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-white/90 italic font-bold leading-relaxed">
                    {t(dictionary.managerAdvisory)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-white/40">Bo'y (cm)</Label>
                  <Input 
                    type="number" 
                    placeholder="175"
                    value={orderDetails.height}
                    onChange={(e) => setOrderDetails({...orderDetails, height: e.target.value})}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black text-white/40">Vazn (kg)</Label>
                  <Input 
                    type="number" 
                    placeholder="70"
                    value={orderDetails.weight}
                    onChange={(e) => setOrderDetails({...orderDetails, weight: e.target.value})}
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
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
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/40">
                  <Phone className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.phoneNumber)}</p>
                </div>
                <Input 
                  placeholder={t(dictionary.phonePlaceholder)}
                  value={orderDetails.phone}
                  onChange={(e) => setOrderDetails({...orderDetails, phone: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/40">
                  <MapPin className="w-4 h-4 neon-text" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.shippingAddress)} (Ixtiyoriy)</p>
                </div>
                <Input 
                  placeholder={t(dictionary.addressPlaceholder)}
                  value={orderDetails.address}
                  onChange={(e) => setOrderDetails({...orderDetails, address: e.target.value})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
                />
              </div>

              <Button 
                onClick={handlePurchase}
                disabled={isOrdering || !orderDetails.phone}
                className="w-full h-16 rounded-2xl neon-bg text-black font-black uppercase tracking-[0.2em]"
              >
                {isOrdering ? <Loader2 className="animate-spin" /> : t(dictionary.executePurchase)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
