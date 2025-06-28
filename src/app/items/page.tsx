"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StockItem } from "@/lib/types";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


export default function ItemsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [unit, setUnit] = useState<'Pack' | 'Pcs' | 'Roll' | 'Box' | ''>('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const itemsColRef = collection(db, `users/${user.uid}/items`);
            const q = query(itemsColRef, orderBy("name", "asc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const itemsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as StockItem));
                setStockItems(itemsList);
                setIsLoading(false);
            }, (error) => {
                console.error("Gagal mengambil data barang:", error);
                toast({
                    variant: "destructive",
                    title: "Gagal mengambil data",
                    description: "Terjadi kesalahan saat mengambil daftar barang.",
                });
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setStockItems([]);
            setIsLoading(false);
        }
    }, [user, toast]);

    const resetForm = () => {
        setName('');
        setUnit('');
        setLowStockThreshold('');
        setEditingItem(null);
    }

    const openAddDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (item: StockItem) => {
        setEditingItem(item);
        setName(item.name);
        setUnit(item.unit);
        setLowStockThreshold(String(item.lowStockThreshold));
        setIsDialogOpen(true);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit || !lowStockThreshold) {
            toast({ variant: "destructive", title: "Formulir tidak lengkap", description: "Silakan isi semua kolom." });
            return;
        }
        if (!user) {
             toast({ variant: "destructive", title: "Akses ditolak", description: "Anda harus masuk untuk melakukan aksi ini." });
            return;
        }
        
        setIsSubmitting(true);
        const itemData = {
            name,
            unit,
            lowStockThreshold: parseInt(lowStockThreshold, 10),
        };

        try {
            if (editingItem) {
                // Update existing item
                const itemRef = doc(db, `users/${user.uid}/items`, editingItem.id);
                await updateDoc(itemRef, itemData);
                toast({ title: "Berhasil!", description: "Barang telah berhasil diperbarui." });
            } else {
                // Add new item
                const itemsColRef = collection(db, `users/${user.uid}/items`);
                await addDoc(itemsColRef, {
                    ...itemData,
                    quantity: 0,
                    sku: `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
                });
                toast({ title: "Berhasil!", description: "Barang baru telah berhasil ditambahkan." });
            }
            resetForm();
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Gagal menyimpan barang:", error);
            toast({ variant: "destructive", title: "Gagal menyimpan", description: "Terjadi kesalahan saat menyimpan barang." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteItem = async (itemId: string) => {
        if (!user) return;
        try {
            const itemRef = doc(db, `users/${user.uid}/items`, itemId);
            await deleteDoc(itemRef);
            toast({ title: "Berhasil!", description: "Barang telah dihapus." });
        } catch (error) {
            console.error("Gagal menghapus barang:", error);
            toast({ variant: "destructive", title: "Gagal menghapus", description: "Tidak dapat menghapus barang." });
        }
    };

    return (
        <AppLayout pageTitle="Daftar Barang">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Daftar Barang</CardTitle>
                        <CardDescription>Kelola produk dan detailnya.</CardDescription>
                    </div>
                     <Button size="sm" className="gap-1 w-full sm:w-auto" onClick={openAddDialog}>
                        <PlusCircle className="h-4 w-4" />
                        Tambah Barang
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead className="text-right">Stok Minimal</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                                <TableHead>
                                    <span className="sr-only">Aksi</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                 <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : stockItems.length > 0 ? (
                                stockItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell className="text-right">{item.lowStockThreshold.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => openEditDialog(item)}>Ubah</DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">Hapus</DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus barang secara permanen.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Ya, Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Belum ada barang. Silakan tambahkan barang baru.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Ubah Barang' : 'Tambah Barang Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Ubah detail barang di bawah ini.' : 'Isi detail barang baru di bawah ini.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nama Barang
                                </Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="Nama produk" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="unit" className="text-right">
                                    Satuan
                                </Label>
                                <Select onValueChange={(value) => setUnit(value as any)} value={unit}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Pilih satuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pack">Pack</SelectItem>
                                        <SelectItem value="Pcs">Pcs</SelectItem>
                                        <SelectItem value="Roll">Roll</SelectItem>
                                        <SelectItem value="Box">Box</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lowStockThreshold" className="text-right">
                                    Minimal Stok
                                </Label>
                                <Input id="lowStockThreshold" type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} className="col-span-3" placeholder="Contoh: 10" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingItem ? 'Simpan Perubahan' : 'Simpan Barang'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
