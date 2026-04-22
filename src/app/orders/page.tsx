"use client"

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc, updateDoc, serverTimestamp, where, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Clock, CheckCircle2, ShoppingBag, XCircle, Truck, Star, ExternalLink, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyAdminOfOrder } from '@/ai/flows/ai-telegram-order-status-notification';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion-reveal';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  New:       { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20' },
  Confirmed: { icon: CheckCircle2, color: 'text-green-500',   bg: 'bg-green-500/10 border-green-500/20' },
  Shipped:   { icon: Truck,        color: 'neon-text',        bg: 'bg-primary/10 border-primary/20' },
  Delivered: { icon: Star,         color: 'text-green-500',   bg: 'bg-green-500/10 border-green-500/20' },
  Cancelled: { icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/5 border-destructive/20' },
};

const STATUS_RANK: Record<string, number> = { New: 0, Confirmed: 1, Shipped: 2, Delivered: 3 };

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

  useEffect(() => {
    if (!orders || !db) return;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    orders
      .filter(o => o.status === 'Cancelled')
      .filter(o => {
        const ts = o.updatedAt?.seconds ? o.updatedAt.toDate().getTime() : new Date(o.updatedAt || o.createdAt).getTime();
        return ts < oneDayAgo;
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
          <StaggerContainer className="space-y-5">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.New;
              const StatusIcon = cfg.icon;
              const isCancelled = order.status === 'Cancelled';
              const rank = STATUS_RANK[order.status] ?? 0;
              const timelineSteps = [
                { label: t(dictionary.stepOrderPlaced), icon: ShoppingBag },
                { label: t(dictionary.stepConfirmed),   icon: CheckCircle2 },
                { label: t(dictionary.stepInTransit),   icon: Truck },
                { label: t(dictionary.stepDelivered),   icon: Star },
              ];
              return (
                <StaggerItem key={order.id}>
                  <div className={cn(
                    'bg-secondary/30 rounded-[2rem] overflow-hidden border border-foreground/5 transition-all',
                    isCancelled && 'opacity-60 grayscale-[0.4]'
                  )}>

                    {/* Look image banner */}
                    {order.lookImageUrl && (
                      <Link href={order.lookId ? `/looks/${order.lookId}` : '#'} className="block relative w-full aspect-[16/9] bg-foreground/5">
                        <Image
                          src={order.lookImageUrl}
                          alt={order.lookName || 'Look'}
                          fill
                          quality={85}
                          sizes="(max-width: 672px) 100vw, 672px"
                          className="object-cover"
                        />
                        {/* Status badge over image */}
                        <div className={cn('absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-sm', cfg.bg)}>
                          <StatusIcon className={cn('w-3 h-3', cfg.color)} />
                          <span className={cfg.color}>
                            {order.status === 'New' ? t(dictionary.orderPending)
                              : order.status === 'Confirmed' ? t(dictionary.orderAccepted)
                              : order.status === 'Shipped' ? t(dictionary.orderShipped)
                              : order.status === 'Delivered' ? t(dictionary.orderYetkazildi)
                              : t(dictionary.orderCancelled)}
                          </span>
                        </div>
                        {/* Price badge */}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full neon-bg text-white text-[11px] font-black shadow-lg">
                          {formatPrice(order)}
                        </div>
                      </Link>
                    )}

                    <div className="p-5 space-y-5">

                      {/* Order info row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                            #{order.id.substring(0, 8)}
                          </p>
                          <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-tight">
                            {order.lookName || 'Outfit'}
                          </h3>
                          <p className="text-[11px] font-bold neon-text uppercase tracking-wider">
                            {t(dictionary.size)}: {order.size}
                          </p>
                        </div>
                        {/* Only show status badge here if there's no image */}
                        {!order.lookImageUrl && (
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
                        )}
                        <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-widest shrink-0 self-end">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Status timeline */}
                      {!isCancelled && (
                        <div className="flex items-start gap-0 py-2 px-1 bg-foreground/[0.02] rounded-2xl">
                          {timelineSteps.map((step, i) => {
                            const done = i <= rank;
                            const active = i === rank;
                            const StepIcon = step.icon;
                            return (
                              <div key={i} className="flex items-center flex-1 min-w-0">
                                <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                  <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                                    done ? 'neon-bg border-transparent shadow-[0_0_12px_rgba(var(--sync-color),0.4)]' : 'bg-background border-foreground/10'
                                  )}>
                                    <StepIcon className={cn('w-3.5 h-3.5', done ? 'text-white' : 'text-foreground/20')} />
                                  </div>
                                  <p className={cn(
                                    'text-[8px] font-black uppercase tracking-tight text-center leading-tight px-1',
                                    active ? 'neon-text' : done ? 'text-foreground/50' : 'text-foreground/20'
                                  )}>{step.label}</p>
                                </div>
                                {i < timelineSteps.length - 1 && (
                                  <div className={cn('h-[2px] w-4 rounded-full mx-0.5 mb-5 shrink-0 transition-all', done && i < rank ? 'neon-bg' : 'bg-foreground/10')} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tracking rows */}
                      {!isCancelled && (
                        <div className="space-y-2.5">
                          {/* China domestic tracking */}
                          {order.domesticTracking ? (
                            <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-foreground/[0.03] border border-foreground/10">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-lg shrink-0">🇨🇳</span>
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.chinaTracking)}</p>
                                  <p className="text-[12px] font-mono font-bold text-foreground truncate">{order.domesticTracking}</p>
                                </div>
                              </div>
                              <a
                                href={`https://t.17track.net/en#nums=${encodeURIComponent(order.domesticTracking)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-foreground/15 text-foreground/60 text-[9px] font-black uppercase tracking-wide shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" /> Track
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                              <span className="text-lg opacity-25">🇨🇳</span>
                              <div>
                                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{t(dictionary.chinaTracking)}</p>
                                <p className="text-[10px] text-foreground/25 font-medium">{t(dictionary.trackingPending)}</p>
                              </div>
                            </div>
                          )}

                          {/* International tracking */}
                          {order.trackingNumber ? (
                            <div className="flex items-center justify-between gap-3 py-3 px-4 rounded-2xl bg-primary/5 border border-primary/15">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <MapPin className="w-4 h-4 neon-text shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{t(dictionary.intlTracking)}</p>
                                  <p className="text-[12px] font-mono font-bold text-foreground truncate">{order.trackingNumber}</p>
                                </div>
                              </div>
                              <a
                                href={`https://t.17track.net/en#nums=${encodeURIComponent(order.trackingNumber)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl neon-bg text-black text-[9px] font-black uppercase tracking-wider shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {t(dictionary.trackPackage)}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
                              <Truck className="w-4 h-4 text-foreground/20 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{t(dictionary.intlTracking)}</p>
                                <p className="text-[10px] text-foreground/25 font-medium">{t(dictionary.trackingPending)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom row */}
                      <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                        {order.lookImageUrl && (
                          <p className="text-lg font-black neon-text tracking-tight">{formatPrice(order)}</p>
                        )}
                        {!order.lookImageUrl && (
                          <p className="text-lg font-black neon-text tracking-tight">{formatPrice(order)}</p>
                        )}
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
