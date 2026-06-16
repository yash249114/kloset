'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import RenterNavbar from './RenterNavbar';
import RenterFooter from './RenterFooter';
import SellerSidebar from './SellerSidebar';
import AdminSidebar from './AdminSidebar';
import AIOpsPanel from '@/components/admin/AIOpsPanel';
import { useAuthStore } from '@/store/useAuthStore';
import Toast from '@/components/ui/Toast';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');
  const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Admin Dark Mode Layout
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-admin-bg text-[#E8E8E8] flex font-sans select-none">
        <AdminSidebar />
        <main className="flex-1 ml-[240px] p-8 min-h-screen">
          {children}
        </main>
        <AIOpsPanel />
        <Toast />
      </div>
    );
  }

  // 2. Seller Layout
  if (isSellerRoute) {
    return (
      <div className="min-h-screen bg-ivory text-charcoal flex font-sans select-none">
        <SellerSidebar />
        <main className="flex-1 ml-[240px] p-8 min-h-screen">
          {children}
        </main>
        <Toast />
      </div>
    );
  }

  // 3. Auth Page layout (Standalone clean viewport — no centering wrapper, auth pages handle their own 50/50 split)
  if (isAuthRoute) {
    return (
      <>
        {children}
        <Toast />
      </>
    );
  }

  // 4. Default Renter Layout
  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans select-none">
      <RenterNavbar />
      <main className="flex-grow min-h-[70vh]">
        {children}
      </main>
      <RenterFooter />
      <Toast />
    </div>
  );
}
