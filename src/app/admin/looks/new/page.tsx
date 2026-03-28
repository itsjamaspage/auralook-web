"use client"

import { useState } from 'react';
import { aiProductDescriptionGeneration } from '@/ai/flows/ai-product-description-generation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewLookPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keywords, setKeywords] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD');
  const [imageUrl, setImageUrl] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const db = useFirestore();

  async function generateDescriptions() {
    if (!keywords) return;
    setLoading(true);
    try {
      const result = await aiProductDescriptionGeneration({
        keywords,
        languages: ['uz']
      });
      setDescription(result.uz || '');
      toast({
        title: "AI Generated Content",
        description: "SEO-friendly description created successfully.",
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: "Could not generate description.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!name || !description || !price) {
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
        name,
        description,
        price: parseFloat(price),
        currency,
        imageUrl: imageUrl || 'https://picsum.photos/seed/default-look/600/800',
        createdAt: serverTimestamp(),
        tags: keywords.split(',').map(k => k.trim()).filter(k => k !== '')
      };

      await addDoc(collection(db, 'looks'), lookData);

      toast({ 
        title: t(dictionary.lookSavedSuccess), 
        description: "Your new look has been added to the catalog." 
      });
      router.push('/admin');
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save the look to Firestore.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tighter neon-text uppercase italic">{t(dictionary.createNewLook)}</h1>
        <p className="text-white/60 font-medium">{t(dictionary.createNewLookDesc)}</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Media Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-dark rounded-[2.5rem] overflow-hidden aspect-[3/4] relative group bg-white/[0.02] border-white/10">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover opacity-80 transition-opacity"
              />
            )}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 border-dashed border-2 ${imageUrl ? 'border-white/20' : 'border-white/10'} m-4 rounded-[2rem] hover:neon-border transition-colors group`}>
              {!imageUrl && (
                <div className="bg-white/5 p-6 rounded-full mb-4 group-hover:neon-border transition-all">
                  <Plus className="w-12 h-12 neon-text" />
                </div>
              )}
              <p className="text-xs font-bold text-center text-white/80 uppercase tracking-widest">{t(dictionary.uploadImage)}</p>
              <Input 
                className="mt-4 bg-white/5 border-white/10 text-xs text-white placeholder:text-white/20" 
                placeholder="Image URL" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Form Main Area */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-dark rounded-[2.5rem] p-10 space-y-8 border-white/10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/40">
                  <ImageIcon className="w-4 h-4 neon-text" />
                  {t(dictionary.lookName)}
                </Label>
                <Input 
                  placeholder="e.g. Cyber Runner v2" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl focus:neon-border text-white placeholder:text-white/20" 
                />
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/40">
                  <Sparkles className="w-4 h-4 neon-text" />
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
            </div>

            {/* AI Generator Section */}
            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] text-white/40">
                  <Sparkles className="w-4 h-4 neon-text" />
                  {t(dictionary.aiDescGenerator)}
                </Label>
                <div className="flex gap-4">
                  <Input 
                    placeholder={t(dictionary.keywordsPlaceholder)} 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="bg-white/5 border-white/10 h-14 rounded-2xl flex-1 focus:neon-border text-white placeholder:text-white/20"
                  />
                  <Button 
                    onClick={generateDescriptions} 
                    disabled={loading || !keywords}
                    className="neon-bg text-black font-black px-8 rounded-2xl h-14 border-none transition-transform active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : t(dictionary.generate)}
                  </Button>
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
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t border-white/10">
              <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 rounded-2xl h-14 px-8 font-bold text-white/40 hover:text-white transition-colors">
                {t(dictionary.cancel)}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="neon-bg text-black font-black px-16 rounded-2xl h-14 border-none shadow-2xl transition-all hover:scale-105 active:scale-95"
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