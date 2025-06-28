import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Boxes, AlertTriangle } from "lucide-react";
import type { Transaction } from "@/lib/types";

const summaryCards = [
    { title: "Total Barang", value: "0", icon: Boxes, trend: "" },
    { title: "Barang Stok Rendah", value: "0", icon: AlertTriangle, trend: "" },
    { title: "Stok Masuk (Hari Ini)", value: "0", icon: ArrowDownLeft },
    { title: "Stok Keluar (Hari Ini)", value: "0", icon: ArrowUpRight },
];

const recentTransactions: Transaction[] = [];

export default function DashboardPage() {
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
                                <div className="text-2xl font-bold">{card.value}</div>
                                {card.trend && <p className="text-xs text-muted-foreground">{card.trend}</p>}
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
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Pemasok/Tujuan</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell>
                                                <div className="font-medium">{tx.itemName}</div>
                                                <div className="text-sm text-muted-foreground">{tx.item}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={tx.type === 'in' ? 'secondary' : 'outline'} className={tx.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {tx.type === 'in' ? 'masuk' : 'keluar'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{tx.quantity}</TableCell>
                                            <TableCell>{tx.actor}</TableCell>
                                            <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
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
