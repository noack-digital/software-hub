'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, X, Database, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function DemoBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Prüfe ob DEMO-Daten vorhanden sind
  const { data: demoCheck } = useQuery({
    queryKey: ['demo-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/demo/check');
      if (!response.ok) return { hasDemoData: false };
      return response.json();
    },
    refetchInterval: 10000 // Alle 10 Sekunden prüfen
  });

  // Prüfe localStorage für Dismiss-Status
  useEffect(() => {
    const dismissed = localStorage.getItem('demo-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('demo-banner-dismissed', 'true');
  };

  const softwareCount = demoCheck?.counts?.software || 0;
  const hasDemoData = demoCheck?.hasDemoData;

  if (softwareCount === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <PlusSquare className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3 flex-1 text-sm text-blue-800">
            <h3 className="text-sm font-semibold">Jetzt starten</h3>
            <p className="mt-1">
              Es sind noch keine Software-Einträge hinterlegt. Laden Sie den fertigen DEMO-Datensatz
              (17 Software-Einträge, 6 Kategorien, 3 Zielgruppen) oder legen Sie eigene Inhalte an.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/admin/import-export">
                <Button size="sm">
                  <Database className="h-4 w-4 mr-1" />
                  DEMO-Daten laden
                </Button>
              </Link>
              <Link href="/admin/software/new">
                <Button size="sm" variant="outline">
                  <PlusSquare className="h-4 w-4 mr-1" />
                  Eigene Software anlegen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasDemoData || isDismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            DEMO-Daten aktiv
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Es sind aktuell DEMO-Daten geladen ({demoCheck.counts?.software || 0} Software-Einträge,{' '}
              {demoCheck.counts?.categories || 0} Kategorien, {demoCheck.counts?.targetGroups || 0} Zielgruppen).
            </p>
            <p className="mt-2">
              Sie können die DEMO-Daten jederzeit über{' '}
              <Link href="/admin/import-export" className="underline font-medium hover:text-yellow-900">
                Import/Export
              </Link>{' '}
              entfernen oder wieder hinzufügen.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/admin/import-export">
              <Button size="sm" variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                DEMO-Daten verwalten
              </Button>
            </Link>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-600 focus:outline-none"
            aria-label="Banner schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}



