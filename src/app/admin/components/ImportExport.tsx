'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ImportExportProps {
  onClose: () => void;
}

export function ImportExport({ onClose }: ImportExportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/software/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload fehlgeschlagen');
      }

      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDemoData = async (action: 'load' | 'remove') => {
    setIsLoadingDemo(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/software/demo/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Demo-Daten konnten nicht ${action === 'load' ? 'geladen' : 'entfernt'} werden`);
      }

      const data = await response.json();
      console.log('Demo data response:', data);
      onClose();
    } catch (error) {
      console.error('Demo data error:', error);
      setError(error instanceof Error ? error.message : 'Operation fehlgeschlagen');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Software importieren</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm text-gray-900"
            >
              {file ? (
                <span style={{ color: '#004d3d' }}>{file.name}</span>
              ) : (
                <>
                  <span className="hover:opacity-80" style={{ color: '#004d3d' }}>
                    Datei auswählen
                  </span>{' '}
                  oder hierher ziehen
                </>
              )}
            </label>
            <p className="mt-1 text-sm text-gray-600">
              CSV oder Excel-Datei (max. 10MB)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Abbrechen
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#004d3d' }}
            >
              {isUploading ? 'Wird hochgeladen...' : 'Importieren'}
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Demo-Daten</h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleDemoData('load')}
                disabled={isLoadingDemo}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#004d3d' }}
              >
                {isLoadingDemo ? 'Wird geladen...' : 'Demo-Daten laden'}
              </button>
              <button
                onClick={() => handleDemoData('remove')}
                disabled={isLoadingDemo}
                className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 bg-red-600 hover:bg-red-700"
              >
                {isLoadingDemo ? 'Wird entfernt...' : 'Demo-Daten entfernen'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Demo-Daten helfen Ihnen, die Funktionen des Software Hubs zu testen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
