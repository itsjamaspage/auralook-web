"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Loader2, 
  ChevronLeft, 
  MoreHorizontal
} from 'lucide-react';
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
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Dynamic Background Energy */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
        {mounted && (
          <svg className="absolute inset-0 w-full h-full">
            <path 
              d="M -100,200 Q 300,50 600,400 T 1200,200" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
            />
          </svg>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-2 pb-24 max-w-7xl lg:grid lg:grid-cols-12 gap-8 items-center h-full">
        
        {/* TOP NAV BAR - COMPACT */}
        <div className="flex items-center justify-between w-full mb-2 lg:col-span-12">
          <button 
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold tracking-tight text-white/40 uppercase text-[8px] font-mono">TECHNICAL DATA // ID_{look.id.substring(0, 8).toUpperCase()}</span>
          <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* LEFT COLUMN: TITLE & DESCRIPTION (COMPACT) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none neon-text uppercase italic">
              {look.name || 'Aura Look'}
            </h1>
            <p className="text-[8px] font-mono text-white/20 tracking-[0.4em]">SYSTEM CORE // STATUS: ACTIVE</p>
          </div>

          {/* DESCRIPTION AREA - SUPPORTS MULTI-LINE & EMOJIS */}
          <div className="glass-dark p-6 rounded-[1.5rem] border border-white/5 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
               <div className="w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
            </div>
            
            <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full neon-bg animate-pulse" />
              Outfit Configuration
            </p>
            
            <div className="text-base lg:text-lg text-white/90 leading-relaxed whitespace-pre-line font-medium italic">
              {look.description}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BIGGER IMAGE (SPANNING 8 COLS) */}
        <div className="lg:col-span-8 relative h-[450px] lg:h-[600px] w-full animate-in fade-in zoom-in duration-1000">
           <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full animate-pulse" />
           <div className="relative w-full h-full transform transition-transform hover:scale-[1.01] duration-1000">
             <Image 
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                alt={look.name || 'Look'} 
                fill 
                className="object-contain drop-shadow-[0_0_40px_rgba(var(--primary),0.1)]"
                priority
              />
              
              {/* Technical Overlay - Price */}
              <div className="absolute top-4 right-0 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-xl rotate-1 hover:rotate-0 transition-transform cursor-default z-20">
                 <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Current Valuation</p>
                 <p className="text-3xl font-black neon-text">
                    {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR - COMPACT */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="container mx-auto max-w-7xl flex items-center justify-center">
          <Button 
            className="w-full max-w-2xl h-14 rounded-xl neon-bg text-black font-black text-lg border-none shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            onClick={handlePurchase}
            disabled={isOrdering}
          >
            {isOrdering ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : (
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                COMPLETE ORDER // INITIATE PROTOCOL
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}