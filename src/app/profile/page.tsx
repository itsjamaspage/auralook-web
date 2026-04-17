"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Package, ChevronRight, Save, Loader2, Send, ShieldCheck, PlusCircle, Users, Trash2, ShieldAlert, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, deleteDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion-reveal';

export default function ProfilePage() {
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const { user, isLoading, isVerified, error } = useTelegramUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newEditorInput, setNewEditorInput] = useState('');
  const [isAddingEditor, setIsAddingEditor] = useState(false);

  const rolesQuery = useMemoFirebase(() => {
    if (!isVerified || !user || user.role !== 'owner') return null;
    return collection(db, 'roles');
  }, [db, user, isVerified]);

  const { data: editors } = useCollection(rolesQuery);

  useEffect(() => { if (user?.phone) setPhone(user.phone); }, [user]);

  const handleUpdatePhone = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { phone, updatedAt: serverTimestamp() });
      toast({ title: t(dictionary.success) });
    } catch { toast({ variant: 'destructive', title: t(dictionary.errorTitle) }); }
    finally { setIsSaving(false); }
  };

  const handleAddEditor = async () => {
    if (!newEditorInput || !user) return;
    setIsAddingEditor(true);
    try {
      const input = newEditorInput.replace('@', '').toLowerCase().trim();
      let targetId = input, targetUsername = input;
      if (isNaN(Number(input))) {
        const snap = await getDocs(query(collection(db, 'users'), where('username', '==', input)));
        if (!snap.empty) { targetId = snap.docs[0].id; targetUsername = snap.docs[0].data().username; }
      }
      await setDoc(doc(db, 'roles', targetId), { role: 'editor', username: targetUsername, addedAt: serverTimestamp(), addedBy: user.id });
      toast({ title: t(dictionary.success), description: `@${targetUsername} is now an Editor.` });
      setNewEditorInput('');
    } catch { toast({ variant: 'destructive', title: t(dictionary.errorTitle) }); }
    finally { setIsAddingEditor(false); }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin neon-text" />
      </div>
    );
  }

  if (!isVerified || !user) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24 text-center space-y-6">
        <div className="relative mx-auto w-16 h-16">
          <ShieldAlert className="w-16 h-16 neon-text opacity-15" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogIn className="w-7 h-7 neon-text animate-pulse" />
          </div>
        </div>
        <h1 className="text-lg font-black text-foreground uppercase">{t(dictionary.identificationRequired)}</h1>
        <p className="text-xs text-foreground/50 leading-relaxed">{t(dictionary.openInBot)}</p>
        <Button asChild className="h-12 w-full rounded-2xl neon-bg text-white font-black uppercase text-xs tracking-widest border-none">
          <a href="https://t.me/jamastore_aibot"><Send className="w-4 h-4 mr-2" />Open Telegram</a>
        </Button>
        {error && <p className="text-[9px] font-mono text-destructive">Error: {error}</p>}
      </div>
    );
  }

  const isPrivileged = user.role === 'owner' || user.role === 'editor';

  const menuItems = [
    ...(isPrivileged ? [{ href: '/admin/looks/new', icon: PlusCircle, label: t(dictionary.addNewLook) }] : []),
    { href: '/orders', icon: Package, label: t(dictionary.orderHistory) },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">

        {/* Avatar + name */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <div className="relative">
            <div className="absolute -inset-3 neon-bg opacity-15 blur-2xl rounded-full" />
            <Avatar className="w-20 h-20 border-2 neon-border relative">
              <AvatarImage src={user.photoUrl || undefined} alt={user.firstName} />
              <AvatarFallback><User className="w-8 h-8 neon-text" /></AvatarFallback>
            </Avatar>
            {isPrivileged && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full neon-bg flex items-center justify-center border-2 border-background shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="text-center space-y-0.5">
            <h1 className="text-xl font-black text-foreground uppercase italic tracking-tight">{user.firstName}</h1>
            <p className="text-xs font-bold neon-text uppercase tracking-widest">@{user.username || 'user'}</p>
            <div className="mt-1.5 inline-block px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10">
              <p className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">
                {user.role === 'owner' ? t(dictionary.supremeAdmin) : user.role === 'editor' ? t(dictionary.shopEditor) : t(dictionary.activeNode)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Phone setting */}
        <FadeUp delay={0.05}>
          <div className="mb-3">
            <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-2 px-1">
              {t(dictionary.accountSettings)}
            </p>
            <div className="flex gap-2 bg-secondary/30 rounded-[1.5rem] p-3 border border-foreground/5">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="bg-background border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base flex-grow"
              />
              <Button
                onClick={handleUpdatePhone}
                disabled={isSaving}
                className="h-11 w-11 rounded-xl neon-bg shrink-0 shadow-lg"
              >
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </FadeUp>

        {/* Menu items */}
        <FadeUp delay={0.1}>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between bg-secondary/30 rounded-[1.5rem] p-4 border border-foreground/5 hover:bg-secondary/50 hover:border-foreground/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 neon-text" />
                  </div>
                  <span className="text-sm font-bold text-foreground uppercase tracking-wide">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:neon-text transition-colors" />
              </Link>
            ))}

            {user.role === 'owner' && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="group flex items-center justify-between w-full bg-secondary/30 rounded-[1.5rem] p-4 border border-foreground/5 hover:bg-secondary/50 hover:border-foreground/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <Users className="w-4 h-4 neon-text" />
                  </div>
                  <span className="text-sm font-bold text-foreground uppercase tracking-wide">{t(dictionary.manageTeam)}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-foreground/20 group-hover:neon-text transition-colors" />
              </button>
            )}
          </div>
        </FadeUp>

        {/* Team management dialog */}
        <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
          <DialogContent className="bg-background border border-foreground/10 rounded-[2rem] text-foreground p-6 max-w-[92vw] sm:max-w-md mx-auto shadow-2xl">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-lg font-black italic uppercase neon-text flex items-center gap-2">
                <Users className="w-5 h-5" /> {t(dictionary.teamProtocol)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{t(dictionary.promoteToEditor)}</Label>
                <div className="flex gap-2">
                  <Input placeholder="@username or ID" value={newEditorInput} onChange={(e) => setNewEditorInput(e.target.value)} className="bg-secondary/50 border-foreground/10 h-11 rounded-xl focus:neon-border text-foreground text-base" />
                  <Button onClick={handleAddEditor} disabled={isAddingEditor || !newEditorInput} className="neon-bg text-white font-black px-5 rounded-xl h-11">
                    {isAddingEditor ? <Loader2 className="animate-spin w-4 h-4" /> : t(dictionary.grant)}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{t(dictionary.activeEditors)}</Label>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {editors?.map((editor) => (
                    <div key={editor.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-foreground/5">
                      <div>
                        <p className="text-sm font-black text-foreground">@{editor.username || editor.id}</p>
                        <p className="text-[9px] font-bold neon-text uppercase">{editor.role}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={async () => { await deleteDoc(doc(db, 'roles', editor.id)); toast({ title: t(dictionary.revoked) }); }} className="text-destructive hover:bg-destructive/10 rounded-xl w-9 h-9">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
