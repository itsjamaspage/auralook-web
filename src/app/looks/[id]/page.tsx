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
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background Grid & Energy Paths */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] animate-pulse" />
        
        {mounted && (
          <svg className="absolute inset-0 w-full h-full opacity-40">
            <path 
              d="M -100,200 Q 400,100 800,500 T 1400,300" 
              fill="none" 
              strokeWidth="2" 
              className="energy-line"
              style={{ animationDelay: '0s' }}
            />
            <path 
              d="M 1200,0 Q 800,400 400,800" 
              fill="none" 
              strokeWidth="1.5" 
              className="energy-line"
              style={{ animationDelay: '3s' }}
            />
            <path 
              d="M 0,1000 Q 500,600 1000,1000" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
              style={{ animationDelay: '6s' }}
            />
          </svg>
        )}
      </div>

      <div className="container mx-auto px-6 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center pt-8">
          {/* Visual Showcase */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="relative group">
              {/* Image Frame with Floating Elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 neon-border rounded-tl-3xl z-20" />
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 neon-border rounded-br-3xl z-20" />
              
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden glass-dark border border-white/10 shadow-2xl">
                <Image 
                  src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                  alt={t(look.name) || 'Look'} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                {/* Floating ID Tag */}
                <div className="absolute top-8 left-8 glass-dark px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                  <span className="text-[10px] font-black tracking-widest uppercase text-white/60">REF // {look.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative aspect-square rounded-3xl overflow-hidden glass-dark border border-white/10 group cursor-pointer">
                  <Image 
                    src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                    alt="sub" 
                    fill 
                    className="object-cover opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Intel & Actions */}
          <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                <Sparkles className="w-3 h-3 neon-text" />
                Limited Production
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight italic uppercase neon-text drop-shadow-2xl">
                {t(look.name) || 'Unnamed Look'}
              </h1>
              
              <div className="w-20 h-1 neon-bg rounded-full opacity-50" />
              
              <p className="text-xl text-white/60 leading-relaxed font-light max-w-xl">
                {t(look.description)}
              </p>
            </div>

            <div className="space-y-8 glass-dark p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Zap className="w-8 h-8 text-white/5" />
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Current Valuation</span>
                <span className="text-5xl font-black neon-text tabular-nums">
                  {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  size="lg" 
                  className="w-full rounded-2xl h-20 neon-bg text-black font-black text-xl border-none shadow-[0_0_50px_rgba(var(--sync-color),0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handlePurchase}
                  disabled={isOrdering}
                >
                  {isOrdering ? (
                    <Loader2 className="animate-spin w-8 h-8" />
                  ) : (
                    <>
                      <ShoppingCart className="mr-3 w-6 h-6" />
                      Complete Order
                    </>
                  )}
                </Button>
                
                <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  Secured via biometric verification // 2026 terminal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
