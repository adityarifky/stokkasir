"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockItem } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Image from 'next/image';
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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

    return (
        <AppLayout pageTitle="Stok Saat Ini">
            <Card>
                <CardHeader>
                    <CardTitle>Tingkat Stok Saat Ini</CardTitle>
                    <CardDescription>Gambaran real-time inventaris Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="text-center text-muted-foreground py-12">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                <p className="mt-2">Memuat data stok...</p>
                            </div>
                        ) : stockItems.length > 0 ? (
                            stockItems.map((item) => {
                                const stockPercentage = Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100);
                                const isLowStock = item.quantity <= item.lowStockThreshold;

                                return (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <Image 
                                            src={`https://placehold.co/64x64/EEE8AA/333333?text=${item.name.charAt(0)}`} 
                                            alt={item.name}
                                            width={64}
                                            height={64}
                                            className="rounded-md border-2 border-primary/20"
                                            data-ai-hint="gambar produk"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <p className="font-semibold">{item.name} <span className="text-sm text-muted-foreground font-normal">({item.sku})</span></p>
                                                <p className={`font-bold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>{item.quantity.toLocaleString()}</p>
                                            </div>
                                            <Progress value={stockPercentage} className={`h-2 mt-1 ${isLowStock ? '[&>div]:bg-destructive' : ''}`} />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ambang batas stok rendah: {item.lowStockThreshold}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                <p>Belum ada stok barang.</p>
                                <p className="text-sm">Tambahkan barang melalui menu 'Daftar Barang' atau 'Stok Masuk'.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
