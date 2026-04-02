
"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Shield, Package, Settings, ChevronRight, Save, Loader2, Send, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const { user, isLoading, isVerified } = useTelegramUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const handleUpdatePhone = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        phone: phone,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Muvaffaqiyatli", description: "Telefon raqamingiz yangilandi." });
    } catch (e) {
      toast({ variant: "destructive", title: "Xatolik", description: "Ma'lumotni saqlashda xatolik yuz berdi." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Identifying Protocol...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4">
          <Shield className="w-10 h-10 text-white/20" />
        </div>
        <h1 className="text-xl font-black text-white uppercase italic">Access Denied</h1>
        <p className="text-white/40 text-sm max-w-xs mx-auto">Please open this application through the official Telegram Bot to verify your identity.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute -inset-4 neon-bg opacity-20 blur-2xl rounded-full" />
          <Avatar className="w-24 h-24 border-2 neon-border p-1 bg-black">
            <AvatarImage src={user?.photoUrl || undefined} alt={user?.firstName} />
            <AvatarFallback className="bg-white/5">
              <User className="w-10 h-10 text-primary" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {user?.firstName || 'Cyber Voyager'}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Send className="w-3 h-3 text-primary" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] font-mono">
              @{user?.username || 'unknown'}
            </p>
          </div>
        </div>
      </div>

      <Card className="glass-dark border-white/10 p-6 rounded-[2.5rem] space-y-6 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 neon-text" />
            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Aloqa Ma'lumotlari</Label>
          </div>
          <div className="flex gap-3">
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="bg-white/5 border-white/10 h-14 rounded-2xl focus:neon-border text-white text-base"
            />
            <Button 
              onClick={handleUpdatePhone}
              disabled={isSaving}
              className="h-14 w-14 rounded-2xl neon-bg border-none shadow-xl"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            </Button>
          </div>
          <p className="text-[9px] text-white/30 italic px-2">Telefon raqamingiz buyurtma berishda avtomatik ko'rsatiladi.</p>
        </div>
      </Card>

      <div className="space-y-4">
        {[
          { icon: Package, label: t(dictionary.orderHistory), color: 'text-blue-400', href: '/orders' },
          { icon: Settings, label: t(dictionary.systemPreferences), color: 'text-purple-400', href: '#' },
        ].map((item) => (
          <Card 
            key={item.label} 
            onClick={() => item.href !== '#' && router.push(item.href)}
            className="glass-dark border-white/5 p-5 flex items-center justify-between group hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer rounded-[2rem]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl group-hover:neon-border transition-colors">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="font-bold text-sm text-white/80 uppercase tracking-widest">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:neon-text transition-all" />
          </Card>
        ))}
      </div>
    </div>
  );
}
