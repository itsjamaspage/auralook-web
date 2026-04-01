"use client"

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Package, Settings, ChevronRight, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function ProfilePage() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(profileRef);

  if (!user) return (
    <div className="container mx-auto px-6 py-24 text-center">
      <p className="text-white/40 uppercase font-black italic">Unauthorized Access. Please login.</p>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute -inset-4 neon-bg opacity-20 blur-2xl rounded-full" />
          <Avatar className="w-24 h-24 border-2 neon-border p-1">
            <AvatarImage src={profile?.photoUrl} className="rounded-full" />
            <AvatarFallback className="bg-white/5">
              <User className="w-10 h-10 text-primary" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {profile?.firstName || 'Cyber Voyager'}
          </h1>
          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
            {profile?.telegramUsername || user.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { icon: Package, label: 'Order History', color: 'text-blue-400' },
          { icon: Shield, label: 'Security Protocols', color: 'text-green-400' },
          { icon: Settings, label: 'System Preferences', color: 'text-purple-400' },
        ].map((item) => (
          <Card key={item.label} className="glass-dark border-white/5 p-5 flex items-center justify-between group hover:border-white/20 transition-all cursor-pointer rounded-[1.5rem]">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="font-bold text-sm text-white/80 uppercase tracking-widest">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:neon-text transition-all" />
          </Card>
        ))}

        <button 
          onClick={() => signOut(auth)}
          className="w-full mt-8 glass-dark border-destructive/20 p-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-destructive hover:bg-destructive/10 transition-all font-black uppercase tracking-widest text-sm"
        >
          <LogOut className="w-5 h-5" />
          Terminate session
        </button>
      </div>
    </div>
  );
}
