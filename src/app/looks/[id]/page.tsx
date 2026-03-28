"use client"

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw, Loader2 } from 'lucide-react';
import { SizeAdvisorModal } from '@/components/size-advisor-modal';
import { Badge } from '@/components/ui/badge';
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
    <div className="container mx-auto px-6 pb-24">
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-dark border border-white/10">
            <Image 
              src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
              alt={t(look.name) || 'Look'} 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass-dark opacity-40 hover:opacity-100 transition-opacity cursor-pointer border border-white/5">
                <Image src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} alt="sub" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-10 flex flex-col justify-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter leading-tight italic uppercase neon-text">
              {t(look.name) || 'Unnamed Look'}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-light">
              {t(look.description)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black neon-text">
                {look.price}
              </span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {look.currency || 'USD'}
              </span>
            </div>

            <div className="p-6 glass-dark rounded-[2rem] border border-white/5 space-y-4 bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Size Guidance</p>
              <SizeAdvisorModal />
              <p className="text-[10px] text-white/20 text-center uppercase tracking-widest font-mono">
                Powered by Auralook AI Engine
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1 rounded-2xl h-16 neon-bg text-black font-black text-lg border-none shadow-2xl transition-all hover:scale-105 active:scale-95"
              onClick={handlePurchase}
              disabled={isOrdering}
            >
              {isOrdering ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : (
                <>
                  <ShoppingCart className="mr-2 w-6 h-6" />
                  Complete Order
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-tight">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10"><Truck className="w-4 h-4" /></div>
              <span>Free Delivery in Tashkent</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-tight">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10"><ShieldCheck className="w-4 h-4" /></div>
              <span>Authenticity Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
