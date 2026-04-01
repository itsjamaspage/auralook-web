"use client"

import { useState } from 'react';
import { smartSizeRecommendation, type SmartSizeRecommendationOutput } from '@/ai/flows/ai-smart-size-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Ruler, Loader2, Sparkles, Send, UserCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdvisorPage() {
  const { t, dictionary } = useLanguage();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SmartSizeRecommendationOutput | null>(null);
  
  const [formData, setFormData] = useState({
    height: 175,
    weight: 70,
    gender: 'male' as 'male' | 'female' | 'other',
    fit: 'regular' as 'tight' | 'regular' | 'loose',
    knownSize: ''
  });

  async function handleAIRecommend() {
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

  async function handleSendToAdmin() {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Tizimga kiring",
        description: "Murojaat yuborish uchun tizimga kirishingiz kerak."
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'consultations'), {
        userId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Mijoz',
        telegramUsername: (user as any).telegramUsername || 'Not provided',
        heightCm: formData.height,
        weightKg: formData.weight,
        gender: formData.gender,
        desiredFit: formData.fit,
        knownSize: formData.knownSize || 'Noma\'lum',
        createdAt: new Date().toISOString()
      });

      toast({
        title: "Yuborildi",
        description: "Sizning ma'lumotlaringiz menejerga yuborildi. Tez orada bog'lanamiz."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Xatolik",
        description: "Ma'lumotlarni yuborishda xatolik yuz berdi."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex items-center gap-3">
        <Ruler className="w-6 h-6 neon-text transition-none" />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
          {t(dictionary.razmeringiz)}
        </h1>
      </div>

      <Card className="glass-dark border-white/10 p-8 space-y-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tighter">
            <Zap className="w-5 h-5 neon-text transition-none" />
            O'lcham Ma'lumotlari
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Menejerga ma'lumotlaringizni yuboring va mukammal moslikni oling.
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
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white transition-none"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Vazningiz (kg)</Label>
                <Input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white transition-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">O'lchamingiz (agar bilsangiz)</Label>
              <Input 
                placeholder="Masalan: M yoki 48"
                value={formData.knownSize}
                onChange={(e) => setFormData({...formData, knownSize: e.target.value})}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:neon-border text-white transition-none"
              />
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Jinsingiz</Label>
              <RadioGroup value={formData.gender} onValueChange={(val: any) => setFormData({...formData, gender: val})} className="flex gap-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" className="transition-none" />
                  <Label htmlFor="male" className="text-xs font-bold text-white/80">Erkak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" className="transition-none" />
                  <Label htmlFor="female" className="text-xs font-bold text-white/80">Ayol</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label className="font-bold uppercase tracking-widest text-[10px] text-white/40">Kiyinish uslubingiz</Label>
              <RadioGroup value={formData.fit} onValueChange={(val: any) => setFormData({...formData, fit: val})} className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tight" id="tight" className="transition-none" />
                  <Label htmlFor="tight" className="text-xs font-bold text-white/80">Yopishib turadigan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="reg" className="transition-none" />
                  <Label htmlFor="reg" className="text-xs font-bold text-white/80">O'rtacha</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loose" id="loose" className="transition-none" />
                  <Label htmlFor="loose" className="text-xs font-bold text-white/80">Kengroq</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <Button 
                onClick={handleAIRecommend} 
                disabled={loading || submitting}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-widest border-none shadow-2xl transition-none"
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : (
                  <><Sparkles className="w-4 h-4 mr-2" /> AI Hisoblash</>
                )}
              </Button>
              <Button 
                onClick={handleSendToAdmin} 
                disabled={loading || submitting}
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:neon-border hover:neon-text transition-none"
              >
                {submitting ? <Loader2 className="animate-spin mr-2" /> : (
                  <><Send className="w-4 h-4 mr-2" /> Menejerga yuborish</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/5 border-2 neon-border animate-pulse mb-2 transition-none">
              <span className="text-5xl font-black neon-text transition-none">{result.recommendedSize}</span>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2 text-white">
                Tavsiya etilgan o'lcham: {result.recommendedSize}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed px-6 italic font-medium">
                "{result.explanation}"
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleSendToAdmin} 
                disabled={submitting}
                className="w-full h-14 rounded-2xl neon-bg text-black font-black text-sm uppercase tracking-widest border-none transition-none"
              >
                <UserCheck className="w-4 h-4 mr-2" /> Menejer tasdiqlashi
              </Button>
              <Button 
                  onClick={() => setResult(null)} 
                  variant="ghost" 
                  className="w-full rounded-xl border border-white/10 text-white/40 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                O'lchamlarni o'zgartirish
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
