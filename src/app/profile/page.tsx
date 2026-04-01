"use client"

import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Shield, Package, Settings, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  if (isUserLoading || (user && profileLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Synchronizing Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="text-white/40 uppercase font-black italic">Unauthorized Access. Please login.</p>
        <button 
          onClick={() => router.push('/login')}
          className="mt-8 neon-text font-black uppercase tracking-widest text-xs hover:underline"
        >
          Proceed to Authentication
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute -inset-4 neon-bg opacity-20 blur-2xl rounded-full" />
          <Avatar className="w-24 h-24 border-2 neon-border p-1 bg-black">
            <AvatarImage src={profile?.photoUrl} className="rounded-full object-cover" />
            <AvatarFallback className="bg-white/5">
              <User className="w-10 h-10 text-primary" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
            {profile?.firstName || user?.email?.split('@')[0] || 'Cyber Voyager'}
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">
            {profile?.telegramUsername || user.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { icon: Package, label: 'Order History', color: 'text-blue-400', href: '/orders' },
          { icon: Shield, label: 'Security Protocols', color: 'text-green-400', href: '#' },
          { icon: Settings, label: 'System Preferences', color: 'text-purple-400', href: '#' },
        ].map((item) => (
          <Card 
            key={item.label} 
            onClick={() => item.href !== '#' && router.push(item.href)}
            className="glass-dark border-white/5 p-5 flex items-center justify-between group hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer rounded-[1.5rem]"
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

        <button 
          onClick={() => signOut(auth).then(() => router.push('/'))}
          className="w-full mt-8 glass-dark border-destructive/20 p-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-destructive hover:bg-destructive/10 transition-all font-black uppercase tracking-widest text-sm"
        >
          <LogOut className="w-5 h-5" />
          Terminate session
        </button>
      </div>
    </div>
  );
}