"use client"

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc, updateDoc, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, CheckCircle2, ShoppingCart, Send, Phone, XCircle, Truck, Star, ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyAdminOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion-reveal';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  New:       { icon: Clock,        color: 'text-amber-500',    bg: 'bg-amber-500/10 border-amber-500/20' },
  Confirmed: { icon: CheckCircle2, color: 'text-green-500',    bg: 'bg-green-500/10 border-green-500/20' },
  Shipped:   { icon: Truck,        color: 'neon-text',         bg: 'bg-primary/10 border-primary/20' },
  Delivered: { icon: Star,         color: 'text-green-500',    bg: 'bg-green-500/10 border-green-500/20' },
  Cancelled: { icon: XCircle,      color: 'text-destructive',  bg: 'bg-destructive/5 border-destructive/20' },
};

export default function UserOrdersPage() {
  const db = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();
  const { t, lang, dictionary } = useLanguage();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (isUserLoading || !firebaseUser) return null;
    return query(collection(db, 'orders'), where('firebaseUid', '==', firebaseUser.uid));
  }, [db, firebaseUser, isUserLoading]);

  const { data: orders, isLoading } = useCollection(ordersQuery ?? undefined);

  // 24-hour auto-cleanup for cancelled orders
  useEffect(() => {
    if (!orders || !db) return;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    orders
      .filter(o => o.status === 'Cancelled')
      .filter(o => {
        const t = o.updatedAt?.seconds ? o.updatedAt.toDate().getTime() : new Date(o.updatedAt || o.createdAt).getTime();
        return t < oneDayAgo;
      })
      .forEach(o => deleteDoc(doc(db, 'orders', o.id)).catch(console.warn));
  }, [orders, db]);

  const handleCancelOrder = async (order: any) => {
    setCancellingId(order.id);
    try {
      const timestamp = new Date().toLocaleString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US');
      await updateDoc(doc(db, 'orders', order.id), { status: 'Cancelled', updatedAt: serverTimestamp() });
      await notifyAdminOfOrder({
        customerName: order.telegramUsername || order.customerName,
        orderId: order.id,
        currentStatus: 'Cancelled',
        productName: order.lookName || 'Outfit',
        phoneNumber: order.phoneNumber,
        telegramUsername: order.telegramUsername,
        imageUrl: order.lookImageUrl,
        language: 'uz',
        timestamp,
        physique: { height: order.measurements?.height, weight: order.measurements?.weight, size: order.size },
      });
      toast({ title: t(dictionary.orderCancelled), description: t(dictionary.orderCancelledSuccess) });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: t(dictionary.errorTitle) });
    } finally { setCancellingId(null); }
  };

  const formatPrice = (order: any) => {
    const n = new Intl.NumberFormat('uz-UZ').format(order.totalAmount).replace(/,/g, ' ');
    return order.currency === 'UZS' ? `${n} UZS` : `$${n}`;
  };

  const formatDate = (d: any) => {
    if (!d) return '';
    const date = d.seconds ? d.toDate() : new Date(d);
    return new Intl.DateTimeFormat(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin neon-text" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">

        <FadeUp>
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-5 h-5 neon-text" />
            <h1 className="text-lg font-black text-foreground uppercase tracking-wide">
              {t(dictionary.myOrders)}
            </h1>
            {orders && orders.length > 0 && (
              <span className="ml-auto text-xs font-bold text-foreground/40 uppercase tracking-widest">
                {orders.length}
              </span>
            )}
          </div>
        </FadeUp>

        {!orders || orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-28 text-center space-y-5">
            <Package className="w-12 h-12 text-foreground/10 mx-auto" />
            <p className="text-sm font-black text-foreground/30 uppercase tracking-widest">{t(dictionary.repositoryEmpty)}</p>
            <Button asChild variant="outline" className="h-11 px-6 rounded-2xl border-foreground/10 font-black uppercase text-xs tracking-widest hover:neon-border hover:neon-text transition-all">
              <Link href="/looks">{t(dictionary.browseLooks)}</Link>
            </Button>
          </motion.div>
        ) : (
          <StaggerContainer className="space-y-3">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.New;
              const StatusIcon = cfg.icon;
              const isCancelled = order.status === 'Cancelled';
              return (
                <StaggerItem key={order.id}>
                  <div className={cn(
                    'bg-secondary/30 rounded-[1.5rem] p-4 border border-foreground/5 space-y-3 transition-all',
                    isCancelled && 'opacity-60 grayscale-[0.4]'
                  )}>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                          #{order.id.substring(0, 8)}
                        </p>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight leading-tight truncate">
                          {order.lookName || 'Outfit'}
                        </h3>
                        <p className="text-[10px] font-bold neon-text uppercase tracking-wider">
                          {t(dictionary.size)}: {order.size}
                        </p>
                      </div>
                      <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest shrink-0', cfg.bg)}>
                        <StatusIcon className={cn('w-3 h-3', cfg.color)} />
                        <span className={cfg.color}>
                          {order.status === 'New' ? t(dictionary.orderPending)
                            : order.status === 'Confirmed' ? t(dictionary.orderAccepted)
                            : order.status === 'Shipped' ? t(dictionary.orderShipped)
                            : order.status === 'Delivered' ? t(dictionary.orderYetkazildi)
                            : t(dictionary.orderCancelled)}
                        </span>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-4 py-2 border-y border-foreground/5">
                      <div className="flex items-center gap-1.5">
                        <Send className="w-3 h-3 neon-text" />
                        <span className="text-xs text-foreground/60 font-medium">
                          @{order.telegramUsername?.replace('@', '') || order.customerName}
                        </span>
                      </div>
                      {order.phoneNumber && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-foreground/40" />
                          <span className="text-xs text-foreground/60 font-mono">{order.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Tracking row */}
                    {order.trackingNumber ? (
                      <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-3.5 h-3.5 neon-text shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.trackingNumber)}</p>
                            <p className="text-[11px] font-mono font-bold text-foreground truncate">{order.trackingNumber}</p>
                          </div>
                        </div>
                        <a
                          href={`https://t.17track.net/en#nums=${encodeURIComponent(order.trackingNumber)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg neon-bg text-black text-[9px] font-black uppercase tracking-wider shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {t(dictionary.trackPackage)}
                        </a>
                      </div>
                    ) : (order.status === 'Shipped' || order.status === 'Confirmed') && (
                      <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-foreground/[0.03] border border-foreground/5">
                        <Truck className="w-3.5 h-3.5 text-foreground/20 shrink-0" />
                        <p className="text-[10px] text-foreground/30 font-medium">{t(dictionary.trackingPending)}</p>
                      </div>
                    )}

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                        <p className="text-base font-black neon-text tracking-tight">{formatPrice(order)}</p>
                      </div>
                      {!isCancelled && order.status !== 'Delivered' && (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleCancelOrder(order)}
                          disabled={cancellingId === order.id}
                          className="h-9 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 text-[10px] font-black uppercase tracking-widest px-4"
                        >
                          {cancellingId === order.id
                            ? <Loader2 className="animate-spin w-3 h-3" />
                            : t(dictionary.cancelOrder)}
                        </Button>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
