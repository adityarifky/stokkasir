"use client";

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, History, Check, ChevronsUpDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { StockItem, Transaction } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, runTransaction } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function StockOutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [quantity, setQuantity] = useState('');
    const [actorName, setActorName] = useState('');
    const [notes, setNotes] = useState('');
    const [unit, setUnit] = useState<'Pack' | 'Pcs' | 'Roll' | 'Box' | ''>('');

    const [isLoading, setIsLoading] = useState(false);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isFetchingItems, setIsFetchingItems] = useState(true);
    const [open, setOpen] = useState(false)

    const selectedItem = stockItems.find(i => i.id === selectedItemId) || null;
    const staffNames = ["Tata", "Melin", "Hasna", "Fani", "Vincha", "Nisa"];

    useEffect(() => {
        if (selectedItem) {
            // Unit selection is now manual
        } else {
            setUnit('');
        }
    }, [selectedItem]);

    useEffect(() => {
        if (user) {
            const fetchItems = async () => {
                setIsFetchingItems(true);
                try {
                    const itemsColRef = collection(db, `users/${user.uid}/items`);
                    const q = query(itemsColRef);
                    const querySnapshot = await getDocs(q);
                    const itemsList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as StockItem));
                    setStockItems(itemsList);
                } catch (error) {
                    console.error("Gagal memuat data barang:", error);
                    toast({
                        variant: "destructive",
                        title: "Gagal memuat data barang",
                        description: "Tidak dapat mengambil daftar barang. Coba segarkan halaman.",
                    });
                } finally {
                    setIsFetchingItems(false);
                }
            };
            fetchItems();
        }
    }, [user, toast]);

    const resetForm = () => {
        setSelectedItemId('');
        setQuantity('');
        setActorName('');
        setNotes('');
        setUnit('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !selectedItem || !quantity || !actorName || !unit) {
            toast({ variant: "destructive", title: "Formulir tidak lengkap", description: "Mohon isi semua kolom yang wajib diisi." });
            return;
        }

        const quantityNum = parseInt(quantity, 10);
        
        if (selectedItem.quantity < quantityNum) {
            toast({ variant: "destructive", title: "Stok tidak mencukupi", description: `Stok saat ini hanya ${selectedItem.quantity}.` });
            return;
        }
        
        setIsLoading(true);

        try {
            const itemRef = doc(db, `users/${user.uid}/items`, selectedItem.id);
            const transactionsColRef = collection(db, `users/${user.uid}/transactions`);

            await runTransaction(db, async (transaction) => {
                const itemDoc = await transaction.get(itemRef);
                if (!itemDoc.exists()) {
                    throw "Barang tidak ditemukan!";
                }

                const currentQuantity = itemDoc.data().quantity;
                const newQuantity = currentQuantity - quantityNum;
                
                if (newQuantity < 0) {
                    throw "Stok tidak mencukupi untuk transaksi ini.";
                }
                
                transaction.update(itemRef, { quantity: newQuantity });

                const newTransaction: Omit<Transaction, 'id'> = {
                    item: selectedItem.id,
                    itemName: selectedItem.name,
                    type: 'out',
                    quantity: quantityNum,
                    unit: unit as StockItem['unit'],
                    actor: actorName,
                    date: new Date().toISOString(),
                    notes: notes,
                };
                
                transaction.set(doc(transactionsColRef), newTransaction);
            });
            
            toast({
                title: "Berhasil!",
                description: "Stok keluar telah berhasil dicatat.",
            });
            resetForm();

        } catch (error) {
            console.error("Error recording stock out: ", error);
            toast({
                variant: "destructive",
                title: "Gagal menyimpan",
                description: `Terjadi kesalahan: ${error}`,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AppLayout pageTitle="Stok Keluar">
             <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Stok Keluar</h1>
                    <p className="text-muted-foreground">Catat dengan detail dan teliti ya bro.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/history')} className="w-full sm:w-auto">
                    <History className="mr-2 h-4 w-4" />
                    Lihat Riwayat Stok Keluar
                </Button>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Barang Kasir Keluar</CardTitle>
                        <CardDescription>Isi detail barang kasir yang dikeluarkan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="item">Barang Kasir <span className="text-destructive">*</span></Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                        disabled={isFetchingItems || stockItems.length === 0}
                                        >
                                        {selectedItemId
                                            ? stockItems.find((item) => item.id === selectedItemId)?.name
                                            : isFetchingItems ? "Memuat barang..." : "Pilih barang kasir..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari barang kasir..." />
                                            <CommandList>
                                                <CommandEmpty>Barang tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                {stockItems.map((item) => (
                                                    <CommandItem
                                                    key={item.id}
                                                    value={item.id}
                                                    onSelect={(currentValue) => {
                                                        setSelectedItemId(currentValue === selectedItemId ? "" : currentValue)
                                                        setOpen(false)
                                                    }}
                                                    disabled={item.quantity === 0}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedItemId === item.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {item.name} (Stok: {item.quantity})
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="actor">Nama Staff Pengambil <span className="text-destructive">*</span></Label>
                                <Select onValueChange={setActorName} value={actorName}>
                                    <SelectTrigger id="actor">
                                        <SelectValue placeholder="Pilih nama staff..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffNames.map(name => (
                                            <SelectItem key={name} value={name}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Jumlah <span className="text-destructive">*</span></Label>
                                <Input id="quantity" type="number" placeholder="e.g., 10" value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Satuan <span className="text-destructive">*</span></Label>
                                <Select onValueChange={(value) => setUnit(value as any)} value={unit}>
                                    <SelectTrigger id="unit">
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
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Textarea id="notes" placeholder="Tambahkan catatan jika perlu..." value={notes} onChange={e => setNotes(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading}>
                           {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Catat Stok Keluar
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </AppLayout>
    );
}
