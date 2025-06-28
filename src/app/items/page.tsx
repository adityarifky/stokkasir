"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StockItem } from "@/lib/types";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


export default function ItemsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [unit, setUnit] = useState<'Kg' | 'Gram' | 'ML' | 'L' | 'Pack' | 'Pcs' | ''>('');
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
            // No user, clear items and set loading to false
            setStockItems([]);
            setIsLoading(false);
        }
    }, [user, toast]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit || !lowStockThreshold) {
            toast({
                variant: "destructive",
                title: "Formulir tidak lengkap",
                description: "Silakan isi semua kolom yang wajib diisi.",
            });
            return;
        }
        if (!user) {
             toast({
                variant: "destructive",
                title: "Akses ditolak",
                description: "Anda harus masuk untuk menambahkan barang.",
            });
            return;
        }
        
        setIsSubmitting(true);

        try {
            const itemsColRef = collection(db, `users/${user.uid}/items`);
            await addDoc(itemsColRef, {
                name,
                unit,
                lowStockThreshold: parseInt(lowStockThreshold, 10),
                quantity: 0,
                sku: `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            });

            toast({
                title: "Berhasil!",
                description: "Barang baru telah berhasil ditambahkan.",
            });

            // Reset form and close dialog
            setName('');
            setUnit('');
            setLowStockThreshold('');
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Gagal menambah barang:", error);
            toast({
                variant: "destructive",
                title: "Gagal menyimpan",
                description: "Terjadi kesalahan saat menyimpan barang baru.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout pageTitle="Daftar Barang">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Barang</CardTitle>
                            <CardDescription>Kelola produk dan detailnya.</CardDescription>
                        </div>
                         <Button size="sm" className="gap-1" onClick={() => setIsDialogOpen(true)}>
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem>Ubah</DropdownMenuItem>
                                                        <DropdownMenuItem>Hapus</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Barang Baru</DialogTitle>
                        <DialogDescription>
                            Isi detail barang baru di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddItem}>
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
                                        <SelectItem value="Kg">Kg</SelectItem>
                                        <SelectItem value="Gram">Gram</SelectItem>
                                        <SelectItem value="ML">ML</SelectItem>
                                        <SelectItem value="L">L</SelectItem>
                                        <SelectItem value="Pack">Pack</SelectItem>
                                        <SelectItem value="Pcs">Pcs</SelectItem>
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
                                Simpan Barang
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
