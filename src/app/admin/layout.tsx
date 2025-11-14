'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { UserNav } from '@/components/UserNav';
import { DemoBanner } from '@/components/admin/DemoBanner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-64">
        <header className="sticky top-0 z-40 w-full border-b bg-white/50 backdrop-blur-lg">
          <div className="px-8">
            <div className="flex h-14 items-center justify-end">
              <UserNav />
            </div>
          </div>
        </header>
        <div className="p-8">
          <DemoBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
