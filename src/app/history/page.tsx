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


const allTransactions: Transaction[] = [
    { id: "1", date: "2023-10-27T10:00:00Z", item: "SKU-001", itemName: "Gold Bar 1oz", type: "in", quantity: 50, actor: "Refinery Inc." },
    { id: "2", date: "2023-10-27T09:30:00Z", item: "SKU-002", itemName: "Gold Coin", type: "out", quantity: 100, actor: "Client #123" },
    { id: "3", date: "2023-10-26T15:00:00Z", item: "SKU-003", itemName: "Silver Bar 1kg", type: "in", quantity: 20, actor: "Silver Supplies" },
    { id: "4", date: "2023-10-26T11:00:00Z", item: "SKU-001", itemName: "Gold Bar 1oz", type: "out", quantity: 10, actor: "Client #124" },
    { id: "5", date: "2023-10-25T14:20:00Z", item: "SKU-004", itemName: "Platinum Coin", type: "in", quantity: 200, actor: "Platinum World" },
    { id: "6", date: "2023-10-25T13:00:00Z", item: "SKU-002", itemName: "Gold Coin", type: "in", quantity: 500, actor: "Mint Corp." },
    { id: "7", date: "2023-10-24T18:00:00Z", item: "SKU-002", itemName: "Gold Coin", type: "out", quantity: 250, actor: "Client #125" },
    { id: "8", date: "2023-10-24T10:00:00Z", item: "SKU-003", itemName: "Silver Bar 1kg", type: "out", quantity: 5, actor: "Client #126" },
];

function HistoryTable({ transactions }: { transactions: Transaction[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Supplier/Destination</TableHead>
                    <TableHead>Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                        <TableCell>
                            <div className="font-medium">{tx.itemName}</div>
                            <div className="text-sm text-muted-foreground">{tx.item}</div>
                        </TableCell>
                        <TableCell className="text-center">
                            <Badge variant={tx.type === 'in' ? 'secondary' : 'outline'} className={tx.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}>
                                {tx.type === 'in' ? 'Stock In' : 'Stock Out'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{tx.quantity}</TableCell>
                        <TableCell>{tx.actor}</TableCell>
                        <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
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
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="stock-in">Stock In</TabsTrigger>
                        <TabsTrigger value="stock-out">Stock Out</TabsTrigger>
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
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                            Date
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Item Name</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                         <Input
                            placeholder="Search transactions..."
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
