
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
  Phone, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { t, dictionary } = useLanguage();
  const { user, isLoading } = useTelegramUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newEditorUsername, setNewEditorUsername] = useState('');
  const [isAddingEditor, setIsAddingEditor] = useState(false);

  const rolesQuery = useMemoFirebase(() => {
    if (user?.role !== 'owner') return null;
    return collection(db, 'roles');
  }, [db, user?.role]);

  const { data: editors } = useCollection(rolesQuery);

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
      toast({ title: t(dictionary.success), description: t(dictionary.detailsUpdated) });
    } catch (e) {
      toast({ variant: "destructive", title: t(dictionary.errorTitle) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEditor = async () => {
    if (!newEditorUsername || !user) return;
    setIsAddingEditor(true);
    try {
      // Step 1: User provides @username
      // Step 2: In a real bot scenario, we'd resolve ID via API. 
      // For this MVP, we'll store the username and allow them to register.
      // But per instructions, I will simulate the ID lookup if they use the bot.
      
      // MOCK LOGIC: In a real app, this calls an API route.
      // We will assume the user has already opened the bot.
      // For now, I'll store it by username as a placeholder ID or use an API route if I had it.
      
      toast({ title: "Resolution Pending", description: "Username resolution requires bot interaction." });
    } finally {
      setIsAddingEditor(false);
    }
  };

  const handleRemoveEditor = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'roles', uid));
      toast({ title: "Editor Removed" });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
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

  const isPrivileged = user.role === 'owner' || user.role === 'editor';

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
          {isPrivileged && (
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full neon-bg flex items-center justify-center border-2 border-background">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
          )}
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
            <p className="text-[9px] font-black text-foreground/70 uppercase tracking-widest">
              {user.role === 'owner' ? 'Supreme Admin' : user.role === 'editor' ? 'Shop Editor' : t(dictionary.activeNode)}
            </p>
          </div>
        </div>
      </div>

      {/* ADMIN & EDITOR ACTIONS */}
      {isPrivileged && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4">—— Do'kon boshqaruvi</p>
          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="h-16 rounded-[2rem] glass-surface border-foreground/10 hover:neon-border text-foreground font-black uppercase text-xs tracking-widest justify-between px-8">
              <Link href="/admin/looks/new">
                <div className="flex items-center gap-4">
                  <PlusCircle className="w-5 h-5 neon-text" />
                  Yangi kiyim qo'shish
                </div>
                <ChevronRight className="w-4 h-4 opacity-20" />
              </Link>
            </Button>
            
            {user.role === 'owner' && (
              <Button 
                onClick={() => setShowAdminPanel(true)}
                className="h-16 rounded-[2rem] glass-surface border-foreground/10 hover:neon-border text-foreground font-black uppercase text-xs tracking-widest justify-between px-8"
              >
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 neon-text" />
                  Adminlarni boshqarish
                </div>
                <ChevronRight className="w-4 h-4 opacity-20" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4">—— {t(dictionary.contactInformation)}</p>
        <Card className="glass-surface border-foreground/10 p-6 rounded-[2.5rem] flex gap-3 shadow-2xl relative overflow-hidden group">
          <Input 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
            className="bg-foreground/5 border-foreground/10 h-14 rounded-2xl focus:neon-border text-foreground text-base transition-all"
          />
          <Button 
            onClick={handleUpdatePhone}
            disabled={isSaving}
            className="h-14 w-14 rounded-2xl neon-bg border-none shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4">—— {t(dictionary.myOrders)}</p>
        <Card 
          onClick={() => router.push('/orders')}
          className="glass-surface border-foreground/10 p-5 flex items-center justify-between group hover:border-primary/20 active:scale-[0.98] transition-all cursor-pointer rounded-[2rem]"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-foreground/5 rounded-xl group-hover:neon-border transition-colors">
              <Package className="w-5 h-5 neon-text" />
            </div>
            <span className="font-bold text-sm text-foreground uppercase tracking-widest">{t(dictionary.orderHistory)}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:neon-text transition-all" />
        </Card>
      </div>

      {/* MANAGE ADMINS DIALOG */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="glass-surface border-foreground/10 rounded-[2.5rem] text-foreground p-8 max-w-[90vw] sm:max-w-md mx-auto shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black italic uppercase neon-text flex items-center gap-3">
              <Users className="w-6 h-6" />
              Admin Paneli
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Yangi Editor Qo'shish</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="@username" 
                  value={newEditorUsername}
                  onChange={(e) => setNewEditorUsername(e.target.value)}
                  className="bg-foreground/5 border-foreground/10 h-12 rounded-xl focus:neon-border text-foreground"
                />
                <Button 
                  onClick={handleAddEditor}
                  disabled={isAddingEditor || !newEditorUsername}
                  className="neon-bg text-black font-black px-6 rounded-xl h-12"
                >
                  {isAddingEditor ? <Loader2 className="animate-spin" /> : 'Qo\'shish'}
                </Button>
              </div>
              <p className="text-[10px] text-foreground/40 italic">
                * Foydalanuvchi avval botimizni ishga tushirgan bo'lishi kerak.
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Faol Editorlar</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {editors?.length === 0 ? (
                  <p className="text-center py-8 text-xs text-foreground/20 uppercase font-black">Editorlar topilmadi</p>
                ) : (
                  editors?.map((editor) => (
                    <div key={editor.id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground italic">@{editor.username || 'Noma\'lum'}</span>
                        <span className="text-[9px] font-bold text-primary uppercase">{editor.role}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveEditor(editor.id)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
