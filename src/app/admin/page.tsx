
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Plus, 
  Loader2,
  Trash2,
  Edit3,
  ChevronDown,
  Clock,
  CheckCircle2,
  Package,
  Send,
  Phone,
  Ruler,
  ShieldAlert,
  Link as LinkIcon,
  RefreshCw,
  Settings2,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { useTelegramUser } from '@/hooks/use-telegram-user';
import { getProductDeepLink } from '@/lib/telegram-link';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isLoading: userLoading } = useTelegramUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'look' | 'order' } | null>(null);
  const [isSyncingBot, setIsSyncingBot] = useState(false);

  // UNIFIED ADMIN ACCESS PROTOCOL
  const isAdmin = user?.role === 'owner' || 
                  user?.role === 'editor' || 
                  user?.firebaseUid === 'demo_admin_session' ||
                  user?.username?.toLowerCase() === 'itsjamaspage';

  // SECURE QUERY GATING
  const looksQuery = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);
  
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const ordersQuery = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);
  
  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const collectionName = itemToDelete.type === 'look' ? 'looks' : 'orders';
      await deleteDoc(doc(db, collectionName, itemToDelete.id));
      toast({ title: t(dictionary.operationSuccess) });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed" });
    } finally {
      setItemToDelete(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast({ title: t(dictionary.operationSuccess) });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const handleSyncBot = async () => {
    setIsSyncingBot(true);
    try {
      const res = await fetch('/api/admin/bot-setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ 
          title: t(dictionary.protocolLive), 
          description: "Telegram webhook and menu buttons have been synchronized." 
        });
      } else {
        throw new Error(data.message);
      }
    } catch (e) {
      toast({ 
        variant: "destructive", 
        title: "Sync Failed", 
        description: String(e) 
      });
    } finally {
      setIsSyncingBot(false);
    }
  };

  const handleCopyProductLink = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const link = getProductDeepLink(productId);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Direct link to this look is in your clipboard."
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'New': return t(dictionary.orderPending);
      case 'Confirmed': return t(dictionary.orderAccepted);
      case 'Shipped': return t(dictionary.orderShipped);
      case 'Delivered': return t(dictionary.orderYetkazildi);
      case 'Cancelled': return t(dictionary.orderCancelled);
      default: return status || 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Confirmed': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      default: return <Package className="w-4 h-4 text-foreground/40" />;
    }
  };

  const formatCurrencyValue = (val: any) => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return new Intl.NumberFormat('uz-UZ').format(num).replace(/,/g, ' ');
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-foreground font-mono text-[10px] uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-6 py-32 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-destructive mx-auto opacity-20" />
        <h1 className="text-xl font-black text-foreground uppercase italic">{t(dictionary.identificationRequired)}</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">Dynamic RBAC Authorization Failed.</p>
        <Button asChild variant="outline" className="rounded-xl border-foreground/10 text-foreground">
          <Link href="/">Back to Surface</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-8 max-w-6xl pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-foreground/10 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 neon-bg rounded-full shadow-[0_0_15px_var(--sync-color)]" />
            <h1 className="text-xl font-black tracking-tighter neon-text uppercase italic">
              {t(dictionary.adminDashboard)}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSyncBot}
            disabled={isSyncingBot}
            variant="outline"
            className="rounded-xl h-12 sm:h-10 border-foreground/10 text-foreground hover:neon-border transition-all"
          >
            {isSyncingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {t(dictionary.syncBotLabel)}
          </Button>
          <Button asChild className="neon-bg text-black font-black px-6 rounded-xl h-12 sm:h-10 transition-transform hover:scale-105 active:scale-95 border-none text-xs cursor-pointer">
            <Link href="/admin/looks/new">
              <Plus className="w-4 h-4 mr-2" />
              {t(dictionary.publish)}
            </Link>
          </Button>
        </div>
      </div>

      {/* QUICK SYSTEM STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-surface border-foreground/5 p-5 rounded-3xl flex items-center gap-4 bg-black/40">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 neon-text" />
          </div>
          <div>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.botStatus)}</p>
            <p className="text-sm font-black text-foreground uppercase italic">{t(dictionary.operational)}</p>
          </div>
        </Card>
        <Card className="glass-surface border-foreground/5 p-5 rounded-3xl flex items-center gap-4 bg-black/40">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 neon-text" />
          </div>
          <div>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.activeInventory)}</p>
            <p className="text-sm font-black text-foreground uppercase italic">{looks?.length || 0} {t(dictionary.units)}</p>
          </div>
        </Card>
        <Card className="glass-surface border-foreground/5 p-5 rounded-3xl flex items-center gap-4 bg-black/40">
          <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Settings2 className="w-5 h-5 neon-text" />
          </div>
          <div>
            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.lastWebhookSync)}</p>
            <p className="text-sm font-black text-foreground uppercase italic">{t(dictionary.realTimeActive)}</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-foreground/5 border border-foreground/10 p-1 rounded-2xl h-12 flex w-full sm:w-fit">
          <TabsTrigger value="orders" className="rounded-xl px-6 flex-1 sm:flex-none sm:px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.orders)}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl px-6 flex-1 sm:flex-none sm:px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.inventory)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {looksLoading ? (
              <div className="col-span-full p-32 flex justify-center"><Loader2 className="animate-spin w-10 h-10 neon-text" /></div>
            ) : (
              looks?.map((look) => (
                <Card key={look.id} className="glass-surface border-foreground/5 p-4 rounded-[2.5rem] flex items-center gap-4 group hover:border-foreground/20 transition-all shadow-xl">
                  <div className="relative w-16 h-20 shrink-0 rounded-xl overflow-hidden border border-foreground/10 bg-muted/20">
                    <img src={look.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-grow space-y-1 min-w-0">
                    <h3 className="text-sm font-black text-foreground uppercase italic truncate">{look.name}</h3>
                    <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">{look.id.substring(0, 8)}</p>
                    <p className="neon-text font-black tracking-tighter text-sm">
                      {look.currency === 'UZS' ? `${formatCurrencyValue(look.price)} UZS` : `$${formatCurrencyValue(look.price)}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleCopyProductLink(e, look.id)}
                      className="h-9 w-9 rounded-xl bg-foreground/5 text-foreground hover:neon-text"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-foreground/5 text-foreground hover:neon-text">
                      <Link href={`/admin/looks/${look.id}/edit`}><Edit3 className="w-4 h-4" /></Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setItemToDelete({ id: look.id, type: 'look' })} 
                      className="h-9 w-9 rounded-xl bg-foreground/5 text-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          {(!looks || looks.length === 0) && !looksLoading && (
            <div className="py-32 text-center">
              <Package className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
              <p className="text-foreground uppercase font-black italic tracking-[0.2em]">{t(dictionary.nothingFound)}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {ordersLoading ? (
            <div className="p-32 flex justify-center"><Loader2 className="animate-spin w-10 h-10 neon-text" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {orders?.map((order) => (
                <Card key={order.id} className="glass-surface border-foreground/5 p-5 sm:p-6 rounded-[2.5rem] space-y-6 relative overflow-hidden group hover:border-foreground/20 transition-all shadow-xl">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1 flex-grow pr-4">
                      <p className="text-[9px] font-black text-foreground uppercase tracking-[0.2em]">{t(dictionary.orderRef)}: {order.id.substring(0, 8)}</p>
                      <h3 className="text-lg sm:text-xl font-black text-foreground italic tracking-tight leading-tight uppercase line-clamp-2">
                        {order.lookName || t(dictionary.outfit)}
                      </h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{t(dictionary.size)}: {order.size}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-full border border-foreground/10 whitespace-nowrap">
                        {getStatusIcon(order.status)}
                        <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setItemToDelete({ id: order.id, type: 'order' })} 
                        className="hover:text-destructive h-9 w-9 sm:h-10 sm:w-10 bg-foreground/5 rounded-xl border border-foreground/5 text-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 py-5 border-y border-foreground/5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                        <Send className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{t(dictionary.telegramUsername)}</span>
                        <a 
                          href={`https://t.me/${order.telegramUsername?.replace('@', '') || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-bold italic hover:underline"
                        >
                          {order.telegramUsername || t(dictionary.all)}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{t(dictionary.phoneNumber)}</span>
                        <p className="text-sm text-foreground font-mono">{order.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-2 relative z-10 gap-4">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-1">{t(dictionary.total)}</p>
                      <p className="text-xl sm:text-2xl font-black neon-text italic tracking-tighter leading-none">
                        {order.currency === 'UZS' ? `${formatCurrencyValue(order.totalAmount)} UZS` : `$${formatCurrencyValue(order.totalAmount)}`}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <select 
                        className="appearance-none bg-primary text-black text-[10px] font-black rounded-xl pl-4 pr-10 h-12 w-full sm:w-auto outline-none cursor-pointer uppercase tracking-widest shadow-[0_0_20px_rgba(var(--sync-color),0.3)]"
                        value={order.status || 'New'}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="New">{t(dictionary.orderPending)}</option>
                        <option value="Confirmed">{t(dictionary.orderAccepted)}</option>
                        <option value="Shipped">{t(dictionary.orderShipped)}</option>
                        <option value="Delivered">{t(dictionary.orderYetkazildi)}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3px]" />
                    </div>
                  </div>
                </Card>
              ))}

              {(!orders || orders.length === 0) && (
                <div className="col-span-full py-32 text-center">
                  <Package className="w-16 h-16 text-foreground/10 mx-auto mb-4" />
                  <p className="text-foreground uppercase font-black italic tracking-[0.2em]">{t(dictionary.nothingFound)}</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="glass-surface border-foreground/10 rounded-[2.5rem] text-foreground shadow-2xl mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black neon-text uppercase italic">{t(dictionary.confirmDeleteTitle)}</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground font-medium">{t(dictionary.confirmDeleteDesc)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4 flex-col sm:flex-row">
            <AlertDialogCancel className="bg-foreground/5 border-foreground/10 rounded-xl h-12 sm:h-10 hover:bg-foreground/10 text-foreground order-2 sm:order-1">{t(dictionary.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80 rounded-xl h-12 sm:h-10 text-white font-bold order-1 sm:order-2">{t(dictionary.delete)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
