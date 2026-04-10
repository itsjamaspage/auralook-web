
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Plus, DollarSign, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { postNewLookToChannel } from '@/ai/flows/ai-telegram-order-status-notification';

export default function NewLookPage() {
  const [saving, setSaving] = useState(false);
  
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [imageUrl, setImageUrl] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const db = useFirestore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseNumericValue = (val: string, curr: string) => {
    if (curr === 'UZS') {
      const onlyDigits = val.replace(/\D/g, '');
      return parseInt(onlyDigits, 10) || 0;
    }
    const cleaned = val.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleSave = async () => {
    if (!description || !price) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setSaving(true);
    try {
      const numericPrice = parseNumericValue(price, currency);
      const numericDiscount = parseFloat(discount) || 0;

      const lookData = {
        name: `Outfit ${new Date().toLocaleDateString()}`,
        description,
        price: numericPrice,
        discount: numericDiscount,
        currency,
        imageUrl: imageUrl || 'https://picsum.photos/seed/default-look/600/800',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'looks'), lookData);

      // PROTOCOL: Automated Broadcast to Telegram Channel
      await postNewLookToChannel({
        id: docRef.id,
        name: lookData.name,
        price: lookData.price,
        currency: lookData.currency,
        description: lookData.description,
        imageUrl: lookData.imageUrl
      });

      toast({ 
        title: t(dictionary.lookSavedSuccess),
        description: "Product published and posted to Telegram channel."
      });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Save Failed",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8 sm:space-y-12">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-3xl font-black tracking-tighter neon-text uppercase italic">{t(dictionary.createNewLook)}</h1>
        <p className="text-white/60 text-sm font-medium">{t(dictionary.createNewLookDesc)}</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-dark rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden aspect-[3/4] relative group bg-white/[0.02] border-white/10 shadow-2xl">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover opacity-80 transition-opacity"
              />
            )}
            <label className={`absolute inset-0 flex flex-col items-center justify-center p-6 border-dashed border-2 ${imageUrl ? 'border-white/20' : 'border-white/10'} m-3 sm:m-4 rounded-[1.5rem] sm:rounded-[2rem] hover:neon-border transition-colors group cursor-pointer`}>
              {!imageUrl && (
                <div className="bg-white/5 p-4 sm:p-6 rounded-full mb-4 group-hover:neon-border transition-all">
                  <Plus className="w-8 h-8 sm:w-12 sm:h-12 neon-text" />
                </div>
              )}
              <p className="text-[10px] sm:text-xs font-bold text-center text-white/80 uppercase tracking-widest">{t(dictionary.uploadImage)}</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <div className="mt-4 w-full px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
                <Input 
                  className="bg-white/5 border-white/10 h-10 text-[10px] text-white placeholder:text-white/20 pointer-events-auto rounded-xl" 
                  placeholder={t(dictionary.imageUrlPlaceholder)}
                  value={imageUrl.startsWith('data:') ? '' : imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </label>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-dark rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 space-y-8 border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] text-white/40">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 neon-text" />
                  {t(dictionary.lookPrice)}
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input 
                    type="text" 
                    placeholder={currency === 'UZS' ? '200 000' : '299'} 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl sm:rounded-2xl flex-1 focus:neon-border text-white placeholder:text-white/20" 
                  />
                  <RadioGroup 
                    value={currency} 
                    onValueChange={(v: any) => setCurrency(v)}
                    className="flex items-center gap-4 bg-white/5 px-4 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="USD" id="usd" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                      <Label htmlFor="usd" className="text-[10px] font-bold text-white/80">USD</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="UZS" id="uzs" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                      <Label htmlFor="uzs" className="text-[10px] font-bold text-white/80">UZS</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] text-white/40">
                  <Percent className="w-3 h-3 sm:w-4 sm:h-4 neon-text" />
                  {t(dictionary.discountLabel)}
                </Label>
                <Input 
                  type="number" 
                  placeholder="20" 
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 sm:h-14 rounded-xl sm:rounded-2xl focus:neon-border text-white placeholder:text-white/20" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[9px] sm:text-[10px] text-white/40">{t(dictionary.lookDescription)}</Label>
              <Textarea 
                className="min-h-[150px] sm:min-h-[200px] bg-white/5 border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 leading-relaxed font-light text-white text-base sm:text-lg focus:neon-border placeholder:text-white/20" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(dictionary.lookDescriptionPlaceholder)}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 pt-6 sm:pt-10 border-t border-white/10">
              <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 rounded-xl sm:rounded-2xl h-12 sm:h-14 px-8 font-bold text-white/40 hover:text-white transition-colors order-2 sm:order-1">
                {t(dictionary.cancel)}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="neon-bg text-black font-black px-12 sm:px-16 rounded-xl sm:rounded-2xl h-12 sm:h-14 border-none shadow-2xl transition-all hover:scale-105 active:scale-95 order-1 sm:order-2"
              >
                {saving ? <Loader2 className="animate-spin" /> : t(dictionary.publish)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
