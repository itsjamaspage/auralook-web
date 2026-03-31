
"use client"

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Heart,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
        size: selectedSize,
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

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="min-h-[calc(100vh-100px)] bg-background text-foreground flex items-center justify-center py-4 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl relative">
        
        <div className="grid lg:grid-cols-12 gap-8 items-end relative z-10">
          
          {/* Left Column: Image */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -top-10 left-0 z-20">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="rounded-full w-8 h-8 p-0 border border-white/10 glass-dark hover:neon-border text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden glass-dark border border-white/10 shadow-2xl group">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              <button 
                onClick={handleToggleLike}
                className={`absolute bottom-6 right-6 w-10 h-10 rounded-full glass-dark border flex items-center justify-center transition-[transform,opacity] shadow-2xl z-20 hover:scale-110 ${isLiked ? 'neon-border neon-text bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-6 flex flex-col justify-end space-y-4">
            
            <div className="relative pb-2">
              <div className="flex justify-between items-end relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                  </span>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">USD</span>
                </div>
                <div className="text-right mb-2">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{t(dictionary.status)}</p>
                </div>
              </div>
            </div>

            <div className="glass-dark border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
              
              <div className="space-y-2">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{t(dictionary.technicalDetails)}</p>
                <div className="text-sm lg:text-base text-white font-bold italic leading-relaxed whitespace-pre-line">
                  {look.description}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">{t(dictionary.selectSizeMatrix)}</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-lg text-[10px] font-black transition-[transform,opacity] border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handlePurchase}
                  disabled={isOrdering}
                  className="w-full h-14 rounded-2xl neon-bg text-black font-black text-base uppercase tracking-[0.1em] border-none transition-[transform,opacity] hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isOrdering ? <Loader2 className="animate-spin" /> : t(dictionary.executePurchase)}
                </Button>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] text-center mt-3">
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
