import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";


const allTransactions: Transaction[] = [];

function HistoryTable({ transactions }: { transactions: Transaction[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Barang</TableHead>
                    <TableHead className="text-center">Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Pemasok/Tujuan</TableHead>
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
                                <Badge variant={tx.type === 'in' ? 'secondary' : 'outline'} className={tx.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}>
                                    {tx.type === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{tx.quantity}</TableCell>
                            <TableCell>{tx.actor}</TableCell>
                            <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Tidak ada transaksi untuk ditampilkan.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default function HistoryPage() {
    const stockInTxs = allTransactions.filter(tx => tx.type === 'in');
    const stockOutTxs = allTransactions.filter(tx => tx.type === 'out');
    
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
                            <HistoryTable transactions={allTransactions} />
                        </TabsContent>
                        <TabsContent value="stock-in">
                            <HistoryTable transactions={stockInTxs} />
                        </TabsContent>
                        <TabsContent value="stock-out">
                            <HistoryTable transactions={stockOutTxs} />
                        </TabsContent>
                    </CardContent>
                </Card>
            </Tabs>
        </AppLayout>
    );
}
