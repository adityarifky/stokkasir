"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Boxes, AlertTriangle, Loader2 } from "lucide-react";
import type { Transaction, StockItem } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import { isToday, parseISO } from "date-fns";

export default function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        totalItems: 0,
        lowStockItems: 0,
        stockInToday: 0,
        stockOutToday: 0
    });
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);

            // Listener for items to calculate summary
            const itemsColRef = collection(db, `users/${user.uid}/items`);
            const itemsUnsubscribe = onSnapshot(itemsColRef, (snapshot) => {
                const itemsList = snapshot.docs.map(doc => doc.data() as StockItem);
                const totalItems = itemsList.length;
                const lowStockItems = itemsList.filter(item => item.quantity <= item.lowStockThreshold).length;
                
                setSummary(prev => ({ ...prev, totalItems, lowStockItems }));
            }, error => console.error("Error fetching items for dashboard:", error));

            // Listener for transactions
            const txsColRef = collection(db, `users/${user.uid}/transactions`);
            const txsQuery = query(txsColRef, orderBy("date", "desc"));
            const txsUnsubscribe = onSnapshot(txsQuery, (snapshot) => {
                const txsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                
                const stockInToday = txsList.filter(tx => tx.type === 'in' && isToday(parseISO(tx.date))).reduce((acc, tx) => acc + tx.quantity, 0);
                const stockOutToday = txsList.filter(tx => tx.type === 'out' && isToday(parseISO(tx.date))).reduce((acc, tx) => acc + tx.quantity, 0);

                setSummary(prev => ({ ...prev, stockInToday, stockOutToday }));
                setRecentTransactions(txsList.slice(0, 5)); // Get last 5 transactions
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
            setRecentTransactions([]);
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

                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terkini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Barang</TableHead>
                                    <TableHead className="text-center">Jenis</TableHead>
                                    <TableHead>Staff</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : recentTransactions.length > 0 ? (
                                    recentTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                <div className="font-medium">{tx.itemName}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={tx.type === 'in' ? 'secondary' : 'destructive'}>
                                                    {tx.type === 'in' ? 'masuk' : 'keluar'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{tx.actor}</TableCell>
                                            <TableCell className="text-right font-medium">{tx.quantity.toLocaleString()} {tx.unit}</TableCell>
                                            <TableCell>{new Date(tx.date).toLocaleDateString('id-ID')}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Belum ada transaksi terkini.
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
