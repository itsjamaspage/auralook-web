
"use client"

import { useState } from 'react';
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
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  Trash2,
  Edit3
} from 'lucide-react';
import Link from 'next/link';
import { aiTelegramOrderStatusNotification } from '@/ai/flows/ai-telegram-order-status-notification';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();

  // Fetch real orders and looks from Firestore
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('orderDate', 'desc')), [db]);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useCollection(ordersQuery);

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      const order = orders?.find(o => o.id === orderId);
      if (order) {
        await aiTelegramOrderStatusNotification({
          customerName: order.customerName,
          orderId: order.id,
          currentStatus: newStatus as any,
          productName: looks?.find(l => l.id === order.lookId)?.name || 'Kiyim',
          estimatedDeliveryDate: newStatus === 'Shipped' ? 'Yaqin orada' : null,
          language: 'uz'
        });
        
        toast({
          title: `Status: ${newStatus}`,
          description: `Telegram notification sent to ${order.customerName}`,
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

  const handleDeleteLook = async (lookId: string) => {
    if (!confirm("Are you sure you want to delete this look?")) return;
    try {
      await deleteDoc(doc(db, 'looks', lookId));
      toast({ title: "Look Deleted", description: "The item has been removed from the catalog." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  // Chart Data Preparation
  const chartData = orders?.slice(0, 7).reverse().map(o => ({
    date: new Date(o.orderDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }),
    amount: o.totalAmount
  })) || [];

  const chartConfig = {
    amount: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  if (ordersError) {
    return (
      <div className="container mx-auto px-6 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto neon-text" />
        <h1 className="text-2xl font-bold neon-text">{t(dictionary.adminDashboard)} - No Access</h1>
        <p className="text-muted-foreground">Admin permissions required to view this terminal.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter neon-text">{t(dictionary.adminDashboard)}</h1>
          <p className="text-muted-foreground">{t(dictionary.adminDashboardDesc)}</p>
        </div>
        <Link href="/admin/looks/new">
          <Button className="rounded-2xl neon-bg border-none text-black font-black px-8 h-14 transition-transform hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            {t(dictionary.newLook)}
          </Button>
        </Link>
      </div>

      {/* Analytics & Stats */}
      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 glass-dark border-white/5 rounded-[2.5rem] p-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between px-2 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 neon-text" />
                Sales Analytics
              </CardTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Past 7 Orders Performance</p>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] px-0">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="glass-dark border-white/5 rounded-[2rem] p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t(dictionary.totalSales)}</p>
            <div className="text-4xl font-black neon-text">${orders?.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0).toLocaleString()}</div>
          </Card>
          <Card className="glass-dark border-white/5 rounded-[2rem] p-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t(dictionary.activeOrders)}</p>
            <div className="text-4xl font-black">{orders?.filter(o => o.status !== 'Delivered').length || 0}</div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="bg-white/5 rounded-2xl p-1 mb-8 h-14 border border-white/5">
          <TabsTrigger value="orders" className="rounded-xl px-8 h-full font-bold data-[state=active]:neon-bg data-[state=active]:text-black">
            <Package className="w-4 h-4 mr-2" />
            {t(dictionary.orders)}
          </TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-xl px-8 h-full font-bold data-[state=active]:neon-bg data-[state=active]:text-black">
            <LayoutGrid className="w-4 h-4 mr-2" />
            {t(dictionary.catalog)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="glass-dark border-white/5 rounded-[2.5rem] overflow-hidden">
            {ordersLoading ? (
              <div className="p-24 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 neon-text" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="py-6 font-bold uppercase tracking-widest text-[10px]">{t(dictionary.orderId)}</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">{t(dictionary.customer)}</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">{t(dictionary.status)}</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">{t(dictionary.amount)}</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-right">{t(dictionary.actions)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="py-6 font-mono font-medium text-xs text-muted-foreground">#{order.id.substring(0, 8)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{order.customerName}</span>
                          <span className="text-[10px] neon-text font-mono">{order.telegramUsername}</span>
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
                      <TableCell className="font-black text-primary">${order.totalAmount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'New' && (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Confirmed')} className="hover:text-yellow-400 rounded-lg">
                              <CheckCircle className="w-5 h-5" />
                            </Button>
                          )}
                          {order.status === 'Confirmed' && (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Shipped')} className="hover:text-purple-400 rounded-lg">
                              <Truck className="w-5 h-5" />
                            </Button>
                          )}
                          {order.status === 'Shipped' && (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(order.id, 'Delivered')} className="hover:text-green-400 rounded-lg">
                              <PackageCheck className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!orders || orders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-24 text-center text-muted-foreground font-light">
                        {t(dictionary.noOrders)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
          <Card className="glass-dark border-white/5 rounded-[2.5rem] overflow-hidden">
            {looksLoading ? (
              <div className="p-24 flex justify-center">
                <Loader2 className="animate-spin w-8 h-8 neon-text" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="py-6 font-bold uppercase tracking-widest text-[10px]">Preview</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Name</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px]">Price</TableHead>
                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {looks?.map((look) => (
                    <TableRow key={look.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="py-4">
                        <img src={look.imageUrl} className="w-12 h-16 object-cover rounded-lg border border-white/10" alt={look.name} />
                      </TableCell>
                      <TableCell className="font-bold">{look.name}</TableCell>
                      <TableCell className="font-black neon-text">
                        {look.price} {look.currency || 'USD'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="hover:neon-text rounded-lg">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteLook(look.id)}
                            className="hover:text-destructive rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
