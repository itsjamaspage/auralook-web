"use client"

import { useState } from 'react';
import { aiProductDescriptionGeneration } from '@/ai/flows/ai-product-description-generation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Image as ImageIcon, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewLookPage() {
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [descriptions, setDescriptions] = useState<Record<string, string>>({
    en: '',
    ru: '',
    uz: ''
  });
  const { toast } = useToast();
  const router = useRouter();

  async function generateDescriptions() {
    if (!keywords) return;
    setLoading(true);
    try {
      const result = await aiProductDescriptionGeneration({
        keywords,
        languages: ['en', 'ru', 'uz']
      });
      setDescriptions(result);
      toast({
        title: "AI Generated Content",
        description: "SEO-friendly descriptions created for all languages.",
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
        <h1 className="text-4xl font-black tracking-tighter">Create New Look</h1>
        <p className="text-muted-foreground">Add high-resolution media and AI-enhanced descriptions.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-dark border-white/5 rounded-3xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-center p-8 border-dashed border-2">
            <div className="bg-white/5 p-6 rounded-full mb-4">
              <Plus className="w-12 h-12 text-primary" />
            </div>
            <p className="text-sm font-bold text-center">Upload Look Image</p>
            <p className="text-xs text-muted-foreground text-center mt-2">Max size: 50MB. PNG/JPG</p>
          </Card>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Look Name (EN)</Label>
              <Input placeholder="e.g. Cyber Runner" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Price (USD)</Label>
              <Input type="number" placeholder="299" className="bg-white/5 border-white/10" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="glass-dark border-white/5 rounded-3xl p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Content Generator
                </Label>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter keywords (e.g. waterproof, reflective, streetstyle, techwear)" 
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="bg-white/5 border-white/10 h-12"
                />
                <Button 
                  onClick={generateDescriptions} 
                  disabled={loading || !keywords}
                  className="bg-primary text-primary-foreground font-bold px-6 rounded-xl"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Generate"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                AI will generate professional copy in 3 languages
              </p>
            </div>

            <Tabs defaultValue="en" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 mb-4 p-1 rounded-xl">
                <TabsTrigger value="en" className="rounded-lg">English</TabsTrigger>
                <TabsTrigger value="ru" className="rounded-lg">Русский</TabsTrigger>
                <TabsTrigger value="uz" className="rounded-lg">O'zbek</TabsTrigger>
              </TabsList>
              <TabsContent value="en">
                <Textarea 
                  className="min-h-[250px] bg-white/5 border-white/10 leading-relaxed font-light" 
                  value={descriptions.en} 
                  onChange={(e) => setDescriptions({...descriptions, en: e.target.value})}
                  placeholder="Description in English..."
                />
              </TabsContent>
              <TabsContent value="ru">
                <Textarea 
                  className="min-h-[250px] bg-white/5 border-white/10 leading-relaxed font-light" 
                  value={descriptions.ru} 
                  onChange={(e) => setDescriptions({...descriptions, ru: e.target.value})}
                  placeholder="Описание на русском..."
                />
              </TabsContent>
              <TabsContent value="uz">
                <Textarea 
                  className="min-h-[250px] bg-white/5 border-white/10 leading-relaxed font-light" 
                  value={descriptions.uz} 
                  onChange={(e) => setDescriptions({...descriptions, uz: e.target.value})}
                  placeholder="O'zbek tilidagi tavsif..."
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
              <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="bg-primary text-primary-foreground font-bold px-12 rounded-xl h-12">Publish Look</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}