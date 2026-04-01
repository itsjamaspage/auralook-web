"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  Heart,
  ChevronLeft,
  Ruler
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { notifyAdminOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [mounted, setMounted] = useState(false);
  
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    knownSize: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  const likedLookRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'liked_looks', id);
  }, [db, user, id]);
  const { data: likedLook } = useDoc(likedLookRef);

  const isLiked = !!likedLook;

  if (lookLoading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">LOADING REPOSITORY...</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-white/40 uppercase font-black italic">Look not found</div>;

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: t(dictionary.registrationRequiredTitle),
        description: t(dictionary.registrationRequiredDesc),
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

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: t(dictionary.registrationRequiredTitle),
        description: t(dictionary.registrationRequiredDesc),
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    if (!measurements.height || !measurements.weight) {
      toast({
        variant: "destructive",
        title: "Ma'lumotlar to'liq emas",
        description: "Iltimos, bo'yingiz va vazningizni kiriting."
      });
      return;
    }

    setIsOrdering(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const orderData = {
        userId: user.uid,
        customerName: userData?.firstName || user.email?.split('@')[0] || 'Customer',
        telegramUsername: userData?.telegramUsername || 'Not provided',
        orderDate: new Date().toISOString(),
        status: 'New',
        totalAmount: look.price,
        lookId: look.id,
        lookName: look.name,
        size: selectedSize,
        measurements: {
          height: measurements.height,
          weight: measurements.weight,
          knownSize: measurements.knownSize || selectedSize
        },
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Trigger Telegram Notification to Admin
      notifyAdminOfOrder({
        customerName: orderData.customerName,
        orderId: docRef.id,
        currentStatus: 'New',
        productName: look.name,
        language: 'uz',
        physique: {
          height: measurements.height,
          weight: measurements.weight,
          size: selectedSize,
        }
      });

      toast({
        title: t(dictionary.orderProcessedTitle),
        description: t(dictionary.orderProcessedDesc),
      });
      router.push('/orders');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: t(dictionary.orderFailedTitle),
        description: t(dictionary.orderFailedDesc),
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

          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white tracking-tighter">
                  {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                </span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{look.currency || 'USD'}</span>
              </div>
            </div>

            <div className="flex-grow glass-dark border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl bg-white/[0.02] space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t(dictionary.technicalDetails)}</p>
                  <div className="text-sm lg:text-base text-white font-bold italic leading-relaxed whitespace-pre-line">
                    {look.description}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t(dictionary.selectSizeMatrix)}</p>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-full text-[10px] font-black transition-all border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none scale-110' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 neon-text" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">O'lchamlarni aniqlash</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-white/40">Bo'y (cm)</Label>
                      <Input 
                        type="number" 
                        placeholder="175"
                        value={measurements.height}
                        onChange={(e) => setMeasurements({...measurements, height: e.target.value})}
                        className="bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:neon-border text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase text-white/40">Vazn (kg)</Label>
                      <Input 
                        type="number" 
                        placeholder="70"
                        value={measurements.weight}
                        onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                        className="bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:neon-border text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-white/40">O'lchamingiz (S, M, L...)</Label>
                    <Input 
                      type="text" 
                      placeholder="M"
                      value={measurements.knownSize}
                      onChange={(e) => setMeasurements({...measurements, knownSize: e.target.value})}
                      className="bg-white/5 border-white/10 h-10 text-xs rounded-xl focus:neon-border text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handlePurchase}
                  disabled={isOrdering}
                  className="w-full h-14 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-[0.1em] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isOrdering ? <Loader2 className="animate-spin" /> : t(dictionary.executePurchase)}
                </Button>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center">
                  {t(dictionary.secureCheckout)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
