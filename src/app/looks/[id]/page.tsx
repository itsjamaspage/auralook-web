
"use client"

import { use, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Heart,
  ChevronLeft,
  Calendar,
  Layers,
  Zap,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
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

  // Firestore Data
  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  const likedLookRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid, 'liked_looks', id);
  }, [db, user, id]);
  const { data: likedLook } = useDoc(likedLookRef);

  const isLiked = !!likedLook;

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Loading Metadata...</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-white/40 uppercase font-black italic">Look not found</div>;

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Registration Required",
        description: "Please log in to save looks to your favorites.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }

    if (!likedLookRef) return;

    try {
      if (isLiked) {
        await deleteDoc(likedLookRef);
        toast({ title: "Removed from favorites" });
      } else {
        await setDoc(likedLookRef, {
          lookId: id,
          createdAt: new Date().toISOString()
        });
        toast({ title: "Added to favorites" });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      {/* Background Energy Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full">
          <path d="M 0,100 Q 300,300 1200,200" fill="none" strokeWidth="1" className="energy-line" />
          <path d="M 1200,500 Q 800,800 0,900" fill="none" strokeWidth="1" className="energy-line" style={{ animationDelay: '2s' }} />
        </svg>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-4 max-w-7xl relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="rounded-full w-10 h-10 p-0 border border-white/10 glass-dark hover:neon-border text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase">Repository // 2026</span>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{look.name}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleToggleLike}
            className={`rounded-full w-10 h-10 p-0 border border-white/10 glass-dark transition-all ${isLiked ? 'neon-border neon-text' : 'hover:neon-border text-white'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Visual Component - Spans 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[3/4] lg:h-[75vh] lg:aspect-auto rounded-[3rem] overflow-hidden glass-dark border border-white/10 shadow-2xl group">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              
              {/* Reference Tag Overlay */}
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                <div className="px-3 py-1 glass-dark border border-white/20 rounded-lg text-[9px] font-bold text-white/80 uppercase tracking-tighter">
                  REF: {id.substring(0, 8)}
                </div>
                {look.discount > 0 && (
                  <div className="px-3 py-1 neon-bg rounded-lg text-[10px] font-black text-black uppercase tracking-tighter">
                    -{look.discount}% REDUCTION
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configuration & Order Panel - Spans 5 cols */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic neon-text leading-none transition-all">
                {look.name}
              </h1>
            </div>

            {/* Technical Valuation Card */}
            <div className="glass-dark border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
               
               <div className="flex items-end justify-between">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Current Valuation</p>
                   <div className="flex items-baseline gap-3">
                     <span className="text-4xl font-black text-white">
                       {look.currency === 'UZS' ? `${look.price.toLocaleString()}` : `$${look.price}`}
                     </span>
                     <span className="text-xs font-bold text-white/30 uppercase">{look.currency}</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                     <div className="w-1.5 h-1.5 rounded-full neon-bg animate-pulse" />
                     <span className="text-[10px] font-bold text-primary uppercase">In Stock</span>
                   </div>
                 </div>
               </div>

               {/* Configuration Details */}
               <div className="space-y-4 pt-6 border-t border-white/5">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 glass-dark p-3 rounded-2xl border border-white/5">
                      <Layers className="w-4 h-4 text-primary/60" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Material</span>
                        <span className="text-[10px] font-bold text-white">Advanced Synth</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 glass-dark p-3 rounded-2xl border border-white/5">
                      <Zap className="w-4 h-4 text-primary/60" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/30 uppercase">Utility</span>
                        <span className="text-[10px] font-bold text-white">High Resistance</span>
                      </div>
                    </div>
                 </div>

                 {/* The Description with Emoji Support */}
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Specification Log</p>
                   <div className="text-xs lg:text-sm text-white/70 leading-relaxed font-medium italic whitespace-pre-line">
                     {look.description}
                   </div>
                 </div>
               </div>

               {/* Execution Button */}
               <div className="space-y-4 pt-4">
                 <Button 
                   onClick={handlePurchase}
                   disabled={isOrdering}
                   className="w-full h-16 rounded-[1.5rem] neon-bg text-black font-black text-sm uppercase tracking-[0.2em] border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                 >
                   {isOrdering ? <Loader2 className="animate-spin" /> : 'Complete Order'}
                 </Button>
                 <div className="flex justify-center gap-6 text-[9px] font-bold text-white/20 uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Est: 2-3 Days</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Free Delivery</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
