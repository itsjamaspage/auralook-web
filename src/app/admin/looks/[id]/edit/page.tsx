"use client"

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Plus, DollarSign, Percent, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

export default function EditLookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const db = useFirestore();

  const lookRef = useMemoFirebase(() => doc(db, 'looks', id), [db, id]);
  const { data: look, isLoading: lookLoading } = useDoc(lookRef);

  useEffect(() => {
    if (look) {
      setName(look.name || '');
      setDescription(look.description || '');
      setPrice(look.price?.toString() || '');
      setDiscount(look.discount?.toString() || '0');
      setCurrency(look.currency || 'USD');
      setImageUrl(look.imageUrl || '');
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
      const lookData = {
        name: name || `Look ${new Date().toLocaleDateString()}`,
        description,
        price: parseFloat(price),
        discount: parseFloat(discount) || 0,
        currency,
        imageUrl: imageUrl || 'https://picsum.photos/seed/default-look/600/800',
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'looks', id), lookData);

      toast({ 
        title: "Look Updated",
        description: "Changes have been saved to the catalog."
      });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Update Failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (lookLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">LOADING REPOSITORY...</p>
      </div>
    );
  }

  if (!look) return <div className="p-24 text-center text-white/40 uppercase font-black italic">Look not found</div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter neon-text uppercase italic">Edit Catalog Item</h1>
        <p className="text-white/60 font-medium">Modify technical specifications and visual assets.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-dark rounded-[2.5rem] overflow-hidden aspect-[3/4] relative group bg-white/[0.02] border-white/10">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover opacity-80 transition-opacity"
              />
            )}
            <label className={`absolute inset-0 flex flex-col items-center justify-center p-8 border-dashed border-2 ${imageUrl ? 'border-white/20' : 'border-white/10'} m-4 rounded-[2rem] hover:neon-border transition-colors group cursor-pointer`}>
              {!imageUrl && (
                <div className="bg-white/5 p-6 rounded-full mb-4 group-hover:neon-border transition-all">
                  <Plus className="w-12 h-12 neon-text" />
                </div>
              )}
              <p className="text-xs font-bold text-center text-white/80 uppercase tracking-widest">{t(dictionary.uploadImage)}</p>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <div className="mt-4 w-full px-4" onClick={(e) => e.stopPropagation()}>
                <Input 
                  className="bg-white/5 border-white/10 text-xs text-white placeholder:text-white/20 pointer-events-auto" 
                  placeholder="Or enter Image URL" 
                  value={imageUrl.startsWith('data:') ? '' : imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
            </label>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-dark rounded-[2.5rem] p-10 space-y-8 border-white/10">
            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Item Name</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 h-14 rounded-2xl focus:neon-border text-white placeholder:text-white/20" 
                placeholder="Cyber Runner Outfit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/40">
                  <DollarSign className="w-4 h-4 neon-text" />
                  {t(dictionary.lookPrice)}
                </Label>
                <div className="flex gap-4">
                  <Input 
                    type="number" 
                    placeholder="299" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-white/5 border-white/10 h-14 rounded-2xl flex-1 focus:neon-border text-white placeholder:text-white/20" 
                  />
                  <RadioGroup 
                    value={currency} 
                    onValueChange={(v: any) => setCurrency(v)}
                    className="flex items-center gap-4 bg-white/5 px-4 rounded-2xl border border-white/10"
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
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/40">
                  <Percent className="w-4 h-4 neon-text" />
                  Discount (%)
                </Label>
                <Input 
                  type="number" 
                  placeholder="20" 
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl focus:neon-border text-white placeholder:text-white/20" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">{t(dictionary.lookDescription)}</Label>
              <Textarea 
                className="min-h-[200px] bg-white/5 border-white/10 rounded-[2rem] p-6 leading-relaxed font-light text-white text-lg focus:neon-border placeholder:text-white/20" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the aesthetic..."
              />
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t border-white/10">
              <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 rounded-2xl h-14 px-8 font-bold text-white/40 hover:text-white transition-colors">
                {t(dictionary.cancel)}
              </Button>
              <Button 
                onClick={handleUpdate} 
                disabled={saving}
                className="neon-bg text-black font-black px-16 rounded-2xl h-14 border-none shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" /> : <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Catalog
                </>}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
