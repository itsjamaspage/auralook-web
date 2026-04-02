
"use client"

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  LayoutGrid,
  Trash2,
  Edit3,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useLanguage } from '@/hooks/use-language';

export default function AdminDashboard() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [lookToDelete, setLookToDelete] = useState<string | null>(null);

  // Global Admin Access List - Hardcoded for instant identification
  const adminEmails = ['jkhakimjonov8@gmail.com'];
  const adminUids = [
    'THfzlOXNHLUYmwjVLArDlUhoRo63', 
    '0JVf0DDPZtXyw6diJZsnfk3EasD2',
    '89LWX6lCN9PMul1XcbQipnkAvwk2'
  ];

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return adminEmails.includes(user.email || '') || adminUids.includes(user.uid);
  }, [user]);

  // Load looks for inventory
  const looksQuery = useMemoFirebase(() => {
    return query(collection(db, 'looks'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  // Load all orders for dashboard - No filter required due to permissive rules
  const ordersQuery = useMemoFirebase(() => {
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  const confirmDelete = () => {
    if (!lookToDelete) return;
    const lookRef = doc(db, 'looks', lookToDelete);
    deleteDocumentNonBlocking(lookRef);
    toast({ title: t(dictionary.delete) + "..." });
    setLookToDelete(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
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

  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val).replace(/,/g, ' ');
  };

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Validating Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-black text-white uppercase italic">Access Denied</h2>
        <p className="text-white/40">Sizda administrator ruxsati yo'q.</p>
        <Link href="/profile">
          <Button variant="outline" className="mt-4 rounded-xl border-white/10">Profilga qaytish</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-10 max-w-6xl pb-32">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 neon-bg rounded-full shadow-[0_0_15px_var(--sync-color)]" />
          <h1 className="text-xl font-black tracking-tighter neon-text uppercase italic">
            {t(dictionary.adminDashboard)}
          </h1>
        </div>
        
        <Button asChild className="neon-bg text-black font-black px-6 rounded-xl h-10 transition-transform hover:scale-105 active:scale-95 border-none text-xs cursor-pointer">
          <Link href="/admin/looks/new">
            <Plus className="w-4 h-4 mr-2" />
            {t(dictionary.publish)}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12 flex w-fit">
          <TabsTrigger value="inventory" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.inventory)}
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-all">
            {t(dictionary.orders)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 neon-text" />
            <h2 className="text-lg font-bold tracking-tight text-white uppercase italic">{t(dictionary.inventory)}</h2>
          </div>
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
                          <Button variant="ghost" size="icon" onClick={() => setLookToDelete(look.id)} className="hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 neon-text" />
            <h2 className="text-lg font-bold text-white uppercase italic">{t(dictionary.orders)}</h2>
          </div>
          <Card className="glass-dark rounded-[2rem] overflow-hidden border-white/10 bg-white/[0.01]">
            {ordersLoading ? <div className="p-32 flex justify-center"><Loader2 className="animate-spin" /></div> : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-none">
                    <TableHead className="pl-8 text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.customer)}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-white/40">Body Stats</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.outfit)}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.amount)}</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.status)}</TableHead>
                    <TableHead className="text-right pr-8 text-[10px] uppercase tracking-widest text-white/40">{t(dictionary.action)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                      <TableCell className="pl-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-white/90">{order.customerName}</span>
                          <span className="text-[10px] text-white/40 font-mono tracking-tighter">{order.phoneNumber}</span>
                          {order.telegramUsername && <span className="text-[9px] neon-text italic">{order.telegramUsername}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] font-mono text-white/60">
                          {order.measurements?.height || '?'}/{order.measurements?.weight || '?'}/{order.size || '?'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white/80">{order.lookName || 'Outfit'}</span>
                          {order.lookId && <Link href={`/looks/${order.lookId}`} className="text-primary hover:neon-text"><ExternalLink className="w-3 h-3" /></Link>}
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-primary italic">
                        {order.currency === 'UZS' ? `${formatCurrencyValue(order.totalAmount)} UZS` : `$${formatCurrencyValue(order.totalAmount)}`}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'New' ? 'text-amber-500 animate-pulse' : 'text-primary'}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {order.status === 'New' ? (
                          <Button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'Confirmed')} 
                            className="h-8 text-[10px] neon-bg text-black font-black uppercase px-4 rounded-lg"
                          >
                            {t(dictionary.accept)}
                          </Button>
                        ) : (
                          <select 
                            className="bg-white/5 border border-white/10 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:neon-border text-white/60"
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          >
                            <option value="Confirmed">{t(dictionary.orderAccepted)}</option>
                            <option value="Shipped">{t(dictionary.orderShipped)}</option>
                            <option value="Delivered">{t(dictionary.orderDelivered)}</option>
                          </select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!lookToDelete} onOpenChange={(open) => !open && setLookToDelete(null)}>
        <AlertDialogContent className="glass-dark border-white/10 rounded-[2.5rem] text-foreground shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black neon-text uppercase italic">{t(dictionary.confirmDeleteTitle)}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 font-medium">{t(dictionary.confirmDeleteDesc)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">{t(dictionary.cancel)}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80 rounded-xl text-white font-bold">{t(dictionary.delete)}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
