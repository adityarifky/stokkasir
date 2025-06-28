"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockItem } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2, Boxes, AlertTriangle, CheckCircle, Edit, PlusCircle } from "lucide-react";

export default function CurrentStockPage() {
    const { user } = useAuth();
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                console.error("Gagal mengambil data stok:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setStockItems([]);
            setIsLoading(false);
        }
    }, [user]);

    const getStatusBadge = (item: StockItem) => {
        const isLowStock = item.quantity <= item.lowStockThreshold;
        if (isLowStock) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Stok Menipis
                </Badge>
            );
        }
        return (
             <Badge variant="outline" className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1.5 w-fit hover:bg-green-200/50">
                 <CheckCircle className="h-3.5 w-3.5" />
                Aman
            </Badge>
        );
    };

    return (
        <AppLayout pageTitle="Stok Saat Ini">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold">Stok Bahan Baku Saat Ini</h1>
                    <p className="text-muted-foreground">Pantau tingkat persediaan semua bahan baku.</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Boxes className="h-6 w-6 text-primary"/>
                            <div>
                                <CardTitle className="text-xl">Daftar Persediaan</CardTitle>
                                <CardDescription>Total {stockItems.length} jenis bahan baku terdaftar.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 pt-0">
                        <div className="grid grid-cols-5 gap-4 px-6 py-3 font-medium text-muted-foreground border-b bg-muted/50">
                            <div className="col-span-1">Nama Bahan</div>
                            <div className="col-span-1">Stok Saat Ini</div>
                            <div className="col-span-1">Batas Minimum</div>
                            <div className="col-span-1">Catatan Urgent</div>
                            <div className="col-span-1">Status</div>
                        </div>
                        <div className="divide-y divide-border">
                             {isLoading ? (
                                <div className="text-center text-muted-foreground py-24">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                    <p className="mt-2">Memuat data stok...</p>
                                </div>
                            ) : stockItems.length > 0 ? (
                                stockItems.map((item) => {
                                    const isLowStock = item.quantity <= item.lowStockThreshold;
                                    const stockPercentage = item.lowStockThreshold > 0 ? Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100) : 100;

                                    return (
                                        <div key={item.id} className="grid grid-cols-5 gap-4 items-center px-6 py-4">
                                            <div className="font-medium">{item.name}</div>
                                            <div>
                                                <p className={`font-bold text-lg ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                                                    {item.quantity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                                                </p>
                                                <Progress value={stockPercentage} className={`h-1.5 mt-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`} />
                                            </div>
                                            <div>{item.lowStockThreshold.toLocaleString()} {item.unit}</div>
                                            <div>
                                                {item.urgentNote ? (
                                                    <div>
                                                        <p className="text-sm text-amber-600 font-semibold">{item.urgentNote}</p>
                                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Edit Catatan
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground italic">Belum ada catatan</p>
                                                         <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                                            <PlusCircle className="h-3 w-3 mr-1" />
                                                            Tambah Catatan
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                {getStatusBadge(item)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center text-muted-foreground py-24">
                                    <p className="font-semibold">Belum ada stok barang.</p>
                                    <p className="text-sm">Tambahkan barang melalui menu 'Daftar Barang' untuk memulai.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
