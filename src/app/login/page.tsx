"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Mail, Lock, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDoc, doc, collection, getDocs, limit, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  useEffect(() => {
    // If the user is already authenticated (either via email or Telegram auto-login),
    // redirect them to the home page immediately.
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isLogin) {
      initiateEmailSignIn(auth, email, password);
    } else {
      initiateEmailSignUp(auth, email, password);
    }
    
    setTimeout(() => setIsLoading(false), 2000); 
  };

  const isTelegramEnv = typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  if (isUserLoading || (user && isTelegramEnv)) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin neon-text" />
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Identifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-6 min-h-[calc(100vh-160px)] relative overflow-hidden bg-background">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" />
      
      <Card className="w-full max-w-md glass-dark border-2 border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 shadow-2xl">
        <CardHeader className="text-center p-0 space-y-2">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <ShieldCheck className="w-8 h-8 text-primary neon-text" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter neon-text">
            {isLogin ? t(dictionary.welcomeBack) : t(dictionary.createAccount)}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-light">
            {isLogin ? t(dictionary.accessOrders) : t(dictionary.joinFuture)}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">{t(dictionary.email)}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="email"
                    type="email" 
                    placeholder={t(dictionary.emailPlaceholder)}
                    className="w-full pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all outline-none text-sm px-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">{t(dictionary.telegramUsername)}</Label>
                  <div className="relative">
                    <Send className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input 
                      id="telegram"
                      type="text" 
                      placeholder={t(dictionary.telegramPlaceholder)}
                      className="w-full pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all outline-none text-sm px-4"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">{t(dictionary.password)}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input 
                    id="password"
                    type="password" 
                    placeholder={t(dictionary.passwordPlaceholder)}
                    className="w-full pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all outline-none text-sm px-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-12 rounded-xl text-black font-black text-lg neon-bg border-none transition-all shadow-2xl"
              disabled={isLoading}
            >
              {isLoading ? t(dictionary.processing) : (isLogin ? t(dictionary.login) : t(dictionary.getStarted))}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline font-bold"
            >
              {isLogin ? t(dictionary.dontHaveAccount) : t(dictionary.alreadyHaveAccount)}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
