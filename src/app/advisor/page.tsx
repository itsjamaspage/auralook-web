"use client"

import { useState } from 'react';
import { smartSizeRecommendation, type SmartSizeRecommendationOutput } from '@/ai/flows/ai-smart-size-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Ruler, Loader2, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export default function AdvisorPage() {
  const { t, dictionary } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartSizeRecommendationOutput | null>(null);
  
  const [formData, setFormData] = useState({
    height: 175,
    weight: 70,
    gender: 'male' as 'male' | 'female' | 'other',
    fit: 'regular' as 'tight' | 'regular' | 'loose'
  });

  async function handleRecommend() {
    setLoading(true);
    try {
      const recommendation = await smartSizeRecommendation({
        heightCm: formData.height,
        weightKg: formData.weight,
        gender: formData.gender,
        desiredFit: formData.fit
      });
      setResult(recommendation);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex items-center gap-3">
        <Zap className="w-6 h-6 neon-text" />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
          {t(dictionary.advisor)}
        </h1>
      </div>

      <Card className="glass-dark border-white/10 p-8 space-y-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Ruler className="w-32 h-32" />
        </div>

        <div className="space-y-2 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 neon-text" />
            Smart Advisor
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Bizning AI sizning tanangizga mos keladigan mukammal o'lchamni hisoblab chiqadi.
          </p>
        </div>

        {!result ? (
          <div className="space-y-8 py-4 relative z-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Bo'yingiz (cm)</Label>
                <Input 
                  type="number" 
                  value={formData.height} 
                  onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Vazningiz (kg)</Label>
                <Input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Jinsingiz</Label>
              <RadioGroup value={formData.gender} onValueChange={(val: any) => setFormData({...formData, gender: val})} className="flex gap-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                  <Label htmlFor="male" className="text-xs font-bold text-white/80">Erkak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                  <Label htmlFor="female" className="text-xs font-bold text-white/80">Ayol</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Kiyinish uslubingiz</Label>
              <RadioGroup value={formData.fit} onValueChange={(val: any) => setFormData({...formData, fit: val})} className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tight" id="tight" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                  <Label htmlFor="tight" className="text-xs font-bold text-white/80">Yopishib turadigan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="reg" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                  <Label htmlFor="reg" className="text-xs font-bold text-white/80">O'rtacha</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loose" id="loose" className="border-white/20 data-[state=checked]:neon-bg data-[state=checked]:border-none" />
                  <Label htmlFor="loose" className="text-xs font-bold text-white/80">Kengroq</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleRecommend} 
              disabled={loading}
              className="w-full h-14 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-widest border-none shadow-2xl transition-all hover:scale-105"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Hisoblash"}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/5 border-2 neon-border animate-pulse mb-2">
              <span className="text-5xl font-black neon-text">{result.recommendedSize}</span>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2 text-white">
                <CheckCircle2 className="w-6 h-6 neon-text" />
                Tavsiya etilgan o'lcham: {result.recommendedSize}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed px-6 italic font-medium">
                "{result.explanation}"
              </p>
            </div>
            <Button 
                onClick={() => setResult(null)} 
                variant="ghost" 
                className="w-full rounded-xl border border-white/10 text-white/40 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
            >
              O'lchamlarni o'zgartirish
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
