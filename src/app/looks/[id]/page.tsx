"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Loader2, 
  ChevronLeft, 
  MoreHorizontal, 
  Shirt, 
  Zap, 
  Thermometer, 
  Droplets, 
  Package 
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

  const specs = [
    { icon: <Shirt className="w-4 h-4" />, label: "Premium Fabric", sub: "Cotton Blend" },
    { icon: <Zap className="w-4 h-4" />, label: "Fit Type", sub: "Athletic Slim" },
    { icon: <Thermometer className="w-4 h-4" />, label: "Optimal Season", sub: "All Season" },
    { icon: <Droplets className="w-4 h-4" />, label: "Care Instructions", sub: "Washable" },
    { icon: <Package className="w-4 h-4" />, label: "Availability", sub: "In Stock" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
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

      <div className="relative z-10 container mx-auto px-6 pt-2 pb-24 max-w-5xl lg:grid lg:grid-cols-2 gap-8 items-start">
        
        {/* TOP NAV BAR */}
        <div className="flex items-center justify-between w-full mb-6 lg:col-span-2">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold tracking-tight text-white/60 uppercase text-[10px]">Technical Specs // Metadata</span>
          <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* LEFT COLUMN: TITLE & SPECS */}
        <div className="space-y-8">
          {/* MAIN TITLE */}
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none neon-text uppercase italic">
              {look.name || 'Aura Look'}
            </h1>
            <p className="text-[10px] font-mono text-white/30 tracking-[0.3em]">REF // {look.id.substring(0, 8).toUpperCase()}</p>
          </div>

          {/* SPECS LIST */}
          <div className="space-y-4">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-4 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60">
                  {spec.icon}
                </div>
                <div className="space-y-0">
                  <p className="text-sm font-bold text-white/90">{spec.label}</p>
                  <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">{spec.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* DESCRIPTION SECTION (Integrated on left for better fitting) */}
          <div className="glass-dark p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Description // Data</p>
            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line font-medium italic">
              {look.description}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN IMAGE */}
        <div className="hidden lg:block relative h-[450px] w-full mt-4">
           <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full animate-pulse" />
           <div className="relative w-full h-full transform transition-transform hover:scale-105 duration-700">
             <Image 
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                alt={look.name || 'Look'} 
                fill 
                className="object-contain"
                priority
              />
           </div>
        </div>

        {/* MOBILE IMAGE SHOWCASE */}
        <div className="lg:hidden relative aspect-square w-full mt-6">
           <div className="relative w-full h-full">
             <Image 
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                alt={look.name || 'Look'} 
                fill 
                className="object-contain"
                priority
              />
           </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Valuation</p>
            <p className="text-2xl font-black text-white">
              {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
            </p>
          </div>
          
          <Button 
            className="flex-1 max-w-md h-12 rounded-xl neon-bg text-black font-black text-sm border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handlePurchase}
            disabled={isOrdering}
          >
            {isOrdering ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                COMPLETE ORDER
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
