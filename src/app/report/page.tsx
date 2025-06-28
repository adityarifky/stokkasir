"use client"

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Boxes, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { StockItem } from "@/lib/types";
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ReportPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState('');

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

    const handleExport = () => {
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
        link.setAttribute("download", `laporan-stok-${today}.csv`);
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

    return (
        <AppLayout pageTitle="Laporan Stok">
            <div className="space-y-4">
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
                           <Button variant="outline" onClick={handleExport}>
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
            </div>
        </AppLayout>
    );
}
