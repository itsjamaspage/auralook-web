
"use client"

import { useState } from 'react';
import { aiProductDescriptionGeneration } from '@/ai/flows/ai-product-description-generation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';

export default function NewLookPage() {
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();

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
    } finally {
      setLoading(false);
    }
  }

  const handleSave = () => {
    toast({ title: "Look Saved", description: "Your new look has been added to the catalog." });
    router.push('/admin');
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl space-y-12">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter neon-text">{t(dictionary.createNewLook)}</h1>
        <p className="text-muted-foreground">{t(dictionary.createNewLookDesc)}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-dark border-white/5 rounded-3xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-center p-8 border-dashed border-2 hover:neon-border transition-colors group">
            <div className="bg-white/5 p-6 rounded-full mb-4 group-hover:neon-border transition-all">
              <Plus className="w-12 h-12 neon-text" />
            </div>
            <p className="text-sm font-bold text-center">{t(dictionary.uploadImage)}</p>
            <p className="text-xs text-muted-foreground text-center mt-2">Max: 50MB. PNG/JPG</p>
          </Card>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t(dictionary.lookName)}</Label>
              <Input placeholder="Cyber Runner" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>{t(dictionary.lookPrice)}</Label>
              <Input type="number" placeholder="299" className="bg-white/5 border-white/10" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="glass-dark border-white/5 rounded-3xl p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 neon-text" />
                  {t(dictionary.aiDescGenerator)}
                </Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder={t(dictionary.keywordsPlaceholder)} 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-white/5 border-white/10 h-12"
                />
                <Button 
                  onClick={generateDescriptions} 
                  disabled={loading || !keywords}
                  className="neon-bg text-black font-bold px-6 rounded-xl border-none h-12"
                >
                  {loading ? <Loader2 className="animate-spin" /> : t(dictionary.generate)}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {t(dictionary.aiUzbekHint)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t(dictionary.lookDescription)}</Label>
              <Textarea 
                className="min-h-[300px] bg-white/5 border-white/10 leading-relaxed font-light" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 rounded-xl">{t(dictionary.cancel)}</Button>
              <Button onClick={handleSave} className="neon-bg text-black font-bold px-12 rounded-xl h-12 border-none transition-transform hover:scale-105">
                {t(dictionary.publish)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
