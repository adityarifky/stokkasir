"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Boxes, AlertTriangle, Loader2 } from "lucide-react";
import type { Transaction, StockItem } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { isToday, parseISO } from "date-fns";

type MostUsedItem = {
    name: string;
    unit: StockItem['unit'];
    count: number;
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        totalItems: 0,
        lowStockItems: 0,
        stockInToday: 0,
        stockOutToday: 0
    });
    const [lowStockItemsList, setLowStockItemsList] = useState<StockItem[]>([]);
    const [mostUsedItems, setMostUsedItems] = useState<MostUsedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);

            // Listener for items to calculate summary and low stock list
            const itemsColRef = collection(db, `users/${user.uid}/items`);
            const itemsQuery = query(itemsColRef, orderBy("name", "asc"));
            const itemsUnsubscribe = onSnapshot(itemsQuery, (snapshot) => {
                const itemsList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as StockItem));
                const totalItems = itemsList.length;
                const lowStockItemsData = itemsList.filter(item => item.quantity <= item.lowStockThreshold);
                
                setSummary(prev => ({ ...prev, totalItems, lowStockItems: lowStockItemsData.length }));
                setLowStockItemsList(lowStockItemsData);
            }, error => console.error("Error fetching items for dashboard:", error));

            // Listener for transactions
            const txsColRef = collection(db, `users/${user.uid}/transactions`);
            const txsQuery = query(txsColRef, orderBy("date", "desc"));
            const txsUnsubscribe = onSnapshot(txsQuery, (snapshot) => {
                const txsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                
                const stockInToday = txsList.filter(tx => tx.type === 'in' && isToday(parseISO(tx.date))).reduce((acc, tx) => acc + tx.quantity, 0);
                const stockOutToday = txsList.filter(tx => tx.type === 'out' && isToday(parseISO(tx.date))).reduce((acc, tx) => acc + tx.quantity, 0);

                setSummary(prev => ({ ...prev, stockInToday, stockOutToday }));
                
                // Calculate most used items
                const stockOutTxs = txsList.filter(tx => tx.type === 'out');
                const usageCounts = stockOutTxs.reduce((acc, tx) => {
                    const key = tx.itemName;
                    if (!acc[key]) {
                        acc[key] = { name: tx.itemName, unit: tx.unit, count: 0 };
                    }
                    acc[key].count += 1; // Count frequency of transactions
                    return acc;
                }, {} as { [key: string]: MostUsedItem });

                const sortedMostUsed = Object.values(usageCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5); // Get top 5

                setMostUsedItems(sortedMostUsed);
                setIsLoading(false);
            }, error => {
                console.error("Error fetching transactions for dashboard:", error);
                setIsLoading(false);
            });


            return () => {
                itemsUnsubscribe();
                txsUnsubscribe();
            };
        } else {
            setIsLoading(false);
            setSummary({ totalItems: 0, lowStockItems: 0, stockInToday: 0, stockOutToday: 0 });
            setLowStockItemsList([]);
            setMostUsedItems([]);
        }
    }, [user]);

    const summaryCards = useMemo(() => [
        { title: "Total Barang", value: summary.totalItems.toLocaleString(), icon: Boxes },
        { title: "Barang Stok Rendah", value: summary.lowStockItems.toLocaleString(), icon: AlertTriangle },
        { title: "Stok Masuk (Hari Ini)", value: summary.stockInToday.toLocaleString(), icon: ArrowDownLeft },
        { title: "Stok Keluar (Hari Ini)", value: summary.stockOutToday.toLocaleString(), icon: ArrowUpRight },
    ], [summary]);

    return (
        <AppLayout pageTitle="Dashboard">
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <card.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <div className="text-2xl font-bold">{card.value}</div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stok Barang Menipis</CardTitle>
                            <CardDescription>Barang yang perlu segera di order lagi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead className="text-right">Stok Saat Ini</TableHead>
                                        <TableHead className="text-right">Batas Minimum</TableHead>
                                        <TableHead>Catatan</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : lowStockItemsList.length > 0 ? (
                                        lowStockItemsList.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-destructive">
                                                    {item.quantity.toLocaleString()} {item.unit}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.lowStockThreshold.toLocaleString()} {item.unit}
                                                </TableCell>
                                                <TableCell className="text-primary font-semibold">{item.urgentNote || '-'}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={'destructive'}>
                                                        Menipis
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Semua stok barang dalam kondisi aman.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Penggunaan Barang Terbanyak</CardTitle>
                            <CardDescription>Barang yang paling sering dikeluarkan dari stok.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead className="text-right">Frekuensi Pengambilan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : mostUsedItems.length > 0 ? (
                                        mostUsedItems.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell>
                                                    <div className="font-medium">{item.name}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {item.count.toLocaleString()} kali
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                               Belum ada data penggunaan barang.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
