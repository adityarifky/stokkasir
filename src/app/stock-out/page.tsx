"use client";

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, History } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { StockItem } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function StockOutPage() {
    const [date, setDate] = React.useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const router = useRouter();

    useEffect(() => {
        try {
            const savedItems = localStorage.getItem('stockItems');
            if (savedItems) {
                setStockItems(JSON.parse(savedItems));
            }
        } catch (error) {
            console.error("Gagal memuat barang dari localStorage", error);
            toast({
                variant: "destructive",
                title: "Gagal memuat data barang",
                description: "Tidak dapat mengambil daftar barang. Coba segarkan halaman.",
            });
        }
    }, [toast]);
    
    const handleItemSelect = (itemId: string) => {
        const item = stockItems.find(i => i.id === itemId) || null;
        setSelectedItem(item);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Berhasil!",
                description: "Stok keluar telah berhasil dicatat.",
            });
            setIsLoading(false);
        }, 1500);
    }

    return (
        <AppLayout pageTitle="Stok Keluar">
             <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Stok Keluar</h1>
                    <p className="text-muted-foreground">Catat dengan detail dan teliti ya bro.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/history')}>
                    <History className="mr-2 h-4 w-4" />
                    Lihat Riwayat Stok Keluar
                </Button>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah Bahan Baku Keluar</CardTitle>
                        <CardDescription>Isi detail bahan baku yang dikeluarkan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="item">Bahan Baku <span className="text-destructive">*</span></Label>
                                <Select onValueChange={handleItemSelect} value={selectedItem?.id || ""} disabled={stockItems.length === 0}>
                                    <SelectTrigger id="item">
                                        <SelectValue placeholder="Pilih bahan baku..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                    {stockItems.length > 0 ? (
                                            stockItems.map(item => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.sku})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-items" disabled>
                                                Tambahkan barang di menu 'Daftar Barang'
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Tujuan <span className="text-destructive">*</span></Label>
                                <Input id="destination" placeholder="cth., Klien #123" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Jumlah <span className="text-destructive">*</span></Label>
                                <Input id="quantity" type="number" placeholder="cth., 50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Satuan <span className="text-destructive">*</span></Label>
                                <Input id="unit" value={selectedItem?.unit || ''} placeholder="Pilih satuan..." disabled />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="date">Tanggal <span className="text-destructive">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full md:w-[280px] justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Textarea id="notes" placeholder="Tambahkan catatan jika perlu..."/>
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
