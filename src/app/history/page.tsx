"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useState, useEffect, useMemo } from "react";

function HistoryTable({ transactions, isLoading }: { transactions: Transaction[], isLoading: boolean }) {
    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-center">Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <TableRow key={tx.id}>
                            <TableCell>
                                <div className="font-medium">{tx.itemName}</div>
                                <div className="text-sm text-muted-foreground">{tx.item}</div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant={tx.type === 'in' ? 'secondary' : 'destructive'}>
                                    {tx.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{tx.quantity} {tx.unit}</TableCell>
                            <TableCell>{new Date(tx.date).toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Tidak ada transaksi untuk ditampilkan.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default function HistoryPage() {
    const { user } = useAuth();
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            const txsColRef = collection(db, `users/${user.uid}/transactions`);
            const q = query(txsColRef, orderBy("date", "desc"));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const txsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Transaction));
                setAllTransactions(txsList);
                setIsLoading(false);
            }, (error) => {
                console.error("Gagal mengambil riwayat transaksi:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            setAllTransactions([]);
            setIsLoading(false);
        }
    }, [user]);
    
    const stockInTxs = useMemo(() => allTransactions.filter(tx => tx.type === 'in'), [allTransactions]);
    const stockOutTxs = useMemo(() => allTransactions.filter(tx => tx.type === 'out'), [allTransactions]);
    
    return (
        <AppLayout pageTitle="Riwayat Transaksi">
             <Tabs defaultValue="all">
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="all">Semua</TabsTrigger>
                        <TabsTrigger value="stock-in">Stok Masuk</TabsTrigger>
                        <TabsTrigger value="stock-out">Stok Keluar</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Filter
                            </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter berdasarkan</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                            Tanggal
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Nama Barang</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                         <Input
                            placeholder="Cari transaksi..."
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                    </div>
                </div>
                <Card className="mt-4">
                    <CardContent className="pt-6">
                        <TabsContent value="all">
                            <HistoryTable transactions={allTransactions} isLoading={isLoading} />
                        </TabsContent>
                        <TabsContent value="stock-in">
                            <HistoryTable transactions={stockInTxs} isLoading={isLoading} />
                        </TabsContent>
                        <TabsContent value="stock-out">
                            <HistoryTable transactions={stockOutTxs} isLoading={isLoading} />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </AppLayout>
    );
}
