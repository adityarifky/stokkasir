"use client"

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Boxes, AlertTriangle, CheckCircle, Loader2, BarChart3, Calendar as CalendarIcon } from "lucide-react";
import type { StockItem, Transaction } from "@/lib/types";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth } from 'date-fns';
import { id as a_id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type AccumulationItem = {
    name: string;
    totalIn: number;
    totalOut: number;
    netChange: number;
    unit: StockItem['unit'];
};

export default function ReportPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    // State for Detailed Stock Report
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState('');

    // State for Accumulated Stock Report
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });
    const [accumulationData, setAccumulationData] = useState<AccumulationItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReportRange, setGeneratedReportRange] = useState<DateRange | undefined>(undefined);

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
                console.error("Gagal mengambil data laporan:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setStockItems([]);
            setIsLoading(false);
        }

    }, [user]);

    useEffect(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString('id-ID', options));
    }, []);

    const getStatus = (item: StockItem) => {
        if (item.quantity <= item.lowStockThreshold) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Menipis
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                 <CheckCircle className="h-3.5 w-3.5" />
                Aman
            </Badge>
        );
    };

    const handleDetailExport = () => {
        if (stockItems.length === 0) {
            toast({
                variant: "destructive",
                title: "Tidak ada data",
                description: "Tidak ada data stok untuk diekspor.",
            });
            return;
        }

        const csvHeader = "No.,Nama Bahan,Stok Saat Ini,Satuan,Min. Stok,Status\n";
        
        const csvRows = stockItems.map((item, index) => {
            const status = item.quantity <= item.lowStockThreshold ? 'Menipis' : 'Aman';
            const name = `"${item.name.replace(/"/g, '""')}"`;
            return [
                index + 1,
                name,
                item.quantity,
                item.unit,
                item.lowStockThreshold,
                status
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        const url = URL.createObjectURL(blob);
        const today = new Date().toISOString().slice(0, 10);
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-stok-rincian-${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Berhasil!",
            description: "Laporan stok telah diekspor."
        });
    };
    
    const handleGenerateAccumulationReport = async () => {
        if (!user || !dateRange?.from || !dateRange?.to) {
            toast({ variant: 'destructive', title: 'Gagal', description: 'Silakan pilih rentang tanggal terlebih dahulu.' });
            return;
        }

        setIsGenerating(true);
        setAccumulationData([]);

        try {
            // Set end of day for the 'to' date to make it inclusive
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59, 999);

            const txsColRef = collection(db, `users/${user.uid}/transactions`);
            const q = query(txsColRef, where("date", ">=", dateRange.from.toISOString()), where("date", "<=", toDate.toISOString()));
            const querySnapshot = await getDocs(q);
            const transactions = querySnapshot.docs.map(doc => doc.data() as Transaction);

            const accumulationMap = new Map<string, Omit<AccumulationItem, 'name' | 'unit'>>();

            stockItems.forEach(item => {
                accumulationMap.set(item.name, { totalIn: 0, totalOut: 0, netChange: 0 });
            });

            transactions.forEach(tx => {
                const item = accumulationMap.get(tx.itemName);
                if (item) {
                    if (tx.type === 'in') {
                        item.totalIn += tx.quantity;
                    } else {
                        item.totalOut += tx.quantity;
                    }
                }
            });
            
            const processedData: AccumulationItem[] = [];
            accumulationMap.forEach((value, key) => {
                const stockItem = stockItems.find(si => si.name === key);
                if (stockItem) {
                     processedData.push({
                        name: key,
                        totalIn: value.totalIn,
                        totalOut: value.totalOut,
                        netChange: value.totalIn - value.totalOut,
                        unit: stockItem.unit,
                    });
                }
            });

            processedData.sort((a, b) => a.name.localeCompare(b.name));

            setAccumulationData(processedData);
            setGeneratedReportRange(dateRange);

        } catch (error) {
            console.error("Gagal membuat laporan akumulasi:", error);
            toast({ variant: 'destructive', title: 'Gagal', description: 'Terjadi kesalahan saat memproses data.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAccumulationExport = () => {
        if (accumulationData.length === 0) {
            toast({
                variant: "destructive",
                title: "Tidak ada data",
                description: "Silakan generate laporan terlebih dahulu untuk mengekspor.",
            });
            return;
        }

        const csvHeader = "Nama Bahan,Total Masuk,Total Keluar,Perubahan Netto,Satuan\n";
        
        const csvRows = accumulationData.map(item => {
            const name = `"${item.name.replace(/"/g, '""')}"`;
            return [
                name,
                item.totalIn,
                item.totalOut,
                item.netChange,
                item.unit
            ].join(',');
        }).join('\n');

        const csvContent = csvHeader + csvRows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        const url = URL.createObjectURL(blob);
        const fromDate = generatedReportRange?.from ? format(generatedReportRange.from, 'yyyy-MM-dd') : '';
        const toDate = generatedReportRange?.to ? format(generatedReportRange.to, 'yyyy-MM-dd') : '';
        link.setAttribute("href", url);
        link.setAttribute("download", `laporan-akumulasi-${fromDate}-to-${toDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
            title: "Berhasil!",
            description: "Laporan akumulasi stok telah diekspor."
        });
    };
    
    const formatDateRange = (range: DateRange | undefined) => {
        if (!range?.from) return "Pilih tanggal";
        if (!range.to) return format(range.from, "dd LLL, yyyy", { locale: a_id });
        return `${format(range.from, "dd LLL, yyyy", { locale: a_id })} - ${format(range.to, "dd LLL, yyyy", { locale: a_id })}`;
    };

    return (
        <AppLayout pageTitle="Laporan Stok">
            <div className="space-y-8">
                 <div>
                    <h1 className="text-3xl font-bold">Laporan Stok</h1>
                    <p className="text-muted-foreground">Per tanggal: {currentDate}</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-4">
                               <div className="text-primary">
                                   <Boxes className="h-8 w-8" />
                               </div>
                               <div>
                                   <CardTitle className="text-xl">Laporan Rincian Stok Saat Ini</CardTitle>
                                   <CardDescription>Menampilkan {stockItems.length} jenis bahan baku terdaftar.</CardDescription>
                               </div>
                           </div>
                           <Button variant="outline" onClick={handleDetailExport}>
                               <Download className="mr-2 h-4 w-4"/>
                               Export Rincian Stok
                           </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No.</TableHead>
                                    <TableHead>Nama Bahan</TableHead>
                                    <TableHead className="text-right">Stok Saat Ini</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead className="text-right">Min. Stok</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : stockItems.length > 0 ? (
                                    stockItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell className="text-right">{item.lowStockThreshold.toLocaleString()}</TableCell>
                                            <TableCell>
                                               {getStatus(item)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Tidak ada data untuk ditampilkan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="text-primary">
                                <BarChart3 className="h-8 w-8"/>
                            </div>
                            <div>
                                <CardTitle className="text-xl">Laporan Akumulasi Stok</CardTitle>
                                <CardDescription>
                                    {generatedReportRange?.from && generatedReportRange?.to 
                                        ? `Menampilkan akumulasi stok untuk periode ${formatDateRange(generatedReportRange)}.`
                                        : 'Pilih rentang tanggal untuk membuat laporan akumulasi stok.'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='border rounded-lg p-4 mb-6 flex items-center gap-4 flex-wrap'>
                            <div className='space-y-2'>
                                <Label htmlFor="date">Rentang Tanggal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[300px] justify-start text-left font-normal",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateRange(dateRange)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button onClick={handleGenerateAccumulationReport} disabled={isGenerating || !dateRange?.from} className="self-end">
                                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate
                            </Button>
                             <Button variant="outline" onClick={handleAccumulationExport} disabled={accumulationData.length === 0} className="self-end">
                               <Download className="mr-2 h-4 w-4"/>
                               Export
                           </Button>
                        </div>

                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Bahan</TableHead>
                                    <TableHead className="text-right">Total Masuk</TableHead>
                                    <TableHead className="text-right">Total Keluar</TableHead>
                                    <TableHead className="text-right">Perubahan Netto</TableHead>
                                    <TableHead>Satuan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isGenerating ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            <p className="mt-2">Membuat laporan...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : accumulationData.length > 0 ? (
                                    accumulationData.map((item) => (
                                        <TableRow key={item.name}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className={cn("text-right font-medium", item.totalIn > 0 && "text-green-600")}>
                                                {item.totalIn > 0 ? `+${item.totalIn.toLocaleString()}`: item.totalIn}
                                            </TableCell>
                                             <TableCell className={cn("text-right font-medium", item.totalOut > 0 && "text-destructive")}>
                                                {item.totalOut > 0 ? `-${item.totalOut.toLocaleString()}` : item.totalOut}
                                            </TableCell>
                                             <TableCell className={cn("text-right font-medium", item.netChange > 0 && "text-green-600", item.netChange < 0 && "text-destructive")}>
                                                {item.netChange.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            {generatedReportRange ? 'Tidak ada transaksi pada periode yang dipilih.' : 'Silakan generate laporan untuk melihat data.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
