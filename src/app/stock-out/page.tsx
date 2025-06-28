"use client";

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { StockItem } from "@/lib/types";

export default function StockOutPage() {
    const [date, setDate] = React.useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [selectedItem, setSelectedItem] = useState("");

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
            <div className="flex justify-center">
                 <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catat Stok Keluar</CardTitle>
                            <CardDescription>Catat barang yang keluar dari inventaris Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="item">Barang</Label>
                                <Select onValueChange={setSelectedItem} value={selectedItem} disabled={stockItems.length === 0}>
                                    <SelectTrigger id="item">
                                        <SelectValue placeholder="Pilih barang" />
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
                                <Label htmlFor="quantity">Jumlah</Label>
                                <Input id="quantity" type="number" placeholder="cth., 50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Tujuan</Label>
                                <Input id="destination" placeholder="cth., Klien #123" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Tanggal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
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
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Catat Stok Keluar
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
