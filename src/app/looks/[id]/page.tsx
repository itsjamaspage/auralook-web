"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Decoding Metadata...</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-white/40 uppercase font-black italic">Look not found</div>;

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Registration Required",
        description: "Please log in to place an order.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    setIsOrdering(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      const orderData = {
        userId: user.uid,
        customerName: user.email?.split('@')[0] || 'Customer',
        telegramUsername: userData?.telegramUsername || 'Not provided',
        orderDate: new Date().toISOString(),
        status: 'New',
        totalAmount: look.price,
        shippingAddress: 'Tashkent (Pending detail)',
        telegramNotificationSent: false,
        updatedAt: new Date().toISOString(),
        lookId: look.id,
      };

      await addDoc(collection(db, 'orders'), orderData);

      toast({
        title: "Order Received!",
        description: "Check your Telegram for status updates. Our manager will contact you soon.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Could not place order. Please try again.",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Background Energy Paths */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && (
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <path 
              d="M -100,200 Q 400,100 800,500 T 1400,300" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
              style={{ animationDelay: '0s' }}
            />
            <path 
              d="M 1200,0 Q 800,400 400,800" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
              style={{ animationDelay: '3s' }}
            />
          </svg>
        )}
      </div>

      <div className="container mx-auto px-6 pb-24 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start pt-12">
          
          {/* LEFT: Visual Showcase (Image Section) */}
          <div className="relative group animate-in fade-in slide-in-from-left-12 duration-1000">
            {/* Corner Bracket Accents */}
            <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 neon-border rounded-tl-3xl z-20" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 neon-border rounded-br-3xl z-20" />
            
            <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden bg-[#6a8a8a] border border-white/5 shadow-2xl flex items-center justify-center p-8">
              {/* Floating ID Tag */}
              <div className="absolute top-10 left-10 glass-dark px-4 py-2 rounded-full border border-white/10 backdrop-blur-md z-30">
                <span className="text-[9px] font-black tracking-widest uppercase text-white/50">REF // {look.id.substring(0, 8).toUpperCase()}</span>
              </div>

              {/* Centered Large Price Tag Overlay (Matching image style) */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30">
                <span className="text-4xl font-black text-white drop-shadow-2xl">
                  {look.currency === 'USD' ? `${look.price}$` : `${look.price} UZS`}
                </span>
              </div>

              <div className="relative w-full h-full scale-90 group-hover:scale-95 transition-transform duration-700">
                <Image 
                  src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                  alt={t(look.name) || 'Look'} 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Content Section */}
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            
            <div className="space-y-6">
              {/* Limited Production Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                <Sparkles className="w-3 h-3 neon-text" />
                LIMITED PRODUCTION
              </div>
              
              {/* Massive Stylized Title */}
              <div className="space-y-4">
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none italic uppercase neon-text drop-shadow-2xl">
                  {t(look.name) || 'Unnamed Look'}
                </h1>
                <div className="w-32 h-1.5 neon-bg rounded-full" />
              </div>
              
              {/* Description */}
              <p className="text-lg text-white/50 leading-relaxed font-medium max-w-lg">
                {t(look.description)}
              </p>
            </div>

            {/* Current Valuation Glass Card */}
            <div className="space-y-8 glass-dark p-10 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8">
                <Zap className="w-8 h-8 text-white/5" />
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">CURRENT VALUATION</span>
                <div className="text-6xl font-black neon-text tabular-nums">
                  {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                </div>
              </div>

              <div className="space-y-6">
                <Button 
                  size="lg" 
                  className="w-full rounded-2xl h-20 neon-bg text-black font-black text-xl border-none shadow-[0_0_60px_-15px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] group/btn"
                  onClick={handlePurchase}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <Loader2 className="animate-spin w-8 h-8" />
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <ShoppingCart className="w-6 h-6 transition-transform group-hover/btn:-translate-y-1" />
                      Complete Order
                    </div>
                  )}
                </Button>
                
                <div className="text-center">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    SECURED VIA BIOMETRIC VERIFICATION // 2026 TERMINAL
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
