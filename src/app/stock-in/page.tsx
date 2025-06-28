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
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";


export default function StockInPage() {
    const [date, setDate] = React.useState<Date>();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Berhasil!",
                description: "Stok telah berhasil ditambahkan.",
            });
            setIsLoading(false);
        }, 1500);
    }

    return (
        <AppLayout pageTitle="Stok Masuk">
            <div className="flex justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Catat Stok Masuk</CardTitle>
                            <CardDescription>Tambahkan barang baru ke inventaris Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="item">Barang</Label>
                                <Select>
                                    <SelectTrigger id="item">
                                        <SelectValue placeholder="Pilih barang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sku-001">Gold Bar 1oz (SKU-001)</SelectItem>
                                        <SelectItem value="sku-002">Gold Coin (SKU-002)</SelectItem>
                                        <SelectItem value="sku-003">Silver Bar 1kg (SKU-003)</SelectItem>
                                        <SelectItem value="sku-004">Platinum Coin (SKU-004)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Jumlah</Label>
                                <Input id="quantity" type="number" placeholder="cth., 100" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Pemasok</Label>
                                <Input id="supplier" placeholder="cth., Refinery Inc." />
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
                                Tambahkan ke Stok
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
