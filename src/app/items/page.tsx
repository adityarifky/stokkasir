import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StockItem } from "@/lib/types";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";

const stockItems: StockItem[] = [
    { id: "1", name: "Gold Bar 1oz", sku: "SKU-001", category: "Gold", quantity: 840, lowStockThreshold: 100 },
    { id: "2", name: "Gold Coin", sku: "SKU-002", category: "Gold", quantity: 150, lowStockThreshold: 200 },
    { id: "3", name: "Silver Bar 1kg", sku: "SKU-003", category: "Silver", quantity: 15, lowStockThreshold: 20 },
    { id: "4", name: "Platinum Coin", sku: "SKU-004", category: "Platinum", quantity: 1200, lowStockThreshold: 150 },
    { id: "5", name: "Silver Coin", sku: "SKU-005", category: "Silver", quantity: 300, lowStockThreshold: 50 },
];

export default function ItemsPage() {
    return (
        <AppLayout pageTitle="Daftar Barang">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Stock Items</CardTitle>
                        <CardDescription>Manage your products and their details.</CardDescription>
                    </div>
                     <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                         <Image 
                                            src={`https://placehold.co/64x64/EEE8AA/333333?text=${item.name.charAt(0)}`} 
                                            alt={item.name}
                                            width={48}
                                            height={48}
                                            className="rounded-md"
                                            data-ai-hint="product image"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.sku}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
