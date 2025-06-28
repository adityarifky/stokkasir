import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Boxes, AlertTriangle, Package } from "lucide-react";
import type { Transaction } from "@/lib/types";

const summaryCards = [
    { title: "Total Barang", value: "1,250", icon: Boxes, trend: "+1.2%" },
    { title: "Barang Stok Rendah", value: "15", icon: AlertTriangle, trend: "+2", isWarning: true },
    { title: "Stok Masuk (Hari Ini)", value: "320", icon: ArrowDownLeft },
    { title: "Stok Keluar (Hari Ini)", value: "180", icon: ArrowUpRight },
];

const recentTransactions: Transaction[] = [
    { id: "1", date: "2023-10-27T10:00:00Z", item: "SKU-001", itemName: "Gold Bar 1oz", type: "in", quantity: 50, actor: "Refinery Inc." },
    { id: "2", date: "2023-10-27T09:30:00Z", item: "SKU-002", itemName: "Gold Coin", type: "out", quantity: 100, actor: "Client #123" },
    { id: "3", date: "2023-10-26T15:00:00Z", item: "SKU-003", itemName: "Silver Bar 1kg", type: "in", quantity: 20, actor: "Silver Supplies" },
    { id: "4", date: "2023-10-26T11:00:00Z", item: "SKU-001", itemName: "Gold Bar 1oz", type: "out", quantity: 10, actor: "Client #124" },
    { id: "5", date: "2023-10-25T14:20:00Z", item: "SKU-004", itemName: "Platinum Coin", type: "in", quantity: 200, actor: "Platinum World" },
];

export default function DashboardPage() {
    return (
        <AppLayout pageTitle="Dashboard">
            <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <card.icon className={`h-4 w-4 ${card.isWarning ? 'text-destructive' : 'text-muted-foreground'}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                {card.trend && <p className="text-xs text-muted-foreground">{card.trend} dari bulan lalu</p>}
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
                                {recentTransactions.map((tx) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
