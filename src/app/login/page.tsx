
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Mail, Lock, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
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
  const { user } = useUser();
  const { t, dictionary } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      if (newUser) {
        try {
          // Check if this is the first user ever to grant admin roles
          // This check is performed in Firestore
          const usersQuery = query(collection(db, 'users'), limit(1));
          const snapshot = await getDocs(usersQuery);
          const isFirstUser = snapshot.empty;

          const userData = {
            id: newUser.uid,
            email: newUser.email,
            telegramUsername: telegramUsername ? (telegramUsername.startsWith('@') ? telegramUsername : `@${telegramUsername}`) : 'Not Provided',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Store user profile if it's a new signup or first user
          if (!isLogin || isFirstUser) {
            await setDoc(doc(db, 'users', newUser.uid), userData, { merge: true });
          }

          // If first user, grant admin roles immediately in Firestore
          if (isFirstUser) {
            await setDoc(doc(db, 'roles_order_managers', newUser.uid), { userId: newUser.uid });
            toast({
              title: "Admin Privileges Granted",
              description: "You have been identified as the primary administrator.",
            });
          }
        } catch (e) {
          console.error("Error managing user roles:", e);
        }
      }
    });
    return () => unsubscribe();
  }, [auth, db, telegramUsername, isLogin, toast]);

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

  return (
    <div className="flex-grow flex items-center justify-center px-6 min-h-[calc(100vh-160px)] relative overflow-hidden bg-background">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]" />
      
      <Card className="w-full max-w-md glass-dark border-2 border-white/10 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10 shadow-2xl">
        <CardHeader className="text-center p-0 space-y-2">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">
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
                <Label htmlFor="email">{t(dictionary.email)}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder={t(dictionary.emailPlaceholder)}
                    className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="telegram">{t(dictionary.telegramUsername)}</Label>
                  <div className="relative">
                    <Send className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="telegram"
                      type="text" 
                      placeholder={t(dictionary.telegramPlaceholder)}
                      className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">{t(dictionary.password)}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder={t(dictionary.passwordPlaceholder)}
                    className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:ring-primary focus:border-primary transition-all"
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
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {isLogin ? t(dictionary.dontHaveAccount) : t(dictionary.alreadyHaveAccount)}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
