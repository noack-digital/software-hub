'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { AdminSoftwareList } from '../components/AdminSoftwareList';
import { ImportExport } from '../components/ImportExport';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminSoftwarePage() {
  const [showImport, setShowImport] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-green-900">
            Software verwalten
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/software/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Software
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {showImport ? (
          <ImportExport onBack={() => setShowImport(false)} />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowImport(true)}
              >
                Import/Export
              </Button>
            </div>
            <AdminSoftwareList />
          </div>
        )}
      </main>
    </div>
  );
}
