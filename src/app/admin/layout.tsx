'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserNav } from '@/components/UserNav';
import { DemoBanner } from '@/components/admin/DemoBanner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Database, PlusCircle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const { data: demoCheck } = useQuery({
    queryKey: ['demo-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/demo/check');
      if (!response.ok) {
        return { counts: { software: 0 } };
      }
      return response.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const softwareCount = demoCheck?.counts?.software || 0;
    if (softwareCount === 0) {
      const dismissed = typeof window !== 'undefined'
        ? localStorage.getItem('demo-modal-dismissed')
        : 'false';
      if (dismissed !== 'true') {
        setShowDemoModal(true);
      }
    } else {
      setShowDemoModal(false);
    }
  }, [demoCheck]);

  const dismissModal = () => {
    setShowDemoModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-modal-dismissed', 'true');
    }
  };

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

      <Dialog open={showDemoModal} onOpenChange={(open) => !open && dismissModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Noch keine Software-Einträge vorhanden
            </DialogTitle>
            <DialogDescription>
              Laden Sie den vorkonfigurierten DEMO-Datensatz oder legen Sie eigene Kategorien, Zielgruppen und Software an, um den Software-Hub zu füllen.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <p>
                <strong>Demo-Daten importieren:</strong> Enthält 17 Software-Einträge, 6 Kategorien
                und 3 Zielgruppen – ideal zum Testen der Plattform.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <PlusCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <p>
                <strong>Eigene Inhalte anlegen:</strong> Starten Sie mit Kategorien, Zielgruppen
                und Software-Einträgen direkt im Admin-Bereich.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/import-export" onClick={dismissModal}>
                DEMO-Daten laden
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/software/new" onClick={dismissModal}>
                Eigene Software anlegen
              </Link>
            </Button>
            <Button variant="ghost" onClick={dismissModal}>
              Später entscheiden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
