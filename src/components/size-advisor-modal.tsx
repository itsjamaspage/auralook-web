"use client"

import { useState } from 'react';
import { smartSizeRecommendation, type SmartSizeRecommendationOutput } from '@/ai/flows/ai-smart-size-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ruler, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export function SizeAdvisorModal() {
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
    <Dialog onOpenChange={(open) => !open && setResult(null)}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full rounded-2xl glass-dark border-white/5 hover:border-primary/50 text-foreground transition-all">
          <Ruler className="w-4 h-4 mr-2" />
          AI Size Advisor
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-dark border-white/10 max-w-md text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="w-6 h-6 text-primary" />
            Smart Advisor
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Our AI will calculate your perfect fit based on your physique.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input 
                  type="number" 
                  value={formData.height} 
                  onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup value={formData.gender} onValueChange={(val: any) => setFormData({...formData, gender: val})} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Desired Fit</Label>
              <RadioGroup value={formData.fit} onValueChange={(val: any) => setFormData({...formData, fit: val})} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tight" id="tight" />
                  <Label htmlFor="tight">Tight</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="reg" />
                  <Label htmlFor="reg">Regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loose" id="loose" />
                  <Label htmlFor="loose">Loose</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleRecommend} 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 text-lg rounded-2xl"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Calculate Size"}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary animate-pulse mb-2">
              <span className="text-4xl font-black text-primary">{result.recommendedSize}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Recommended Size: {result.recommendedSize}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed px-4 italic">
                "{result.explanation}"
              </p>
            </div>
            <Button onClick={() => setResult(null)} variant="outline" className="w-full rounded-xl border-white/10">
              Adjust Measurements
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}