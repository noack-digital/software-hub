'use client';

import { useRouter } from 'next/navigation';
import { AdminSoftwareList } from '../components/AdminSoftwareList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminSoftwarePage() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-900">
          Software verwalten
        </h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push('/admin/software/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Software
          </Button>
        </div>
      </div>

      <div>
        <AdminSoftwareList />
      </div>
    </div>
  );
}
