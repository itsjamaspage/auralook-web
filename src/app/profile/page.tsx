
"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Package, 
  ChevronRight, 
  Save, 
  Loader2, 
  Send, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  Trash2,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, deleteDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleUpdatePhone = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { phone, updatedAt: serverTimestamp() });
      toast({ title: t(dictionary.success) });
    } catch (e) { toast({ variant: "destructive", title: t(dictionary.errorTitle) }); }
    finally { setIsSaving(false); }
  };

  const handleAddEditor = async () => {
    if (!newEditorInput || !user) return;
    setIsAddingEditor(true);
    try {
      const input = newEditorInput.replace('@', '').toLowerCase().trim();
      
      // If input is numeric, we can use it directly as stable ID
      // Otherwise, we lookup the user by username to get their numeric ID
      let targetId = input;
      let targetUsername = input;

      if (isNaN(Number(input))) {
        const userQuery = query(collection(db, 'users'), where('username', '==', input));
        const snap = await getDocs(userQuery);
        if (!snap.empty) {
          targetId = snap.docs[0].id;
          targetUsername = snap.docs[0].data().username;
        } else {
          // Fallback: If user hasn't opened app yet, we store by username temporarily
          // The Identity Bridge will reconcile this when they first login
          console.warn("[Team Protocol] Target user not found in database. Storing by username.");
        }
      }
      
      await setDoc(doc(db, 'roles', targetId), { 
        role: 'editor', 
        username: targetUsername, 
        addedAt: serverTimestamp(), 
        addedBy: user.id 
      });
      
      toast({ title: t(dictionary.success), description: `@${targetUsername} is now an Editor.` });
      setNewEditorInput('');
    } catch (e) { 
      console.error(e);
      toast({ variant: "destructive", title: t(dictionary.errorTitle) }); 
    } finally { 
      setIsAddingEditor(false); 
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

  if (!isVerified || !user) {
    return (
      <div className="container mx-auto px-6 py-20 text-center space-y-8 max-w-sm">
        <div className="relative mx-auto w-20 h-20">
          <ShieldAlert className="w-20 h-20 neon-text opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LogIn className="w-8 h-8 neon-text animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">
            {t(dictionary.identificationRequired)}
          </h1>
          <p className="text-foreground/60 text-xs font-medium leading-relaxed uppercase tracking-widest">
            {t(dictionary.openInBot)}
          </p>
        </div>
        <Button asChild className="h-16 w-full rounded-2xl neon-bg text-black font-black uppercase tracking-widest border-none">
          <a href="https://t.me/jamastore_aibot">
            <Send className="w-5 h-5 mr-3" />
            GO TO TELEGRAM
          </a>
        </Button>
        {error && <p className="text-[9px] font-mono text-destructive uppercase">Error: {error}</p>}
      </div>
    );
  }

  const isPrivileged = user.role === 'owner' || user.role === 'editor';

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute -inset-4 neon-bg opacity-20 blur-2xl rounded-full" />
          <Avatar className="w-24 h-24 border-2 neon-border p-1 bg-background">
            <AvatarImage src={user.photoUrl || undefined} alt={user.firstName} />
            <AvatarFallback><User className="w-10 h-10 neon-text" /></AvatarFallback>
          </Avatar>
          {isPrivileged && <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full neon-bg flex items-center justify-center border-2 border-background shadow-xl"><ShieldCheck className="w-4 h-4 text-black" /></div>}
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">{user.firstName}</h1>
          <p className="text-[10px] font-bold neon-text uppercase tracking-widest font-mono">@{user.username || 'user'}</p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest">
              {user.role === 'owner' ? t(dictionary.supremeAdmin) : user.role === 'editor' ? t(dictionary.shopEditor) : t(dictionary.activeNode)}
            </p>
          </div>
        </div>
      </div>

      {isPrivileged && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4">—— {t(dictionary.adminActions)}</p>
          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="h-16 rounded-[2rem] glass-surface border-foreground/10 hover:neon-border text-foreground font-black uppercase text-xs tracking-widest justify-between px-8">
              <Link href="/admin/looks/new"><div className="flex items-center gap-4"><PlusCircle className="w-5 h-5 neon-text" /> {t(dictionary.addNewLook)}</div><ChevronRight className="w-4 h-4 opacity-20" /></Link>
            </Button>
            {user.role === 'owner' && (
              <Button onClick={() => setShowAdminPanel(true)} className="h-16 rounded-[2rem] glass-surface border-foreground/10 hover:neon-border text-foreground font-black uppercase text-xs tracking-widest justify-between px-8">
                <div className="flex items-center gap-4"><Users className="w-5 h-5 neon-text" /> {t(dictionary.manageTeam)}</div><ChevronRight className="w-4 h-4 opacity-20" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4">—— {t(dictionary.accountSettings)}</p>
        <Card className="glass-surface border-foreground/10 p-6 rounded-[2.5rem] flex gap-3 shadow-2xl">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground" />
          <Button onClick={handleUpdatePhone} disabled={isSaving} className="h-14 w-14 rounded-2xl neon-bg shadow-xl">{isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}</Button>
        </Card>
        <Card onClick={() => router.push('/orders')} className="glass-surface border-foreground/10 p-5 flex items-center justify-between group hover:border-primary/20 rounded-[2rem] cursor-pointer shadow-lg bg-black/20">
          <div className="flex items-center gap-4"><div className="p-3 bg-foreground/5 rounded-xl"><Package className="w-5 h-5 neon-text" /></div><span className="font-bold text-sm text-foreground uppercase tracking-widest">{t(dictionary.orderHistory)}</span></div>
          <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
        </Card>
      </div>

      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="glass-surface border-foreground/10 rounded-[2.5rem] text-foreground p-8 max-w-md shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase neon-text flex items-center gap-3">
              <Users className="w-6 h-6" /> {t(dictionary.teamProtocol)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.promoteToEditor)}</Label>
              <div className="flex gap-2">
                <Input placeholder="@username or ID" value={newEditorInput} onChange={(e) => setNewEditorInput(e.target.value)} className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground" />
                <Button onClick={handleAddEditor} disabled={isAddingEditor || !newEditorInput} className="neon-bg text-black font-black px-6 rounded-xl h-12">{isAddingEditor ? <Loader2 className="animate-spin" /> : t(dictionary.grant)}</Button>
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t(dictionary.activeEditors)}</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {editors?.map((editor) => (
                  <div key={editor.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
                    <div className="flex flex-col"><span className="text-sm font-black text-foreground italic">@{editor.username || editor.id}</span><span className="text-[9px] font-bold text-primary uppercase">{editor.role}</span></div>
                    <Button variant="ghost" size="icon" onClick={async () => { await deleteDoc(doc(db, 'roles', editor.id)); toast({ title: t(dictionary.revoked) }); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
