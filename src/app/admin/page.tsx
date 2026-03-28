
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
  Box,
  ExternalLink
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

  // Fetch only looks for the catalog management
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
    <div className="container mx-auto px-6 py-12 space-y-12 max-w-6xl">
      {/* Terminal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 neon-bg rounded-full" />
            <h1 className="text-5xl font-black tracking-tighter neon-text uppercase italic">
              {t(dictionary.adminDashboard)}
            </h1>
          </div>
          <p className="text-white/60 font-light tracking-wide max-w-md">
            Central Command for the Auralook Catalog. Manage your futuristic apparel and style drops.
          </p>
        </div>
        
        <Link href="/admin/looks/new">
          <Button className="rounded-2xl neon-bg border-none text-black font-black px-10 h-16 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]">
            <Plus className="w-6 h-6 mr-2" />
            {t(dictionary.newLook)}
          </Button>
        </Link>
      </div>

      {/* Grid Stats & Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="glass-dark border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-primary/40 transition-all duration-500">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t(dictionary.catalog)}</p>
            <div className="text-5xl font-black text-white group-hover:neon-text transition-colors">
              {looks?.length || 0}
            </div>
            <p className="text-xs text-white/30 font-medium">Active Drops</p>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/5 group-hover:neon-border transition-all">
            <Box className="w-10 h-10 text-white group-hover:neon-text" />
          </div>
        </Card>

        <Card className="md:col-span-2 glass-dark border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Catalog Intelligence</h3>
              <p className="text-white/50 text-sm font-light">Monitor your collections performance and availability.</p>
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="ghost" className="text-white hover:bg-white/5 border border-white/10 rounded-xl h-10 text-xs font-bold uppercase tracking-widest">
                Export Data
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/5 border border-white/10 rounded-xl h-10 text-xs font-bold uppercase tracking-widest">
                Refresh Sync
              </Button>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutGrid className="w-48 h-48" />
          </div>
        </Card>
      </div>

      {/* Main Catalog View */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <LayoutGrid className="w-8 h-8 neon-text" />
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Active Inventory</h2>
        </div>

        <Card className="glass-dark border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
          {looksLoading ? (
            <div className="p-32 flex flex-col items-center gap-6">
              <Loader2 className="animate-spin w-12 h-12 neon-text" />
              <p className="text-white/40 animate-pulse font-mono tracking-widest text-xs">ENCRYPTED DATA LOADING...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-8 pl-10 font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Visual</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Product Name</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Market Value</TableHead>
                  <TableHead className="font-black uppercase tracking-[0.2em] text-[10px] text-white/40 text-right pr-10">Operations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {looks?.map((look) => (
                  <TableRow key={look.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                    <TableCell className="py-6 pl-10">
                      <div className="relative w-16 h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:neon-border transition-all">
                        <img 
                          src={look.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt={look.name} 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white text-lg tracking-tight">{look.name}</span>
                        <div className="flex gap-2">
                          <span className="text-[10px] font-mono text-white/30 uppercase">ID: {look.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black neon-text">
                          {look.price}
                        </span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          {look.currency || 'USD'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <Link href={`/looks/${look.id}`}>
                          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <ExternalLink className="w-5 h-5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="text-white/40 hover:neon-text hover:bg-white/5 rounded-xl transition-all">
                          <Edit3 className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteLook(look.id)}
                          className="text-white/40 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!looks || looks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Box className="w-12 h-12 text-white/10" />
                        <p className="text-white/30 font-light text-lg">
                          Your catalog is currently empty. Initialize your first collection.
                        </p>
                        <Link href="/admin/looks/new">
                          <Button variant="outline" className="border-white/10 text-white rounded-xl hover:bg-white/5">
                            Create First Look
                          </Button>
                        </Link>
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
