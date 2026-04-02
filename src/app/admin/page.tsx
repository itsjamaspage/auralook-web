"use client"

import { useState, useEffect } from 'react';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'look' | 'order' } | null>(null);
  
  // Diagnostic state for Telegram Protocol
  const [isBotArmed, setIsBotArmed] = useState(false);

  useEffect(() => {
    // Only check for the primary Telegram URL indicator to confirm "Live" status
    setIsBotArmed(!!process.env.NEXT_PUBLIC_BASE_URL);
  }, []);

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const ordersQuery = useMemoFirebase(() => {
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const collectionName = itemToDelete.type === 'look' ? 'looks' : 'orders';
      await deleteDoc(doc(db, collectionName, itemToDelete.id));
      toast({ title: t(dictionary.delete) + " ok." });
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
      toast({ title: t(dictionary.lookSavedSuccess) });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed" });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'New': return t(dictionary.orderPending);
      case 'Confirmed': return t(dictionary.orderAccepted);
      case 'Shipped': return t(dictionary.orderShipped);
      case 'Delivered': return t(dictionary.orderDelivered);
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Confirmed': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      default: return <Package className="w-4 h-4 text-white/40" />;
    }
  };

  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val).replace(/,/g, ' ');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-8 max-w-6xl pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 neon-bg rounded-full shadow-[0_0_15px_var(--sync-color)]" />
            <h1 className="text-xl font-black tracking-tighter neon-text uppercase italic">
              {t(dictionary.adminDashboard)}
            </h1>
          </div>
          <div className="flex items-center gap-2 pl-4">
            {isBotArmed ? (
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">Protocol Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <span className="text-[8px] font-bold text-amber-500/60 uppercase tracking-widest">Configuration Pending</span>
              </div>
            )}
          </div>
        </div>
        
        <Button asChild className="neon-bg text-black font-black px-6 rounded-xl h-12 sm:h-10 transition-transform hover:scale-105 active:scale-95 border-none text-xs cursor-pointer w-full sm:w-auto">
          <Link href="/admin/looks/new">
            <Plus className="w-4 h-4 mr-2" />
            {t(dictionary.publish)}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12 flex w-full sm:w-fit overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="orders" className="rounded-xl px-6 flex-1 sm:flex-none sm:px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.orders)}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl px-6 flex-1 sm:flex-none sm:px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.inventory)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="hidden md:block">
            <Card className="glass-dark rounded-[2rem] overflow-hidden shadow-2xl border-white/10 bg-white/[0.01]">
              {looksLoading ? (
                <div className="p-32 flex flex-col items-center gap-6"><Loader2 className="animate-spin w-10 h-10 neon-text" /></div>
              ) : (
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-none">
                      <TableHead className="pl-8 text-[10px] uppercase tracking-widest text-white/40">Visual</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.itemName)}</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.amount)}</TableHead>
                      <TableHead className="text-right pr-8 text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.action)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {looks?.map((look) => (
                      <TableRow key={look.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                        <TableCell className="pl-8 py-4">
                          <img src={look.imageUrl} className="w-12 h-16 object-cover rounded-lg border border-white/10" alt="" />
                        </TableCell>
                        <TableCell className="font-bold text-white/90">{look.name}</TableCell>
                        <TableCell className="neon-text font-black tracking-tighter">
                          {look.currency === 'UZS' ? `${formatCurrencyValue(look.price)} UZS` : `$${formatCurrencyValue(look.price)}`}
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/looks/${look.id}/edit`}><Button variant="ghost" size="icon" className="hover:neon-text"><Edit3 className="w-4 h-4" /></Button></Link>
                            <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ id: look.id, type: 'look' })} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-4">
            {looks?.map((look) => (
              <Card key={look.id} className="glass-dark border-white/5 p-4 rounded-[2rem] flex items-center gap-4">
                <img src={look.imageUrl} className="w-20 h-24 object-cover rounded-xl border border-white/10" alt="" />
                <div className="flex-grow space-y-1">
                  <h3 className="text-sm font-black text-white italic truncate">{look.name}</h3>
                  <p className="neon-text font-black tracking-tighter text-sm">
                    {look.currency === 'UZS' ? `${formatCurrencyValue(look.price)} UZS` : `$${formatCurrencyValue(look.price)}`}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/looks/${look.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 rounded-lg border-white/10 text-[10px] font-black uppercase">
                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => setItemToDelete({ id: look.id, type: 'look' })} 
                      className="h-9 w-9 rounded-lg bg-white/5 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {ordersLoading ? (
            <div className="p-32 flex justify-center"><Loader2 className="animate-spin w-10 h-10 neon-text" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {orders?.map((order) => (
                <Card key={order.id} className="glass-dark border-white/5 p-5 sm:p-6 rounded-[2.5rem] space-y-6 relative overflow-hidden group hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-1 flex-grow pr-4">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Ref: {order.id.substring(0, 8)}</p>
                      <h3 className="text-lg sm:text-xl font-black text-white italic tracking-tight leading-tight uppercase line-clamp-2">
                        {order.lookName || 'Look Purchase'}
                      </h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Size: {order.size}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap">
                        {getStatusIcon(order.status)}
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setItemToDelete({ id: order.id, type: 'order' })} 
                        className="hover:text-destructive h-9 w-9 sm:h-10 sm:w-10 bg-white/5 rounded-xl border border-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 py-5 border-y border-white/5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Send className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Telegram</span>
                        <a 
                          href={`https://t.me/${order.telegramUsername?.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-bold italic hover:underline"
                        >
                          {order.telegramUsername || 'Noma\'lum'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Phone</span>
                        <p className="text-sm text-white/60 font-mono">{order.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Ruler className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Body Stats</span>
                        <p className="text-sm text-white/60 font-mono">{order.measurements?.height}cm / {order.measurements?.weight}kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-2 relative z-10 gap-4">
                    <div className="text-left">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl sm:text-2xl font-black neon-text italic tracking-tighter leading-none">
                        {order.currency === 'UZS' ? `${formatCurrencyValue(order.totalAmount)} UZS` : `$${formatCurrencyValue(order.totalAmount)}`}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <select 
                        className="appearance-none bg-primary text-black text-[10px] font-black rounded-xl pl-4 pr-10 h-12 w-full sm:w-auto outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer uppercase tracking-widest shadow-[0_0_20px_rgba(var(--sync-color),0.3)]"
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="New">{t(dictionary.orderPending)}</option>
                        <option value="Confirmed">{t(dictionary.orderAccepted)}</option>
                        <option value="Shipped">{t(dictionary.orderShipped)}</option>
                        <option value="Delivered">{t(dictionary.orderDelivered)}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none stroke-[3px]" />
                    </div>
                  </div>
                </Card>
              ))}

              {(!orders || orders.length === 0) && (
                <div className="col-span-full py-32 text-center">
                  <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40 uppercase font-black italic tracking-[0.2em]">No Orders in Repository</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent className="glass-dark border-white/10 rounded-[2rem] sm:rounded-[2.5rem] text-foreground shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl sm:text-2xl font-black neon-text uppercase italic">{t(dictionary.confirmDeleteTitle)}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 font-medium">{t(dictionary.confirmDeleteDesc)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-4 flex-col sm:flex-row">
            <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl h-12 sm:h-10 hover:bg-white/10 text-white/60 hover:text-white transition-colors order-2 sm:order-1">{t(dictionary.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80 rounded-xl h-12 sm:h-10 text-white font-bold order-1 sm:order-2">{t(dictionary.delete)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
