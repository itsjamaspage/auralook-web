
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
import { collection, doc } from 'firebase/firestore';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useLanguage } from '@/hooks/use-language';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const { t, dictionary } = useLanguage();
  const [lookToDelete, setLookToDelete] = useState<string | null>(null);

  const looksQuery = useMemoFirebase(() => collection(db, 'looks'), [db]);
  const { data: looks, isLoading: looksLoading } = useCollection(looksQuery);

  const confirmDelete = () => {
    if (!lookToDelete) return;
    
    const lookRef = doc(db, 'looks', lookToDelete);
    deleteDocumentNonBlocking(lookRef);
    
    toast({ 
      title: "Deletion Initiated", 
      description: "The item is being removed from the catalog." 
    });
    
    setLookToDelete(null);
  };

  const handleShare = async (look: any) => {
    const shareUrl = `${window.location.origin}/looks/${look.id}`;
    const shareData = {
      title: look.name || 'Auralook.uz Catalog',
      text: look.description || 'Check out this futuristic look on Auralook.uz',
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Catalog link saved to clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Share Failed",
        description: "Could not copy link to clipboard.",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-10 space-y-10 max-w-6xl">
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
                          {look.currency === 'UZS' ? `UZS ${look.price}` : `$${look.price}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          type="button"
                          onClick={() => handleShare(look)}
                          className="text-white/40 hover:neon-text hover:bg-white/5 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Link href={`/admin/looks/${look.id}/edit`}>
                          <Button variant="ghost" size="icon" type="button" className="text-white/40 hover:neon-text hover:bg-white/5 rounded-lg transition-all">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          type="button"
                          onClick={() => setLookToDelete(look.id)}
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

      <AlertDialog open={!!lookToDelete} onOpenChange={(open) => !open && setLookToDelete(null)}>
        <AlertDialogContent className="glass-dark border-white/10 rounded-[2rem] text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black neon-text uppercase italic tracking-tighter">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 font-medium">
              Are you sure you want to permanently remove this item from the catalog? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl px-6 h-12">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl px-8 h-12 font-bold border-none"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
