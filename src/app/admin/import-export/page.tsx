'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportExportPage() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      setExportStatus('Daten werden geladen...');
      
      const response = await fetch('/api/software');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }
      
      const data = await response.json();
      setExportStatus('Daten werden verarbeitet...');

      // Transform data for export - convert categories and targetGroups to readable strings
      // Only include fields that are actually used and displayed in the application
      const transformedData = data.map((software: any) => ({
        name: software.name || '',
        url: software.url || '',
        shortDescription: software.shortDescription || '',
        description: software.description || '',
        types: Array.isArray(software.types) ? software.types.join(', ') : (software.types || ''),
        costs: software.costs || '',
        available: software.available ? 'Ja' : 'Nein',
        categories: Array.isArray(software.categories)
          ? software.categories.map((cat: any) => cat.name).join(', ')
          : '',
        targetGroups: Array.isArray(software.targetGroups)
          ? software.targetGroups.map((tg: any) => tg.name).join(', ')
          : ''
      }));

      // German column headers - only for fields that are relevant
      const germanHeaders = {
        name: 'Name',
        url: 'Website',
        shortDescription: 'Kurzbeschreibung',
        description: 'Beschreibung',
        types: 'Typen',
        costs: 'Kosten',
        available: 'Verfügbar',
        categories: 'Kategorien',
        targetGroups: 'Zielgruppen'
      };

      if (format === 'csv') {
        setExportStatus('CSV wird erstellt...');
        
        // Create CSV with German headers
        const headers = Object.values(germanHeaders);
        const csvRows = [headers.join(',')];
        
        transformedData.forEach((row: any) => {
          const values = Object.keys(germanHeaders).map(key => {
            const value = row[key] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          });
          csvRows.push(values.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `software-liste-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setExportStatus('CSV erfolgreich exportiert!');
      } else {
        setExportStatus('Excel wird erstellt...');
        
        // Create Excel with German headers
        const excelData = transformedData.map((row: any) => {
          const newRow: any = {};
          Object.keys(germanHeaders).forEach(key => {
            newRow[germanHeaders[key as keyof typeof germanHeaders]] = row[key] || '';
          });
          return newRow;
        });
        
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Software');
        XLSX.writeFile(wb, `software-liste-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        setExportStatus('Excel erfolgreich exportiert!');
      }
      
      // Clear status after 3 seconds
      setTimeout(() => setExportStatus(''), 3000);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Fehler beim Export: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      setTimeout(() => setExportStatus(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
      setImportStatus('Fehler: Nur CSV- und Excel-Dateien sind erlaubt');
      setTimeout(() => setImportStatus(''), 5000);
      return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setImportStatus('Fehler: Datei ist zu groß (max. 10MB)');
      setTimeout(() => setImportStatus(''), 5000);
      return;
    }
    
    processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setIsImporting(true);
      setImportStatus('Datei wird gelesen...');
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          let jsonData: any[] = [];
          
          if (file.name.toLowerCase().endsWith('.csv')) {
            // Process CSV
            setImportStatus('CSV wird verarbeitet...');
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              throw new Error('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              jsonData.push(row);
            }
          } else {
            // Process Excel
            setImportStatus('Excel wird verarbeitet...');
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
          }
          
          setImportStatus('Daten werden importiert...');
          
          // Transform data to match our schema
          const transformedData = jsonData.map((row: any) => {
            // Map German headers to English field names
            const headerMapping: { [key: string]: string } = {
              'Name': 'name',
              'Website': 'url',
              'Kurzbeschreibung': 'shortDescription',
              'Beschreibung': 'description',
              'Typen': 'types',
              'Kosten': 'costs',
              'Verfügbar': 'available',
              'Kategorien': 'categories',
              'Zielgruppen': 'targetGroups'
            };
            
            const transformed: any = {};
            
            Object.keys(row).forEach(key => {
              const mappedKey = headerMapping[key] || key.toLowerCase();
              let value = row[key];
              
              // Handle special fields
              if (mappedKey === 'available') {
                value = value === 'Ja' || value === 'true' || value === true;
              } else if (mappedKey === 'types' && typeof value === 'string') {
                value = value.split(',').map((t: string) => t.trim()).filter(Boolean);
              }
              
              transformed[mappedKey] = value;
            });
            
            return transformed;
          });
          
          // Send data to API
          const response = await fetch('/api/software/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: transformedData }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Import');
          }
          
          const result = await response.json();
          setImportStatus(`Import erfolgreich! ${result.imported} Einträge importiert.`);
          
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          setTimeout(() => setImportStatus(''), 5000);
          
        } catch (error) {
          console.error('File processing error:', error);
          setImportStatus('Fehler beim Verarbeiten der Datei: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
          setTimeout(() => setImportStatus(''), 5000);
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.onerror = () => {
        setImportStatus('Fehler beim Lesen der Datei');
        setTimeout(() => setImportStatus(''), 5000);
        setIsImporting(false);
      };
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
      } else {
        reader.readAsArrayBuffer(file);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('Fehler beim Import: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      setTimeout(() => setImportStatus(''), 5000);
      setIsImporting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
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

        {exportStatus && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">{exportStatus}</p>
          </div>
        )}

        {importStatus && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800">{importStatus}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-green-50 p-2">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Export</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Exportieren Sie die komplette Software-Liste mit Kategorien und Zielgruppen in verschiedenen Formaten
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exportiere...' : 'Als CSV exportieren'}
              </button>
              <button
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exportiere...' : 'Als Excel exportieren'}
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
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="file-upload"
                onChange={handleFileInputChange}
                disabled={isImporting}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer text-sm text-gray-600 ${isImporting ? 'pointer-events-none opacity-50' : ''}`}
              >
                {isImporting ? (
                  <span className="text-blue-600">Importiere...</span>
                ) : (
                  <>
                    <span className="text-green-600 hover:text-green-500">
                      Datei auswählen
                    </span>{' '}
                    oder hierher ziehen
                  </>
                )}
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
