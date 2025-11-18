'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, Database, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ImportExportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isRemovingDemo, setIsRemovingDemo] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Prüfe ob DEMO-Daten vorhanden sind
  const { data: demoCheck } = useQuery({
    queryKey: ['demo-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/demo/check');
      if (!response.ok) throw new Error('Fehler beim Prüfen');
      return response.json();
    },
    refetchInterval: 5000 // Alle 5 Sekunden prüfen
  });

  const handleLoadDemoData = async () => {
    if (!confirm('Möchten Sie wirklich den DEMO-Datensatz laden? Alle vorhandenen Daten werden gelöscht!')) {
      return;
    }

    setIsLoadingDemo(true);
    const loadingToast = toast.loading('DEMO-Datensatz wird geladen...');
    
    try {
      const response = await fetch('/api/admin/demo/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ useDefault: true })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Laden');
      }

      const result = await response.json();
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['software'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['target-groups'] });
      queryClient.invalidateQueries({ queryKey: ['demo-check'] });

      toast.dismiss(loadingToast);
      toast.success('DEMO-Datensatz erfolgreich geladen', {
        description: `${result.counts?.software || 0} Software-Einträge, ${result.counts?.categories || 0} Kategorien, ${result.counts?.targetGroups || 0} Zielgruppen wurden geladen`,
        duration: 5000
      });
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      toast.dismiss(loadingToast);
      toast.error('Fehler beim Laden des DEMO-Datensatzes', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        duration: 5000
      });
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleRemoveDemoData = async () => {
    if (!confirm('Möchten Sie wirklich alle Daten entfernen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
      return;
    }

    setIsRemovingDemo(true);
    const loadingToast = toast.loading('Daten werden entfernt...');
    
    try {
      const response = await fetch('/api/admin/demo/remove', {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Entfernen');
      }

      const result = await response.json();

      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['software'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['target-groups'] });
      queryClient.invalidateQueries({ queryKey: ['demo-check'] });

      toast.dismiss(loadingToast);
      toast.success('Alle Daten erfolgreich entfernt', {
        description: 'Alle Software-Einträge, Kategorien und Zielgruppen wurden gelöscht',
        duration: 5000
      });
    } catch (error) {
      console.error('Fehler beim Entfernen:', error);
      toast.dismiss(loadingToast);
      toast.error('Fehler beim Entfernen der Daten', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        duration: 5000
      });
    } finally {
      setIsRemovingDemo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const parseCSV = (csvText: string): any[] => {
    // CSV-Parser der Anführungszeichen und Zeilenumbrüche innerhalb von Anführungszeichen berücksichtigt
    const parseCSVWithQuotes = (text: string): string[][] => {
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote ("")
            currentField += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          currentRow.push(currentField.trim());
          currentField = '';
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
          // End of row (only if not inside quotes)
          if (char === '\r' && nextChar === '\n') {
            i++; // Skip \n after \r
          }
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            // Only add non-empty rows
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else {
          // Regular character (including newlines inside quotes)
          currentField += char;
        }
      }
      
      // Add last field and row
      if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field.length > 0)) {
          rows.push(currentRow);
        }
      }
      
      return rows;
    };

    // Parse CSV mit korrekter Behandlung von Anführungszeichen und Zeilenumbrüchen
    const rows = parseCSVWithQuotes(csvText);
    
    if (rows.length === 0) return [];

    // Prüfe ob erste Zeile Header ist (enthält typische Header-Namen)
    const firstRowValues = rows[0];
    const isHeaderRow = firstRowValues.some(val => 
      ['id', 'name', 'shortDescription', 'description', 'url', 'types', 'costs', 'available', 'categories'].includes(val.toLowerCase().replace(/"/g, ''))
    );

    let headers: string[];
    let dataStartIndex: number;

    if (isHeaderRow) {
      // Erste Zeile sind die Header
      headers = firstRowValues.map(h => {
        // Entferne Anführungszeichen vom Header
        let header = h.trim();
        if (header.startsWith('"') && header.endsWith('"')) {
          header = header.slice(1, -1);
        }
        return header.replace(/""/g, '"');
      });
      dataStartIndex = 1;
    } else {
      // Keine Header-Zeile - verwende Standard-Header basierend auf Export-Format
      headers = ['id', 'name', 'shortDescription', 'description', 'url', 'logo', 'types', 'costs', 'available', 'categories', 'nameEn', 'shortDescriptionEn', 'descriptionEn', 'features', 'alternatives', 'notes', 'featuresEn', 'alternativesEn', 'notesEn', 'targetGroups'];
      dataStartIndex = 0;
      console.log('Keine Header-Zeile gefunden, verwende Standard-Header:', headers);
    }
    
    console.log('CSV Headers:', headers);
    console.log(`Anzahl Zeilen: ${rows.length}, Daten starten bei Index: ${dataStartIndex}`);
    
    // Restliche Zeilen sind Daten
    const data = [];
    for (let i = dataStartIndex; i < rows.length; i++) {
      const values = rows[i];
      
      // Prüfe ob die Anzahl der Werte mit Headern übereinstimmt
      if (values.length !== headers.length) {
        console.warn(`Zeile ${i + 1}: Anzahl der Werte (${values.length}) stimmt nicht mit Headern (${headers.length}) überein`);
        console.warn(`Werte:`, values.slice(0, 5));
        // Versuche trotzdem zu parsen, verwende nur verfügbare Werte
      }
      
      const row: any = {};
      headers.forEach((header, index) => {
        // Entferne Anführungszeichen vom Wert
        let value = values[index] || '';
        if (typeof value === 'string') {
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          // Ersetze doppelte Anführungszeichen
          value = value.replace(/""/g, '"');
        }
        row[header] = value;
      });
      
      // Debug: Zeige erste Datenzeile
      if (i === dataStartIndex) {
        console.log('Erste Datenzeile:', row);
        console.log('Name-Wert:', row.name);
      }
      
      data.push(row);
    }
    
    console.log(`CSV geparst: ${data.length} Zeilen`);
    return data;
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Bitte wählen Sie eine Datei aus');
      return;
    }

    setIsImporting(true);
    const loadingToast = toast.loading('Datei wird importiert...');

    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      let data: any[] = [];

      if (fileExtension === 'csv') {
        // CSV-Datei lesen
        const text = await selectedFile.text();
        data = parseCSV(text);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Excel-Datei lesen
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(firstSheet);
      } else {
        throw new Error('Unsupported file format. Bitte verwenden Sie CSV oder Excel.');
      }

      if (data.length === 0) {
        throw new Error('Die Datei enthält keine Daten');
      }

      // Konvertiere Daten in das richtige Format für die API
      const importData = data.map((row: any) => {
        // Konvertiere "Ja"/"Nein" zurück zu boolean
        const available = row.available === 'Ja' || row.available === 'true' || row.available === true || row.available === '1';
        
        // Konvertiere types String zurück zu Array
        const types = row.types 
          ? (typeof row.types === 'string' ? row.types.split(',').map((t: string) => t.trim()).filter((t: string) => t) : row.types)
          : [];

        // Kategorien als Array von Namen (werden später zu IDs konvertiert)
        const categoryNames = row.categories 
          ? (typeof row.categories === 'string' 
              ? row.categories.split(',').map((c: string) => c.trim()).filter((c: string) => c) 
              : Array.isArray(row.categories) 
                ? row.categories.map((c: string) => c.trim()).filter((c: string) => c)
                : [])
          : [];

        // Zielgruppen als Array von Namen (werden später zu IDs konvertiert)
        const targetGroupNames = row.targetGroups 
          ? (typeof row.targetGroups === 'string' 
              ? row.targetGroups.split(',').map((tg: string) => tg.trim()).filter((tg: string) => tg) 
              : Array.isArray(row.targetGroups) 
                ? row.targetGroups.map((tg: string) => tg.trim()).filter((tg: string) => tg)
                : [])
          : [];

        return {
          name: row.name || '',
          shortDescription: row.shortDescription || row.description || '',
          description: row.description || '',
          url: row.url || '',
          logo: row.logo || '',
          types: types,
          costs: row.costs || '',
          available: available,
          // Englische Felder falls vorhanden
          nameEn: row.nameEn || '',
          shortDescriptionEn: row.shortDescriptionEn || '',
          descriptionEn: row.descriptionEn || '',
          features: row.features || '',
          alternatives: row.alternatives || '',
          notes: row.notes || '',
          featuresEn: row.featuresEn || '',
          alternativesEn: row.alternativesEn || '',
          notesEn: row.notesEn || '',
          // Kategorien und Zielgruppen als Arrays von Namen
          categoryNames: categoryNames,
          targetGroupNames: targetGroupNames
        };
      });

      // Sende Daten an Import-API
      const response = await fetch('/api/admin/software/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: importData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Importieren');
      }

      const result = await response.json();

      // Cache invalidieren und Seite neu laden
      await queryClient.invalidateQueries({ queryKey: ['software'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['demo-check'] });
      
      // Refetch um sicherzustellen, dass die Daten aktualisiert werden
      queryClient.refetchQueries({ queryKey: ['software'] });

      toast.dismiss(loadingToast);
      const successMessage = result.errors && result.errors.length > 0
        ? `${result.count} von ${result.total || importData.length} Software-Einträgen erfolgreich importiert. ${result.errors.length} Fehler aufgetreten.`
        : `${result.count || importData.length} Software-Einträge wurden erfolgreich importiert`;
      
      toast.success('Import erfolgreich', {
        description: successMessage,
        duration: 5000
      });

      // Zeige Fehler-Details falls vorhanden
      if (result.errors && result.errors.length > 0) {
        console.warn('Import-Fehler:', result.errors);
        setTimeout(() => {
          toast.warning('Einige Einträge konnten nicht importiert werden', {
            description: result.errors.slice(0, 3).join('; ') + (result.errors.length > 3 ? ` ... und ${result.errors.length - 3} weitere` : ''),
            duration: 8000
          });
        }, 1000);
      }

      // Datei zurücksetzen
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.dismiss(loadingToast);
      toast.error('Fehler beim Importieren', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
        duration: 5000
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      // Verwende die neue Export-API
      const response = await fetch('/api/admin/export');
      const data = await response.json();

      if (format === 'csv') {
        if (data.length === 0) {
          toast.error('Keine Daten zum Exportieren vorhanden');
          setIsExporting(false);
          return;
        }
        
        // CSV mit Header-Zeile erstellen
        const headers = Object.keys(data[0]);
        const headerRow = headers.map(h => `"${h}"`).join(',');
        
        // Datenzeilen erstellen (mit Anführungszeichen für Werte mit Kommas)
        const csvRows = data.map((row: any) => {
          return headers.map(header => {
            const value = row[header] || '';
            // Wenn der Wert ein Komma, Anführungszeichen oder Zeilenumbruch enthält, in Anführungszeichen setzen
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${String(value).replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        });
        
        // Header + Daten zusammenfügen
        const csvContent = [headerRow, ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#004d3d' }}>
          Import / Export
        </h1>
      </div>

      <div>
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
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
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
              
              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Ausgewählte Datei:</strong> {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Größe: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importiert...' : 'Datei importieren'}
              </button>
            </div>
          </div>
        </div>

        {/* DEMO-Datensatz Verwaltung */}
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-blue-50 p-2">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">DEMO-Datensatz</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Verwalten Sie den festen DEMO-Datensatz für Demonstrationszwecke. Dieser Datensatz umfasst 17 Software-Einträge, 6 Kategorien und 3 Zielgruppen – inklusive Übersetzungen und Logos.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleLoadDemoData}
              disabled={isLoadingDemo || demoCheck?.hasDemoData}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingDemo ? 'Lädt...' : 'DEMO-Datensatz laden'}
            </button>

            <button
              onClick={handleRemoveDemoData}
              disabled={isRemovingDemo || !demoCheck?.hasDemoData}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isRemovingDemo ? 'Entfernt...' : 'DEMO-Datensatz entfernen'}
            </button>
          </div>

          {demoCheck && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {demoCheck.hasDemoData ? (
                  <span className="text-green-600">DEMO-Daten sind geladen</span>
                ) : (
                  <span className="text-gray-500">Keine DEMO-Daten vorhanden</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Software: {demoCheck.counts?.software || 0} | 
                Kategorien: {demoCheck.counts?.categories || 0} | 
                Zielgruppen: {demoCheck.counts?.targetGroups || 0}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
