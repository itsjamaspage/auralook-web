
"use client"

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  DollarSign, 
  Percent, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  Send,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { postNewLookToChannel } from '@/ai/flows/ai-telegram-order-status-notification';
import { getProductDeepLink } from '@/lib/telegram-link';
import { useTelegramUser } from '@/hooks/use-telegram-user';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Sets'];

export default function NewLookPage() {
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ productId: string, deepLink: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    currency: 'USD' as 'USD' | 'UZS',
    category: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const db = useFirestore();
  const storage = useStorage();
  const { user: firebaseUser } = useUser();
  const { user: tgUser } = useTelegramUser();

  // ADMIN AUTH PROTECTION: Strict email and role check (Including Editors)
  const isAuthorized = firebaseUser?.email === 'jkhakimjonov8@gmail.com' || 
                       tgUser?.role === 'owner' || 
                       tgUser?.role === 'editor';

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePublish = async () => {
    if (!form.name || !form.price || !imageFile || !form.category) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a name, price, category, and image.",
      });
      return;
    }

    setPublishing(true);
    try {
      // 1. Upload to Firebase Storage
      const storagePath = `products/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Save to Firestore
      const numericPrice = form.currency === 'UZS' 
        ? parseInt(form.price.replace(/\D/g, ''), 10) 
        : parseFloat(form.price);

      const lookData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: numericPrice || 0,
        discount: parseFloat(form.discount) || 0,
        currency: form.currency,
        category: form.category,
        imageUrl,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'looks'), lookData);
      const deepLink = getProductDeepLink(docRef.id);

      // 3. Auto-broadcast to Telegram
      await postNewLookToChannel({
        id: docRef.id,
        name: lookData.name,
        price: lookData.price,
        currency: lookData.currency,
        description: lookData.description,
        imageUrl: lookData.imageUrl
      });

      setResult({ productId: docRef.id, deepLink });
      toast({ title: t(dictionary.lookSavedSuccess) });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Publishing Failed" });
    } finally {
      setPublishing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link Copied" });
  };

  if (!isAuthorized && firebaseUser) {
    return (
      <div className="container mx-auto px-6 py-32 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto opacity-20" />
        <h1 className="text-xl font-black text-foreground uppercase italic">Access Denied</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">Only authorized admins or editors can publish new looks.</p>
        <Button onClick={() => router.push('/admin')} variant="outline" className="rounded-xl border-foreground/10 text-foreground">Return to Base</Button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl animate-in fade-in zoom-in duration-500 pb-32">
        <Card className="glass-surface border-foreground/10 p-10 rounded-[3rem] space-y-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 neon-bg opacity-50" />
          
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10 mx-auto">
              <CheckCircle2 className="w-10 h-10 neon-text" />
            </div>
            <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Look Published</h1>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-[0.3em]">Protocol Executed Successfully</p>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest text-left px-2">Telegram Deep Link</p>
            <div className="flex gap-2 bg-foreground/5 p-4 rounded-2xl border border-foreground/10">
              <code className="text-[10px] font-mono text-primary flex-grow text-left break-all leading-relaxed">{result.deepLink}</code>
              <Button onClick={handleCopy} size="icon" variant="ghost" className="shrink-0 h-10 w-10 rounded-xl hover:neon-text">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-start gap-4 p-5 bg-foreground/5 rounded-2xl border border-foreground/5 group hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0"><Send className="w-5 h-5 neon-text" /></div>
              <div className="space-y-1">
                <p className="text-xs font-black text-foreground uppercase tracking-widest">Telegram Channel</p>
                <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">The look has been auto-posted to @auralook_uz with an order button.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-foreground/5 rounded-2xl border border-foreground/5 group hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 neon-text" /></div>
              <div className="space-y-1">
                <p className="text-xs font-black text-foreground uppercase tracking-widest">Instagram Strategy</p>
                <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">Paste this link in your Bio tool and point your next story/post to it for direct orders.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => setResult(null)} className="h-14 rounded-2xl neon-bg text-black font-black uppercase tracking-widest border-none">Publish Another</Button>
            <Button variant="ghost" onClick={() => router.push('/admin')} className="text-foreground/40 hover:text-foreground">Back to Inventory</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8 sm:space-y-12 pb-32">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-10 neon-bg rounded-full" />
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-black tracking-tighter neon-text uppercase italic">New Look Drop</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Authorized Deployment Session</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-4 space-y-6">
          <Card 
            onClick={() => fileRef.current?.click()}
            className="glass-surface rounded-[2.5rem] overflow-hidden aspect-[3/4] relative group cursor-pointer border-foreground/10 hover:border-primary/20 transition-all shadow-2xl bg-muted/20"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10 group-hover:neon-border transition-all">
                  <Plus className="w-8 h-8 neon-text" />
                </div>
                <p className="text-[10px] font-black text-center text-foreground/40 uppercase tracking-[0.3em]">Drop image or tap to upload</p>
              </div>
            )}
            {imagePreview && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/20">Change Media</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <Card className="glass-surface rounded-[2.5rem] p-8 sm:p-10 space-y-8 border-foreground/10 shadow-2xl">
            <div className="space-y-4">
              <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">Product Designation</Label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground font-bold" 
                placeholder="e.g. Cyber Runner Jacket v2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">Price & Currency</Label>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl flex-1 focus:neon-border text-foreground font-bold" 
                    placeholder="189000"
                  />
                  <RadioGroup 
                    value={form.currency} 
                    onValueChange={(v: any) => setForm({...form, currency: v})}
                    className="flex items-center gap-3 bg-foreground/5 px-4 h-14 rounded-2xl border border-foreground/10"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="USD" id="usd" />
                      <Label htmlFor="usd" className="text-[10px] font-black text-foreground">USD</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="UZS" id="uzs" />
                      <Label htmlFor="uzs" className="text-[10px] font-black text-foreground">UZS</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">Category Segment</Label>
                <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                  <SelectTrigger className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground font-bold">
                    <SelectValue placeholder="Select Segment" />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-foreground/10">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-foreground uppercase font-bold text-[10px]">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black uppercase tracking-[0.2em] text-[10px] text-foreground/40">Technical Specification</Label>
              <Textarea 
                rows={4}
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="bg-foreground/5 border-foreground/10 rounded-3xl p-6 focus:neon-border text-foreground leading-relaxed italic" 
                placeholder="Describe fit, fabric tech, and aesthetic..."
              />
            </div>

            <div className="pt-6 border-t border-foreground/10 flex flex-col sm:flex-row justify-end gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest text-foreground/40 hover:text-foreground">Cancel</Button>
              <Button 
                onClick={handlePublish} 
                disabled={publishing}
                className="neon-bg text-black font-black px-12 rounded-2xl h-14 border-none shadow-2xl hover:scale-105 active:scale-95 transition-all min-w-[200px]"
              >
                {publishing ? <Loader2 className="animate-spin" /> : (
                  <><Zap className="w-4 h-4 mr-2 fill-current" /> Publish Look</>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
