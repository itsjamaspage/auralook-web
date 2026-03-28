"use client"

import { use, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Heart,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc, query, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  const recommendedQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), limit(5));
  }, [db]);
  const { data: recommended } = useCollection(recommendedQuery);

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Loading Metadata...</p>
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
        size: selectedSize,
        lookId: look.id,
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);

      toast({
        title: "Order Processed",
        description: "Our manager will contact you on Telegram shortly.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "System error. Please retry.",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const discountVal = look.discount || 0;
  const originalPrice = discountVal > 0 ? look.price / (1 - discountVal / 100) : look.price;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-4 max-w-7xl">
        
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="rounded-full w-10 h-10 p-0 border border-white/10 glass-dark hover:neon-border text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <Link href="/looks" className="hover:text-primary transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-white/60">{look.name}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 relative aspect-[4/5] lg:aspect-auto lg:h-[70vh] rounded-[2rem] overflow-hidden glass-dark border border-white/10 shadow-2xl group">
            <Image 
              src={look.imageUrl} 
              alt={look.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            {discountVal > 0 && (
              <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full neon-bg text-black text-[11px] font-black uppercase tracking-tighter shadow-2xl">
                -{discountVal}% OFF
              </div>
            )}
            <button className="absolute bottom-6 right-6 w-12 h-12 rounded-full glass-dark border border-white/10 flex items-center justify-center hover:neon-bg transition-all text-white hover:text-black">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase">Collection 2026 // Alpha</p>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase italic neon-text leading-none">
                {look.name}
              </h1>
            </div>

            <div className="glass-dark border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  {discountVal > 0 && (
                    <span className="text-xs text-white/30 line-through font-mono">
                      {look.currency === 'UZS' ? `UZS ${Math.round(originalPrice).toLocaleString()}` : `$${originalPrice.toFixed(2)}`}
                    </span>
                  )}
                  <span className="text-3xl font-black text-white">
                    {look.currency === 'UZS' ? `UZS ${look.price.toLocaleString()}` : `$${look.price}`}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-[10px] font-bold text-primary uppercase">Ready for Dispatch</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Technical Details</p>
                <div className="text-xs lg:text-sm text-white/70 leading-relaxed font-medium italic whitespace-pre-line">
                  {look.description}
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Select Size Matrix</p>
               <div className="flex flex-wrap gap-2">
                 {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                   <button 
                     key={size}
                     onClick={() => setSelectedSize(size)}
                     className={`w-10 h-10 rounded-xl border font-black text-[10px] transition-all ${
                       selectedSize === size 
                       ? 'neon-bg border-none' 
                       : 'border-white/10 glass-dark text-white/40 hover:border-white/30'
                     }`}
                   >
                     {size}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handlePurchase}
                disabled={isOrdering}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black text-xs uppercase tracking-widest border-none shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isOrdering ? <Loader2 className="animate-spin" /> : 'Execute Purchase'}
              </Button>
              <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.2em]">Secure Checkout // Encrypted Session</p>
            </div>
          </div>
        </div>

        <div className="mt-20 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Recommended Augmentations</h2>
            <Link href="/looks" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">View Repository</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {recommended?.filter(r => r.id !== id).slice(0, 4).map((item) => (
              <Link key={item.id} href={`/looks/${item.id}`}>
                <div className="glass-dark border border-white/10 overflow-hidden group hover:neon-border transition-all duration-500 rounded-2xl h-full">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter truncate">{item.name}</p>
                    <p className="font-black text-xs text-white">
                      {item.currency === 'UZS' ? `UZS ${item.price.toLocaleString()}` : `$${item.price}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
