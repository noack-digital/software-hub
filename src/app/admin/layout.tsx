'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 pl-64"> 
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
