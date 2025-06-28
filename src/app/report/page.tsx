"use client"

import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

const chartData: any[] = [];

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

const pieChartData: any[] = [];

export default function ReportPage() {
    return (
        <AppLayout pageTitle="Laporan Stok">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Stok Masuk vs. Stok Keluar</CardTitle>
                        <CardDescription>Ringkasan transaksi bulanan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
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
                        ) : (
                            <div className="min-h-[300px] w-full flex items-center justify-center text-muted-foreground">
                                <p>Data tidak cukup untuk menampilkan laporan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Inventaris per Kategori</CardTitle>
                        <CardDescription>Distribusi nilai di seluruh kategori logam.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         {pieChartData.length > 0 ? (
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
                        ) : (
                            <div className="min-h-[300px] w-full flex items-center justify-center text-muted-foreground">
                                <p>Data tidak cukup untuk menampilkan laporan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
