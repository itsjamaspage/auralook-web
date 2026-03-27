"use client"

import { use } from 'react';
import Image from 'next/image';
import { MOCK_LOOKS } from '@/lib/mock-data';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { SizeAdvisorModal } from '@/components/size-advisor-modal';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function LookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();
  
  const look = MOCK_LOOKS.find(l => l.id === id);

  if (!look) return <div className="p-24 text-center">Look not found</div>;

  const handlePurchase = () => {
    toast({
      title: "Order Received!",
      description: "Check your Telegram for status updates. Our manager will contact you soon.",
    });
  };

  return (
    <div className="container mx-auto px-6 pb-24">
      <div className="grid lg:grid-cols-2 gap-16">
        {/* Left: Images */}
        <div className="space-y-6">
          <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden glass border-white/10">
            <Image 
              src={look.imageUrl} 
              alt={t(look.name)} 
              fill 
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden glass opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <Image src={look.imageUrl} alt="sub" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Content */}
        <div className="space-y-10 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex gap-2">
              {look.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="rounded-full bg-white/5 border-white/5">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-tight">{t(look.name)}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-light">
              {t(look.description)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">${look.price}</span>
              <span className="text-muted-foreground line-through">$540</span>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">50% OFF</Badge>
            </div>

            <div className="p-6 glass-dark rounded-[2rem] border-white/5 space-y-4">
              <p className="text-sm font-medium">Size Guidance</p>
              <SizeAdvisorModal />
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                Recommended by Jama AI Engine
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="flex-1 rounded-2xl h-16 bg-primary text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              onClick={handlePurchase}
            >
              <ShoppingCart className="mr-2 w-6 h-6" />
              Complete Order
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 bg-white/5 rounded-xl"><Truck className="w-5 h-5" /></div>
              <span>Free Delivery in Tashkent</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 bg-white/5 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
              <span>Authenticity Guaranteed</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 bg-white/5 rounded-xl"><RefreshCcw className="w-5 h-5" /></div>
              <span>14-Day Free Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}