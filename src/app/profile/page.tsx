
"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, Package, ChevronRight, Save, Loader2, Send, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const { user, isLoading } = useTelegramUser();
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
    if (!user || user.firebaseUid === 'pending') return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        phone: phone,
        updatedAt: serverTimestamp()
      });
      toast({ title: t(dictionary.success), description: t(dictionary.detailsUpdated) });
    } catch (e) {
      toast({ variant: "destructive", title: t(dictionary.errorTitle), description: t(dictionary.errorDescription) });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin neon-text stroke-[1px]" />
        <p className="text-foreground font-mono text-[10px] uppercase tracking-widest italic animate-pulse">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-6">
        <User className="w-16 h-16 neon-text mx-auto opacity-20" />
        <h1 className="text-xl font-black text-foreground uppercase italic">{t(dictionary.identificationRequired)}</h1>
        <p className="text-foreground/70 text-sm max-w-xs mx-auto">{t(dictionary.openInBot)}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute -inset-4 neon-bg opacity-20 blur-2xl rounded-full" />
          <Avatar className="w-24 h-24 border-2 neon-border p-1 bg-background shadow-2xl">
            <AvatarImage src={user.photoUrl || undefined} alt={user.firstName} />
            <AvatarFallback className="bg-foreground/5">
              <User className="w-10 h-10 neon-text" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-foreground italic uppercase tracking-tight">
            {user.firstName}
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2">
              <Send className="w-3 h-3 neon-text" />
              <p className="text-[10px] font-bold neon-text uppercase tracking-[0.2em] font-mono">
                @{user.username || 'user'}
              </p>
            </div>
            <p className="text-[9px] font-black text-foreground/70 uppercase tracking-widest">{t(dictionary.activeNode)}</p>
          </div>
        </div>
      </div>

      <Card className="glass-surface border-foreground/10 p-6 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 neon-text" />
            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">{t(dictionary.contactInformation)}</Label>
          </div>
          <div className="flex gap-3">
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground text-base transition-all"
            />
            <Button 
              onClick={handleUpdatePhone}
              disabled={isSaving || user.firebaseUid === 'pending'}
              className="h-14 w-14 rounded-2xl neon-bg border-none shadow-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {[
          { icon: Package, label: t(dictionary.orderHistory), href: '/orders' },
        ].map((item) => (
          <Card 
            key={item.label} 
            onClick={() => item.href !== '#' && router.push(item.href)}
            className="glass-surface border-foreground/10 p-5 flex items-center justify-between group hover:border-primary/20 active:scale-[0.98] transition-all cursor-pointer rounded-[2rem]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-foreground/5 rounded-xl group-hover:neon-border transition-colors">
                <item.icon className="w-5 h-5 neon-text" />
              </div>
              <span className="font-bold text-sm text-foreground uppercase tracking-widest">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:neon-text transition-all" />
          </Card>
        ))}
      </div>
    </div>
  );
}
