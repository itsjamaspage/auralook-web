
"use client"

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { Card } from '@/components/ui/card';
import { Loader2, Package, Clock, CheckCircle2, ShoppingBag, Send, Phone } from 'lucide-react';
import { format } from 'date-fns';

export default function UserOrdersPage() {
  const db = useFirestore();
  const { t, dictionary } = useLanguage();

  const ordersQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
  }, [db]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Scanning Orders...</p>
      </div>
    );
  }

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

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-2xl pb-32">
      <div className="flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 neon-text" />
        <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">
          {t(dictionary.myOrders)}
        </h1>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id} className="glass-dark border-white/5 p-6 rounded-[2rem] space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Order Ref: {order.id.substring(0, 8)}</p>
                <h3 className="text-lg font-bold text-white italic">
                  {order.lookName || 'Look Purchase'}
                </h3>
                <p className="text-[10px] font-bold text-primary uppercase">Size: {order.size}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {getStatusIcon(order.status)}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-4 border-y border-white/5">
              <div className="flex items-center gap-2">
                <Send className="w-3 h-3 text-white/40" />
                <span className="text-[10px] font-bold text-white/40 uppercase">Telegram:</span>
                <p className="text-xs text-white/80 font-medium">{order.telegramUsername || order.customerName}</p>
              </div>
              {order.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white/40" />
                  <p className="text-xs text-white/60 font-medium">{order.phoneNumber}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Transaction Date</p>
                <p className="text-[10px] font-medium text-white/80">
                  {order.createdAt ? format(new Date(order.createdAt.seconds ? order.createdAt.toDate() : order.createdAt), 'MMM dd, yyyy HH:mm') : 'Recently'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total</p>
                <p className="text-xl font-black neon-text italic">
                  {order.currency === 'UZS' ? `${formatPrice(order.totalAmount)} UZS` : `$${formatPrice(order.totalAmount)}`}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="py-20 text-center space-y-4">
            <Package className="w-12 h-12 text-white/10 mx-auto" />
            <p className="text-white/40 uppercase font-black italic tracking-widest">No Active Orders Detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
