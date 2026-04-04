
"use client"

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, CheckCircle2, ShoppingBag, Send, Phone, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyAdminOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { useTelegramUser } from '@/hooks/use-telegram-user';

export default function UserOrdersPage() {
  const db = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { t, lang, dictionary } = useLanguage();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (isUserLoading || !firebaseUser) return null;
    return query(
      collection(db, 'orders'),
      where('firebaseUid', '==', firebaseUser.uid)
    );
  }, [db, firebaseUser, isUserLoading]);

  const { data: orders, isLoading } = useCollection(ordersQuery ?? undefined);

  const handleCancelOrder = async (order: any) => {
    setCancellingId(order.id);
    try {
      const timestamp = new Date().toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'Cancelled',
        updatedAt: serverTimestamp()
      });

      await notifyAdminOfOrder({
        customerName: order.telegramUsername || order.customerName,
        orderId: order.id,
        currentStatus: 'Cancelled',
        productName: order.lookName || 'Outfit',
        phoneNumber: order.phoneNumber,
        telegramUsername: order.telegramUsername,
        imageUrl: order.lookImageUrl,
        language: 'uz',
        timestamp: timestamp,
        physique: {
          height: order.measurements?.height,
          weight: order.measurements?.weight,
          size: order.size,
        }
      });

      toast({
        title: t(dictionary.orderCancelled),
        description: t(dictionary.orderCancelledSuccess)
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: t(dictionary.errorTitle),
        description: t(dictionary.errorDescription)
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin neon-text" />
        <p className="text-white font-mono text-[10px] uppercase tracking-widest">{t(dictionary.syncing)}</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'New': return t(dictionary.orderPending);
      case 'Confirmed': return t(dictionary.orderAccepted);
      case 'Shipped': return t(dictionary.orderShipped);
      case 'Delivered': return t(dictionary.orderDelivered);
      case 'Cancelled': return t(dictionary.orderCancelled);
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Confirmed': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Package className="w-4 h-4 text-white/40" />;
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('uz-UZ').format(val);
  };

  const formatOrderDate = (dateObj: any) => {
    if (!dateObj) return '';
    const date = dateObj.seconds ? dateObj.toDate() : new Date(dateObj);
    return new Intl.DateTimeFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const translateSize = (size: string) => {
    if (size.includes('(Menejer maslahati)')) {
      return size.replace('(Menejer maslahati)', `(${t(dictionary.managerAdviceLabel)})`);
    }
    return size;
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
          <Card key={order.id} className={`glass-dark border-white/5 p-6 rounded-[2rem] space-y-4 transition-opacity ${order.status === 'Cancelled' ? 'opacity-60' : 'opacity-100'}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t(dictionary.orderRef)}: {order.id.substring(0, 8)}</p>
                <h3 className="text-lg font-bold text-white italic">
                  {order.lookName || 'Outfit Purchase'}
                </h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t(dictionary.size)}: {translateSize(order.size)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className={`flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border ${order.status === 'Cancelled' ? 'border-destructive/30' : 'border-white/10'}`}>
                  {getStatusIcon(order.status)}
                  <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'Cancelled' ? 'text-destructive' : 'text-white/80'}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 py-4 border-y border-white/5">
              <div className="flex items-center gap-2">
                <Send className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">TELEGRAM:</span>
                <p className="text-xs text-white font-medium">{order.telegramUsername || order.customerName}</p>
              </div>
              {order.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-white" />
                  <p className="text-xs text-white font-medium">{order.phoneNumber}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t(dictionary.transactionDate)}</p>
                <p className="text-[10px] font-medium text-white/80">
                  {formatOrderDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right space-y-3">
                <div>
                  <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">{t(dictionary.total)}</p>
                  <p className="text-xl font-black neon-text italic tracking-tighter">
                    {order.currency === 'UZS' ? `${formatPrice(order.totalAmount)} UZS` : `$${formatPrice(order.totalAmount)}`}
                  </p>
                </div>
                
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancellingId === order.id}
                    className="h-8 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive text-[10px] font-black uppercase tracking-widest"
                  >
                    {cancellingId === order.id ? <Loader2 className="animate-spin w-3 h-3" /> : t(dictionary.cancelOrder)}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="py-20 text-center space-y-4">
            <Package className="w-12 h-12 text-white/10 mx-auto" />
            <p className="text-white/40 uppercase font-black italic tracking-widest">{t(dictionary.repositoryEmpty)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
