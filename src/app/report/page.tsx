"use client"

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Boxes, AlertTriangle, CheckCircle } from "lucide-react";
import type { StockItem } from "@/lib/types";

export default function ReportPage() {
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        try {
            const savedItems = localStorage.getItem('stockItems');
            if (savedItems) {
                setStockItems(JSON.parse(savedItems));
            }
        } catch (error) {
            console.error("Gagal memuat barang dari localStorage", error);
        }

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
            <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-primary-foreground w-fit">
                 <CheckCircle className="h-3.5 w-3.5" />
                Aman
            </Badge>
        );
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
                           <Button variant="outline">
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
                                {stockItems.length > 0 ? (
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
