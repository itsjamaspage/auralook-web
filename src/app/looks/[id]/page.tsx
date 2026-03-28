
"use client"

import { use, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Heart,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc, query, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
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
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Accessing Metadata...</p>
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
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container mx-auto px-4 lg:px-8 py-6 max-w-7xl">
        
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8">
          <Link href="/looks" className="hover:text-primary transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-white/60">{look.name}</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-dark border border-white/10 group">
            <Image 
              src={look.imageUrl} 
              alt={look.name} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <button className="absolute top-6 right-6 w-12 h-12 rounded-full glass-dark border border-white/10 flex items-center justify-center hover:neon-bg transition-all text-white hover:text-black">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            <div className="space-y-2">
              <p className="text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase">System Core // Active</p>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic neon-text leading-tight">
                {look.name}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                {discountVal > 0 && (
                  <span className="text-sm text-white/30 line-through font-mono">
                    {look.currency === 'UZS' ? `UZS ${originalPrice.toLocaleString()}` : `$${originalPrice.toFixed(2)}`}
                  </span>
                )}
                <span className="text-3xl font-black text-white">
                  {look.currency === 'UZS' ? `UZS ${look.price.toLocaleString()}` : `$${look.price}`}
                </span>
              </div>
              {discountVal > 0 && (
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
                  {discountVal}% Disc
                </div>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Configuration Details</p>
              <div className="text-sm text-white/70 leading-relaxed font-medium italic whitespace-pre-line glass-dark p-6 rounded-2xl border border-white/5">
                {look.description}
              </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Size Matrix</p>
               <div className="flex flex-wrap gap-2">
                 {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                   <button 
                     key={size}
                     onClick={() => setSelectedSize(size)}
                     className={`w-12 h-12 rounded-xl border font-black text-xs transition-all ${
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

            <div className="grid grid-cols-2 gap-4 pt-6">
              <Button variant="outline" className="h-14 rounded-2xl border-white/10 glass-dark hover:neon-border text-white font-black text-xs uppercase tracking-widest">
                Add To Registry
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={isOrdering}
                className="h-14 rounded-2xl neon-bg text-black font-black text-xs uppercase tracking-widest border-none shadow-2xl"
              >
                {isOrdering ? <Loader2 className="animate-spin" /> : 'Execute Purchase'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-32 space-y-12">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">This item can be cool with this</h2>
            <Link href="/looks" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended?.filter(r => r.id !== id).slice(0, 4).map((item) => (
              <Link key={item.id} href={`/looks/${item.id}`}>
                <Card className="glass-dark border-white/10 overflow-hidden group hover:neon-border transition-all duration-500 rounded-[2rem]">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{item.name}</p>
                    <p className="font-black text-sm text-white">
                      {item.currency === 'UZS' ? `UZS ${item.price.toLocaleString()}` : `$${item.price}`}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
