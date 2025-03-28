'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportExportPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      // Verwende die neue Export-API
      const response = await fetch('/api/admin/export');
      const data = await response.json();

      if (format === 'csv') {
        const csvContent = data
          .map((row: any) => Object.values(row).join(','))
          .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `software-liste-${new Date().toISOString()}.csv`;
        a.click();
      } else {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Software');
        XLSX.writeFile(wb, `software-liste-${new Date().toISOString()}.xlsx`);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold" style={{ color: '#004d3d' }}>
            Import / Export
          </h1>
          <UserNav />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/admin')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Zurück zum Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-green-50 p-2">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Export</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Exportieren Sie die komplette Software-Liste in verschiedenen Formaten
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Als CSV exportieren
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Als Excel exportieren
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-green-50 p-2">
                <Upload className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Import</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Importieren Sie eine Software-Liste aus einer CSV- oder Excel-Datei
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-gray-600"
              >
                <span className="text-green-600 hover:text-green-500">
                  Datei auswählen
                </span>{' '}
                oder hierher ziehen
              </label>
              <p className="mt-1 text-xs text-gray-500">
                CSV oder Excel-Datei (max. 10MB)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
