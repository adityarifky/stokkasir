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
import { MoreHorizontal, PlusCircle } from "lucide-react";

export default function ItemsPage() {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [name, setName] = useState('');
    const [unit, setUnit] = useState<'Pack' | 'Pcs' | 'Roll' | 'Box' | ''>('');
    const [lowStockThreshold, setLowStockThreshold] = useState('');

    useEffect(() => {
        try {
            const savedItems = localStorage.getItem('stockItems');
            if (savedItems) {
                setStockItems(JSON.parse(savedItems));
            }
        } catch (error) {
            console.error("Gagal memuat barang dari localStorage", error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('stockItems', JSON.stringify(stockItems));
    }, [stockItems]);

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit || !lowStockThreshold) {
            // A simple alert for validation, you might want to use toasts
            alert("Silakan isi semua kolom.");
            return;
        }

        const newItem: StockItem = {
            id: new Date().toISOString(),
            name,
            unit: unit as 'Pack' | 'Pcs' | 'Roll' | 'Box',
            lowStockThreshold: parseInt(lowStockThreshold, 10),
            quantity: 0, // New items start with 0 quantity
            sku: `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}` // Auto-generate SKU
        };

        setStockItems(prevItems => [...prevItems, newItem]);

        // Reset form and close dialog
        setName('');
        setUnit('');
        setLowStockThreshold('');
        setIsDialogOpen(false);
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
                                {stockItems.length > 0 ? (
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
                            <Button type="submit">Simpan Barang</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
