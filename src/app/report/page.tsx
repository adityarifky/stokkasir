"use client"

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: "January", stockIn: 186, stockOut: 80 },
  { month: "February", stockIn: 305, stockOut: 200 },
  { month: "March", stockIn: 237, stockOut: 120 },
  { month: "April", stockIn: 73, stockOut: 190 },
  { month: "May", stockIn: 209, stockOut: 130 },
  { month: "June", stockIn: 214, stockOut: 140 },
]

const chartConfig = {
  stockIn: {
    label: "Stok Masuk",
    color: "hsl(var(--chart-2))",
  },
  stockOut: {
    label: "Stok Keluar",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const pieChartData = [
  { name: 'Emas', value: 400, fill: 'hsl(var(--primary))' },
  { name: 'Perak', value: 300, fill: 'hsl(var(--secondary))' },
  { name: 'Platinum', value: 300, fill: 'hsl(var(--muted))' },
];

export default function ReportPage() {
    return (
        <AppLayout pageTitle="Laporan Stok">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Stok Masuk vs. Stok Keluar</CardTitle>
                        <CardDescription>Ringkasan transaksi bulanan selama 6 bulan terakhir.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                             <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                             <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="stockIn" fill="var(--color-stockIn)" radius={4} />
                            <Bar dataKey="stockOut" fill="var(--color-stockOut)" radius={4} />
                        </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Inventaris per Kategori</CardTitle>
                        <CardDescription>Distribusi nilai di seluruh kategori logam.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartContainer config={{}} className="min-h-[300px] w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
