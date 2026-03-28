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
    { icon: <Shirt className="w-5 h-5" />, label: "Premium Fabric", sub: "Cotton Blend" },
    { icon: <Zap className="w-5 h-5" />, label: "Fit Type", sub: "Athletic Slim" },
    { icon: <Thermometer className="w-5 h-5" />, label: "Optimal Season", sub: "All Season" },
    { icon: <Droplets className="w-5 h-5" />, label: "Care Instructions", sub: "Washable" },
    { icon: <Package className="w-5 h-5" />, label: "Availability", sub: "In Stock" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Dynamic Background Energy */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {mounted && (
          <svg className="absolute inset-0 w-full h-full">
            <path 
              d="M -100,300 Q 400,100 800,600 T 1400,400" 
              fill="none" 
              strokeWidth="1" 
              className="energy-line"
            />
          </svg>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-4 pb-32 max-w-lg lg:max-w-5xl lg:grid lg:grid-cols-2 gap-12 items-center">
        
        {/* TOP NAV BAR */}
        <div className="flex items-center justify-between w-full mb-12 lg:col-span-2">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="font-bold tracking-tight text-white/80 uppercase text-sm">Look Info</span>
          <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* LEFT COLUMN: TITLE & SPECS */}
        <div className="space-y-12">
          {/* MAIN TITLE */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight neon-text">
              {t(look.name) || 'Aura Look'}
              <br />
              <span className="text-white/40">REF // {look.id.substring(0, 4).toUpperCase()}</span>
            </h1>
          </div>

          {/* SPECS LIST */}
          <div className="space-y-8">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-6 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/60">
                  {spec.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-lg font-bold text-white">{spec.label}</p>
                  <p className="text-sm font-medium text-white/40 uppercase tracking-widest">{spec.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN IMAGE (Overlapping style) */}
        <div className="hidden lg:block relative h-[700px] w-full">
           <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
           <div className="relative w-full h-full transform scale-125 translate-x-12">
             <Image 
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                alt={t(look.name) || 'Look'} 
                fill 
                className="object-contain"
                priority
              />
           </div>
        </div>

        {/* MOBILE IMAGE SHOWCASE */}
        <div className="lg:hidden relative aspect-square w-full mt-8 overflow-visible">
           <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full" />
           <div className="relative w-full h-full transform scale-110 translate-x-4">
             <Image 
                src={look.imageUrl || 'https://picsum.photos/seed/default/600/800'} 
                alt={t(look.name) || 'Look'} 
                fill 
                className="object-contain"
                priority
              />
           </div>
        </div>

        {/* PRICE & DESCRIPTION SECTION */}
        <div className="mt-12 lg:col-span-2 space-y-6">
          <div className="glass-dark p-6 rounded-[2rem] border border-white/5">
            <p className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-4">Description</p>
            <p className="text-lg text-white/80 leading-relaxed whitespace-pre-line font-medium italic">
              {t(look.description)}
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="container mx-auto max-w-lg lg:max-w-5xl flex flex-col sm:flex-row items-center gap-6">
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Current Value</p>
            <p className="text-3xl font-black text-white">
              {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
            </p>
          </div>
          
          <Button 
            className="w-full h-16 rounded-[2rem] neon-bg text-black font-black text-xl border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handlePurchase}
            disabled={isOrdering}
          >
            {isOrdering ? (
              <Loader2 className="animate-spin w-8 h-8" />
            ) : (
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                Book Now
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
