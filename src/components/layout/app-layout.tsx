"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar, SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  History,
  Package,
  BarChart3,
  ClipboardList,
  LogOut,
  Warehouse,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stock-in', label: 'Stok Masuk', icon: PackagePlus },
  { href: '/stock-out', label: 'Stok Keluar', icon: PackageMinus },
  { href: '/history', label: 'Riwayat', icon: History },
  { href: '/current-stock', label: 'Stok Saat Ini', icon: Package },
  { href: '/report', label: 'Laporan Stok', icon: BarChart3 },
  { href: '/items', label: 'Daftar Barang', icon: ClipboardList },
];

function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <div className="flex h-full flex-col p-2">
        <div className="p-2">
          <Button variant="ghost" className="flex w-full items-center justify-start gap-2">
             <div className="rounded-lg bg-primary/20 p-2 text-primary">
                <Warehouse className="h-6 w-6" />
             </div>
             <span className="font-bold">GoldStock</span>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-2">
          <Button onClick={signOut} variant="ghost" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}

export default function AppLayout({ children, pageTitle }: { children: React.ReactNode; pageTitle: string; }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-primary">
          <Warehouse className="h-16 w-16 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
                 <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold hidden md:block">{pageTitle}</h1>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
