"use client"

import { use, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Heart,
  ChevronLeft,
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
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">LOADING REPOSITORY...</p>
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
    <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex items-center justify-center py-4">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Navigation Info */}
        <div className="flex justify-end mb-6">
          <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
            {t(dictionary.catalog)} // <span className="text-white/60">{look.name}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Visual */}
          <div className="lg:col-span-7 relative group">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="absolute -top-12 left-0 rounded-full w-10 h-10 p-0 border border-white/10 glass-dark hover:neon-border text-white transition-all z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="relative aspect-square rounded-[3rem] overflow-hidden glass-dark border border-white/10 shadow-2xl">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover"
                priority
              />
              
              <button 
                onClick={handleToggleLike}
                className={`absolute bottom-8 right-8 w-14 h-14 rounded-full glass-dark border border-white/20 flex items-center justify-center transition-all shadow-2xl z-10 ${isLiked ? 'neon-border neon-text' : 'hover:neon-border text-white'}`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">COLLECTION 2026 // ALPHA</p>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic neon-text leading-none">
                {look.name}
              </h1>
            </div>

            {/* Price & Status Card */}
            <div className="glass-dark border border-white/10 rounded-[2.5rem] p-8 space-y-10 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">
                    {look.currency === 'UZS' ? `${look.price.toLocaleString()}` : `$${look.price}`}
                  </span>
                  <span className="text-sm font-bold text-white/30 uppercase">{look.currency}</span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">{t(dictionary.status)}</p>
                  <p className="text-[10px] font-black text-[#00FF66] uppercase tracking-wider animate-pulse">
                    {t(dictionary.readyForDispatch)}
                  </p>
                </div>
              </div>

              {/* Technical Description */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t(dictionary.technicalDetails)}</p>
                <div className="text-sm text-white/80 leading-relaxed font-medium italic whitespace-pre-line">
                  {look.description}
                </div>
              </div>

              {/* Size Matrix */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t(dictionary.selectSizeMatrix)}</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-xl text-[10px] font-black transition-all border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none scale-110' : 'glass-dark border-white/10 text-white/40 hover:border-white/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Execution Action */}
              <div className="space-y-4 pt-4">
                <Button 
                  onClick={handlePurchase}
                  disabled={isOrdering}
                  className="w-full h-16 rounded-[1.5rem] neon-bg text-black font-black text-sm uppercase tracking-[0.2em] border-none shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isOrdering ? <Loader2 className="animate-spin" /> : t(dictionary.executePurchase)}
                </Button>
                <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
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
