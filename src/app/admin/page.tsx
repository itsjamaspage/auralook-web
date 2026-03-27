"use client"

import { useState } from 'react';
import { MOCK_LOOKS, MOCK_ORDERS, type Order } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  LayoutDashboard, 
  Package, 
  Bell, 
  Settings, 
  ExternalLink,
  CheckCircle,
  Truck,
  PackageCheck
} from 'lucide-react';
import Link from 'next/link';
import { aiTelegramOrderStatusNotification } from '@/ai/flows/ai-telegram-order-status-notification';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const { toast } = useToast();

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    
    const order = updated.find(o => o.id === orderId)!;
    
    // Simulate AI generation of Telegram message
    try {
      const { message } = await aiTelegramOrderStatusNotification({
        customerName: order.customerName,
        orderId: order.id,
        currentStatus: newStatus,
        productName: MOCK_LOOKS.find(l => l.id === order.lookId)?.name.en || 'Outfit',
        estimatedDeliveryDate: newStatus === 'Shipped' ? 'Next Friday' : null,
        language: 'en'
      });
      
      toast({
        title: `Status Updated to ${newStatus}`,
        description: `Telegram message sent: "${message.substring(0, 50)}..."`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter">JamaStore Admin</h1>
          <p className="text-muted-foreground">Manage your looks, catalog, and customer orders.</p>
        </div>
        <Link href="/admin/looks/new">
          <Button className="rounded-2xl bg-primary text-primary-foreground font-bold px-8">
            <Plus className="w-4 h-4 mr-2" />
            Create Look
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,490</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Catalog Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_LOOKS.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/5 rounded-[2rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">+12.5%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Recent Orders</h2>
        </div>
        
        <Card className="glass-dark border-white/5 rounded-[2.5rem] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="py-6 font-bold">Order ID</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="py-6 font-mono font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.telegramUsername}</span>
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
                  <TableCell className="font-bold text-primary">${order.amount}</TableCell>
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
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}