
"use client"

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, DollarSign, Percent, Save, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function EditLookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [hasShoe, setHasShoe] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const db = useFirestore();

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  const formatPriceInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    if (look) {
      setName(look.name || '');
      setDescription(look.description || '');
      setPrice(formatPriceInput(look.price?.toString() || ''));
      setDiscount(look.discount?.toString() || '0');
      setCurrency(look.currency || 'USD');
      setImageUrl(look.imageUrl || '');
      setHasShoe(look.hasShoe || false);
    }
  }, [look]);

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

  const handleUpdate = async () => {
    if (!price) {
      toast({
        variant: "destructive",
        title: t(dictionary.missingInformation),
        description: "Price is required to update the catalog.",
      });
      return;
    }

    setSaving(true);
    try {
      const numericPrice = parseInt(price.replace(/\D/g, ''), 10) || 0;
      const numericDiscount = parseFloat(discount) || 0;
      const finalName = name.trim() || look?.name || `Look ${new Date().toLocaleDateString('uz-UZ')}`;

      const lookData = {
        name: finalName,
        description: description.trim() || 'Auralook Exclusive Piece',
        price: numericPrice,
        discount: numericDiscount,
        currency,
        hasShoe,
        imageUrl: imageUrl || look?.imageUrl || 'https://picsum.photos/seed/default-look/600/800',
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'looks', id), lookData);

      toast({ 
        title: t(dictionary.operationSuccess),
        description: "Changes have been saved to the catalog."
      });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: t(dictionary.errorTitle),
      });
    } finally {
      setSaving(false);
    }
  };

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground/40 font-mono text-[10px] uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-foreground/40 uppercase font-black italic">Look not found</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8 sm:space-y-12 pb-32">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full border border-foreground/10 h-10 w-10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-black tracking-tighter neon-text uppercase italic">{t(dictionary.editCatalogItem)}</h1>
          <p className="text-foreground/60 text-[10px] font-black uppercase tracking-[0.3em]">{t(dictionary.authorizedDeployment)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-surface rounded-[2.5rem] overflow-hidden aspect-[3/4] relative group shadow-2xl bg-foreground/[0.02]">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-4 opacity-20">
                <ImageIcon className="w-16 h-16" />
                <p className="text-[10px] font-black uppercase tracking-widest">{t(dictionary.nothingFound)}</p>
              </div>
            )}
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group">
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-6 py-3 rounded-full border border-white/20 shadow-2xl">
                  {t(dictionary.changeMediaLabel)}
                </span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </Card>
          
          <div className="space-y-4">
            <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40 px-4">Remote Asset URL</Label>
            <Input 
              className="bg-foreground/5 border-foreground/10 h-12 rounded-2xl text-[10px] focus:neon-border" 
              placeholder={t(dictionary.imageUrlPlaceholder)}
              value={imageUrl.startsWith('data:') ? '' : imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-surface rounded-[2.5rem] p-8 sm:p-10 space-y-8 shadow-2xl">
            <div className="space-y-4">
              <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">{t(dictionary.productDesignationLabel)}</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground font-bold text-lg" 
                placeholder="e.g. Cyber Runner Jacket v2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">{t(dictionary.priceAndCurrencyLabel)}</Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="text" 
                    value={price}
                    onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                    className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl flex-1 focus:neon-border text-foreground font-black text-xl tracking-tighter" 
                    placeholder={currency === 'UZS' ? '189.000' : '189'}
                  />
                  
                  <div className="flex gap-1 p-1 bg-foreground/10 rounded-2xl border border-foreground/10 h-14 min-w-[140px]">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrency('USD')}
                      className={cn(
                        "flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all h-full",
                        currency === 'USD' ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                      )}
                    >
                      USD
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrency('UZS')}
                      className={cn(
                        "flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all h-full",
                        currency === 'UZS' ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                      )}
                    >
                      UZS
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">{t(dictionary.discountLabel)}</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground font-bold" 
                    placeholder="0"
                  />
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">INCLUDES SHOE / POYABZAL BOR?</Label>
              <div className="flex gap-1 p-1 bg-foreground/10 rounded-2xl border border-foreground/10 h-14">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setHasShoe(false)}
                  className={cn(
                    "flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all h-full",
                    !hasShoe ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                  )}
                >
                  ❌ No
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setHasShoe(true)}
                  className={cn(
                    "flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all h-full",
                    hasShoe ? "neon-bg text-white" : "text-foreground/40 hover:text-foreground"
                  )}
                >
                  👟 Yes
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">{t(dictionary.technicalSpecLabel)}</Label>
              <Textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-foreground/5 border-foreground/10 rounded-[2rem] p-6 focus:neon-border text-foreground leading-relaxed italic font-medium"
                placeholder="Describe fit, fabric tech, and aesthetic..."
              />
            </div>

            <div className="pt-6 border-t border-foreground/10 flex flex-col sm:flex-row justify-end gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest text-foreground/40 hover:text-foreground">{t(dictionary.cancel)}</Button>
              <Button 
                onClick={handleUpdate} 
                disabled={saving}
                className="neon-bg text-black font-black px-12 rounded-2xl h-14 border-none shadow-2xl hover:scale-105 active:scale-95 transition-all min-w-[220px]"
              >
                {saving ? <Loader2 className="animate-spin" /> : (
                  <><Save className="w-4 h-4 mr-2" /> {t(dictionary.updateCatalog)}</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
