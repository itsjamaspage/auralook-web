"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Send, Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10" />
      
      <Card className="w-full max-w-md glass-dark border-white/5 rounded-[2.5rem] p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center p-0 space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-light">
            {isLogin ? 'Access your orders and sizes' : 'Join the future of fashion'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="John Doe" className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="name@example.com" className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl" />
              </div>
            </div>
            {!isLogin && (
              <div className="space-y-2">
                <Label>Telegram Username</Label>
                <div className="relative">
                  <Send className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="@username" className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl" />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
            onClick={() => router.push('/')}
          >
            {isLogin ? 'Login' : 'Get Started'}
          </Button>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}