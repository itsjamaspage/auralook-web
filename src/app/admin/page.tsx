
"use client"

import { useState, useMemo } from 'react';
import { MOCK_LOOKS } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Package, 
  ExternalLink,
  CheckCircle,
  Truck,
  PackageCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { aiTelegramOrderStatusNotification } from '@/ai/flows/ai-telegram-order-status-notification';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(() => collection(db, 'orders'), [db]);
  const { data: orders, isLoading, error } = useCollection(ordersQuery);

  const handleUpdateStatus = async (orderId: string, newStatus: any) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      const order = orders?.find(o => o.id === orderId);
      if (order) {
        const { message } = await aiTelegramOrderStatusNotification({
          customerName: order.customerName,
          orderId: order.id,
          currentStatus: newStatus as any,
          productName: MOCK_LOOKS.find(l => l.id === order.lookId)?.name.uz || 'Kiyim',
          estimatedDeliveryDate: newStatus === 'Shipped' ? 'Keyingi juma' : null,
          language: 'uz'
        });
        
        toast({
          title: `Holat yangilandi: ${newStatus}`,
          description: `Telegram xabari tayyor.`,
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update order status."
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">Auralook.uz Admin</h1>
          <p className="text-muted-foreground">Liboslar va buyurtmalarni boshqarish.</p>
        </div>
        <Link href="/admin/looks/new">
          <Button className="rounded-2xl bg-primary text-primary-foreground font-bold px-8">
            <Plus className="w-4 h-4 mr-2" />
            Libos yaratish
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Jami savdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${orders?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Faol buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders?.filter(o => o.status !== 'Delivered').length || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Katalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_LOOKS.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Yangilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {orders?.filter(o => o.status === 'New').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Buyurtmalar</h2>
        </div>
        
        <Card className="glass-dark border-white/5 rounded-[2.5rem] overflow-hidden">
          {isLoading ? (
            <div className="p-24 flex justify-center">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-6 font-bold">ID</TableHead>
                  <TableHead className="font-bold">Mijoz</TableHead>
                  <TableHead className="font-bold">Holat</TableHead>
                  <TableHead className="font-bold">Summa</TableHead>
                  <TableHead className="font-bold text-right">Amal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-6 font-mono font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">{order.customerName}</span>
                        <span className="text-xs text-primary font-mono">{order.telegramUsername}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-4 border-white/10 ${
                        order.status === 'New' ? 'text-blue-400' : 
                        order.status === 'Confirmed' ? 'text-yellow-400' :
                        order.status === 'Shipped' ? 'text-purple-400' :
                        'text-green-400'
                      }`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-primary">${order.totalAmount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'New' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Confirmed')} className="hover:text-yellow-400">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {order.status === 'Confirmed' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="hover:text-purple-400">
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                        {order.status === 'Shipped' && (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="hover:text-green-400">
                            <PackageCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="hover:text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!orders || orders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center text-muted-foreground">
                      Hozircha buyurtmalar yo'q.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
