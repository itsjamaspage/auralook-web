
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
    <div className="min-h-[calc(100vh-80px)] bg-background text-foreground flex items-center justify-center py-4 lg:py-6 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="grid lg:grid-cols-12 gap-8 items-end relative">
          
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="absolute -top-10 left-0 rounded-full w-8 h-8 p-0 border border-white/10 glass-dark hover:neon-border text-white transition-all z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Look Photo Container */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden glass-dark border border-white/10 shadow-2xl group">
              <Image 
                src={look.imageUrl} 
                alt={look.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              {/* Heart Emoji Button inside Look Photo */}
              <button 
                onClick={handleToggleLike}
                className={`absolute bottom-6 right-6 w-12 h-12 rounded-full glass-dark border-[1.5px] flex items-center justify-center transition-all shadow-2xl z-20 ${isLiked ? 'neon-border neon-text bg-primary/10' : 'border-white/20 text-white/60 hover:border-white/40'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-5 space-y-4 pt-4 lg:pt-0">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-[#00FF66] uppercase tracking-[0.2em] italic">COLLECTION 2026 // ALPHA</p>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic neon-text leading-[0.9]">
                {look.name}
              </h1>
            </div>

            {/* Config Card */}
            <div className="glass-dark border border-white/10 rounded-[2rem] p-6 lg:p-7 space-y-6 shadow-2xl relative">
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl lg:text-5xl font-black text-white">
                    ${look.price}
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">USD</span>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">HOLATI</p>
                  <p className="text-[10px] font-black text-[#00FF66] uppercase tracking-wider">
                    {t(dictionary.readyForDispatch)}
                  </p>
                </div>
              </div>

              {/* Technical Desc */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">TEXNIK TAFSILOTLAR</p>
                <div className="text-sm lg:text-[15px] text-white/90 leading-relaxed font-medium italic whitespace-pre-line">
                  {look.description}
                </div>
              </div>

              {/* Size Select */}
              <div className="space-y-3">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">O'LCHAMNI TANLANG</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all border flex items-center justify-center ${selectedSize === size ? 'neon-bg border-none scale-105' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button 
                  onClick={handlePurchase}
                  disabled={isOrdering}
                  className="w-full h-14 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-[0.1em] border-none shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isOrdering ? <Loader2 className="animate-spin" /> : t(dictionary.executePurchase)}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
