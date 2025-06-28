"use client";

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockItem } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Loader2, Boxes, AlertTriangle, CheckCircle, Edit, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CurrentStockPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [editingNoteItem, setEditingNoteItem] = useState<StockItem | null>(null);
    const [urgentNoteInput, setUrgentNoteInput] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);

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

    const openNoteDialog = (item: StockItem) => {
        setEditingNoteItem(item);
        setUrgentNoteInput(item.urgentNote || '');
        setIsNoteDialogOpen(true);
    };
    
    const handleSaveNote = async () => {
        if (!user || !editingNoteItem) return;

        setIsSubmittingNote(true);
        const itemRef = doc(db, `users/${user.uid}/items`, editingNoteItem.id);
        try {
            await updateDoc(itemRef, {
                urgentNote: urgentNoteInput
            });
            toast({ title: "Berhasil!", description: "Catatan berhasil diperbarui." });
            setIsNoteDialogOpen(false);
        } catch (error) {
            console.error("Gagal memperbarui catatan:", error);
            toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat memperbarui catatan." });
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const getStatusBadge = (item: StockItem) => {
        const isLowStock = item.quantity <= item.lowStockThreshold;
        if (isLowStock) {
            return (
                <Badge variant="destructive" className="flex items-center gap-1.5 w-fit">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Stok Menipis
                </Badge>
            );
        }
        return (
             <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                 <CheckCircle className="h-3.5 w-3.5" />
                Aman
            </Badge>
        );
    };

    return (
        <AppLayout pageTitle="Stok Saat Ini">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold">Stok Bahan Baku Saat Ini</h1>
                    <p className="text-muted-foreground">Pantau tingkat persediaan semua bahan baku.</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Boxes className="h-6 w-6 text-primary"/>
                            <div>
                                <CardTitle className="text-xl">Daftar Persediaan</CardTitle>
                                <CardDescription>Total {stockItems.length} jenis bahan baku terdaftar.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Bahan</TableHead>
                                    <TableHead className="w-[200px]">Stok Saat Ini</TableHead>
                                    <TableHead>Batas Minimum</TableHead>
                                    <TableHead>Catatan Urgent</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="text-center text-muted-foreground py-10">
                                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                                <p className="mt-2">Memuat data stok...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : stockItems.length > 0 ? (
                                    stockItems.map((item) => {
                                        const isLowStock = item.quantity <= item.lowStockThreshold;
                                        const stockPercentage = item.lowStockThreshold > 0 ? Math.min((item.quantity / (item.lowStockThreshold * 2)) * 100, 100) : 100;

                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    <p className={`font-bold text-lg ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                                                        {item.quantity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                                                    </p>
                                                    <Progress value={stockPercentage} className={`h-1.5 mt-2 ${isLowStock ? '[&>div]:bg-destructive' : ''}`} />
                                                </TableCell>
                                                <TableCell>{item.lowStockThreshold.toLocaleString()} {item.unit}</TableCell>
                                                <TableCell>
                                                    {item.urgentNote ? (
                                                        <div>
                                                            <p className="text-sm text-primary font-semibold">{item.urgentNote}</p>
                                                            <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={() => openNoteDialog(item)}>
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                Edit Catatan
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground italic">Belum ada catatan</p>
                                                             <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary" onClick={() => openNoteDialog(item)}>
                                                                <PlusCircle className="h-3 w-3 mr-1" />
                                                                Tambah Catatan
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(item)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="text-center text-muted-foreground py-10">
                                                <p className="font-semibold">Belum ada stok barang.</p>
                                                <p className="text-sm">Tambahkan barang melalui menu 'Daftar Barang' untuk memulai.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Catatan Urgent untuk {editingNoteItem?.name}</DialogTitle>
                        <DialogDescription>
                            Tambah atau ubah catatan penting untuk barang ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="urgentNote" className="text-left">
                            Catatan
                        </Label>
                        <Textarea id="urgentNote" value={urgentNoteInput} onChange={(e) => setUrgentNoteInput(e.target.value)} placeholder="Tulis catatan di sini..."/>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveNote} disabled={isSubmittingNote}>
                            {isSubmittingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Catatan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
