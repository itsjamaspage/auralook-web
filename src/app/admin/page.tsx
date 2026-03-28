
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
  Plus, 
  Loader2,
  LayoutGrid,
  Trash2,
  Edit3,
  ExternalLink,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useLanguage } from '@/hooks/use-language';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const handleDeleteLook = async (lookId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, 'looks', lookId));
      toast({ 
        title: "Deleted", 
        description: "The look has been permanently removed from your catalog." 
      });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Delete Failed" });
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 space-y-10 max-w-6xl">
      {/* Refined Terminal Header */}
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

      {/* Main Catalog View */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 neon-text" />
          <h2 className="text-lg font-bold tracking-tight text-white uppercase italic">{t(dictionary.activeInventory)}</h2>
        </div>

        <Card className="glass-dark rounded-[2rem] overflow-hidden shadow-2xl border-white/10">
          {looksLoading ? (
            <div className="p-32 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin w-10 h-10 neon-text" />
              <p className="text-white/40 font-mono tracking-widest text-[10px] uppercase">Decrypting Catalog...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-6 pl-8 font-black uppercase tracking-[0.2em] text-[10px] text-white/60">{t(dictionary.visual)}</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">{t(dictionary.productName)}</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">{t(dictionary.marketValue)}</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60 text-right pr-8">{t(dictionary.operations)}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {looks?.map((look) => (
                  <TableRow key={look.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                    <TableCell className="py-5 pl-8">
                      <div className="relative w-14 h-18 rounded-xl overflow-hidden border border-white/10 group-hover:neon-border transition-all">
                        <img 
                          src={look.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={look.name} 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-white text-base tracking-tight">{look.name}</span>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">REF: {look.id.substring(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black neon-text">
                          {look.price}
                        </span>
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                          {look.currency || 'USD'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Link href={`/looks/${look.id}`}>
                          <Button variant="ghost" size="icon" className="text-white/40 hover:neon-text hover:bg-white/5 rounded-lg transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-white/40 hover:neon-text hover:bg-white/5 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteLook(look.id)}
                          className="text-white/40 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!looks || looks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Package className="w-10 h-10 text-white/10" />
                        <p className="text-white/40 font-light text-base">
                          {t(dictionary.emptyCatalog)}
                        </p>
                        <Button asChild variant="outline" className="border-white/10 text-white rounded-lg hover:bg-white/5 hover:neon-text transition-all">
                          <Link href="/admin/looks/new">
                            {t(dictionary.createFirstLook)}
                          </Link>
                        </Button>
                      </div>
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
