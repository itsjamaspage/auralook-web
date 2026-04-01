"use client"

import { useState } from 'react';
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
  Ruler
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useLanguage } from '@/hooks/use-language';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [lookToDelete, setLookToDelete] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => query(collection(db, 'looks'), orderBy('createdAt', 'desc')), [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('orderDate', 'desc')), [db]);
  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  const consultationsQuery = useMemoFirebase(() => query(collection(db, 'consultations'), orderBy('createdAt', 'desc')), [db]);
  const { data: consultations, isLoading: consultationsLoading } = useCollection(consultationsQuery);

  const confirmDelete = () => {
    if (!lookToDelete) return;
    const lookRef = doc(db, 'looks', lookToDelete);
    deleteDocumentNonBlocking(lookRef);
    toast({ title: "Deletion Initiated" });
    setLookToDelete(null);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'Confirmed',
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Order Accepted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed" });
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 space-y-10 max-w-6xl pb-32">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 neon-bg rounded-full" />
          <h1 className="text-base font-black tracking-tighter neon-text uppercase italic">
            {t(dictionary.adminDashboard)}
          </h1>
        </div>
        
        <Button asChild className="neon-bg text-black font-black px-6 rounded-xl h-10 transition-transform hover:scale-105 active:scale-95 border-none text-xs cursor-pointer">
          <Link href="/admin/looks/new">
            <Plus className="w-4 h-4 mr-2" />
            {t(dictionary.newLook)}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-12 flex w-fit">
          <TabsTrigger value="inventory" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-none">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-none">
            Orders
          </TabsTrigger>
          <TabsTrigger value="consultations" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:neon-bg data-[state=active]:text-black transition-none">
            {t(dictionary.razmeringiz)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 neon-text" />
            <h2 className="text-lg font-bold tracking-tight text-white uppercase italic">{t(dictionary.activeInventory)}</h2>
          </div>
          <Card className="glass-dark rounded-[2rem] overflow-hidden shadow-2xl border-white/10">
            {looksLoading ? (
              <div className="p-32 flex flex-col items-center gap-6"><Loader2 className="animate-spin w-10 h-10 neon-text" /></div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-none">
                    <TableHead className="pl-8 text-[10px] uppercase tracking-widest">Visual</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest">Name</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-widest">Value</TableHead>
                    <TableHead className="text-right pr-8 text-[10px] uppercase tracking-widest">Ops</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {looks?.map((look) => (
                    <TableRow key={look.id} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="pl-8 py-4">
                        <img src={look.imageUrl} className="w-12 h-16 object-cover rounded-lg border border-white/10" alt="" />
                      </TableCell>
                      <TableCell className="font-bold">{look.name}</TableCell>
                      <TableCell className="neon-text font-black">{look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}</TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/looks/${look.id}/edit`}><Button variant="ghost" size="icon"><Edit3 className="w-4 h-4" /></Button></Link>
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
          <div className="flex items-center gap-3"><ShoppingBag className="w-5 h-5 neon-text" /><h2 className="text-lg font-bold text-white uppercase italic">Active Orders</h2></div>
          <Card className="glass-dark rounded-[2rem] overflow-hidden border-white/10">
            {ordersLoading ? <div className="p-32 flex justify-center"><Loader2 className="animate-spin" /></div> : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="pl-8">Customer</TableHead>
                    <TableHead>Specs (H/W)</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-8">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="border-white/5">
                      <TableCell className="pl-8">
                        <div className="flex flex-col">
                          <span className="font-bold">{order.customerName}</span>
                          <span className="text-[10px] text-white/40">{order.telegramUsername}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] font-mono">
                          {order.measurements?.height || '?'}/{order.measurements?.weight || '?'}
                        </div>
                      </TableCell>
                      <TableCell className="font-black">${order.totalAmount}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-black uppercase ${order.status === 'New' ? 'text-amber-500' : 'text-primary'}`}>{order.status}</span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {order.status === 'New' && <Button onClick={() => handleAcceptOrder(order.id)} className="h-8 text-[10px] neon-bg text-black font-black uppercase">Accept</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <div className="flex items-center gap-3"><Ruler className="w-5 h-5 neon-text" /><h2 className="text-lg font-bold text-white uppercase italic">Razmeringiz Requests</h2></div>
          <Card className="glass-dark rounded-[2rem] overflow-hidden border-white/10">
            {consultationsLoading ? <div className="p-32 flex justify-center"><Loader2 className="animate-spin" /></div> : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="pl-8">Customer</TableHead>
                    <TableHead>Measurements</TableHead>
                    <TableHead>Preferred Fit</TableHead>
                    <TableHead>Known Size</TableHead>
                    <TableHead className="text-right pr-8">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultations?.map((consult) => (
                    <TableRow key={consult.id} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="pl-8">
                        <div className="flex flex-col"><span className="font-bold">{consult.customerName}</span><span className="text-[10px] text-white/40">{consult.telegramUsername}</span></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs">
                          <span className="text-white/40">H:</span> <span className="font-bold">{consult.heightCm}cm</span>
                          <span className="text-white/40 ml-2">W:</span> <span className="font-bold">{consult.weightKg}kg</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-xs font-bold uppercase tracking-wider text-primary">{consult.desiredFit}</span></TableCell>
                      <TableCell><span className="text-xs font-black neon-text">{consult.knownSize}</span></TableCell>
                      <TableCell className="text-right pr-8 text-[10px] text-white/30">{consult.createdAt ? format(new Date(consult.createdAt), 'MMM dd, HH:mm') : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {(!consultations || consultations.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="py-20 text-center text-white/20 italic uppercase tracking-widest">No active requests</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!lookToDelete} onOpenChange={(open) => !open && setLookToDelete(null)}>
        <AlertDialogContent className="glass-dark border-white/10 rounded-[2rem] text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black neon-text uppercase italic">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">Are you sure you want to remove this item?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
