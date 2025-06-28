import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StockItem } from "@/lib/types";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";

const stockItems: StockItem[] = [];

export default function ItemsPage() {
    return (
        <AppLayout pageTitle="Daftar Barang">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Barang</CardTitle>
                        <CardDescription>Kelola produk dan detailnya.</CardDescription>
                    </div>
                     <Button size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Tambah Barang
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Gambar</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                                <TableHead>
                                    <span className="sr-only">Aksi</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockItems.length > 0 ? (
                                stockItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                             <Image 
                                                src={`https://placehold.co/64x64/EEE8AA/333333?text=${item.name.charAt(0)}`} 
                                                alt={item.name}
                                                width={48}
                                                height={48}
                                                className="rounded-md"
                                                data-ai-hint="gambar produk"
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
                                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                    <DropdownMenuItem>Ubah</DropdownMenuItem>
                                                    <DropdownMenuItem>Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Belum ada barang. Silakan tambahkan barang baru.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
