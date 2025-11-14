'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2, Languages, CheckCircle2, XCircle } from 'lucide-react';

// Typ für Zielgruppe
type TargetGroup = {
  id: string;
  name: string;
  description: string | null;
  nameEn: string | null;
  descriptionEn: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TargetGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTargetGroup, setEditingTargetGroup] = useState<TargetGroup | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const queryClient = useQueryClient();

  // Prüfe ob API-Key vorhanden ist
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const settingsResponse = await fetch('/api/settings?key=geminiApiKey');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const hasKey = settingsData.value && settingsData.value.trim().length > 0;
          setHasValidApiKey(hasKey);
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des API-Keys:', error);
        setHasValidApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  // Zielgruppen abrufen
  const { data: targetGroups = [], isLoading } = useQuery<TargetGroup[]>({
    queryKey: ['target-groups'],
    queryFn: async () => {
      const response = await fetch('/api/target-groups');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zielgruppen');
      }
      return response.json();
    },
  });

  // Mutation zum Erstellen einer neuen Zielgruppe
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/target-groups', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          nameEn: formData.get('nameEn'),
          descriptionEn: formData.get('descriptionEn'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen der Zielgruppe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-groups'] });
      toast.success('Zielgruppe erfolgreich erstellt');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Mutation zum Aktualisieren einer Zielgruppe
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!editingTargetGroup) return null;

      const response = await fetch('/api/target-groups', {
        method: 'PATCH',
        body: JSON.stringify({
          id: editingTargetGroup.id,
          name: formData.get('name'),
          description: formData.get('description'),
          nameEn: formData.get('nameEn'),
          descriptionEn: formData.get('descriptionEn'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren der Zielgruppe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-groups'] });
      toast.success('Zielgruppe erfolgreich aktualisiert');
      setIsDialogOpen(false);
      setEditingTargetGroup(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Mutation zum Löschen einer Zielgruppe
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/target-groups?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen der Zielgruppe');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['target-groups'] });
      toast.success('Zielgruppe erfolgreich gelöscht');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Funktion zum Öffnen des Dialogs für eine neue Zielgruppe
  const handleNewTargetGroup = () => {
    setIsEditMode(false);
    setEditingTargetGroup(null);
    setIsDialogOpen(true);
  };

  // Funktion zum Öffnen des Dialogs zum Bearbeiten einer Zielgruppe
  const handleEditTargetGroup = (targetGroup: TargetGroup) => {
    setIsEditMode(true);
    setEditingTargetGroup(targetGroup);
    setIsDialogOpen(true);
  };

  // Funktion zum Löschen einer Zielgruppe mit Bestätigung
  const handleDeleteTargetGroup = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Zielgruppe "${name}" wirklich löschen?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Funktion zum Verarbeiten des Formulars
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (isEditMode && editingTargetGroup) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Funktion zum Übersetzen von Deutsch nach Englisch
  const handleTranslateToEnglish = async () => {
    if (!hasValidApiKey) {
      toast.error('Bitte konfigurieren Sie einen API-Key in den Einstellungen');
      return;
    }

    setIsTranslating(true);
    try {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      const nameEnInput = document.getElementById('nameEn') as HTMLInputElement;
      const descriptionEnInput = document.getElementById('descriptionEn') as HTMLTextAreaElement;

      if (!nameInput || !nameEnInput) {
        throw new Error('Formularfelder nicht gefunden');
      }

      // Übersetze Name
      if (nameInput.value.trim()) {
        const nameResponse = await fetch('/api/ai/translate-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: nameInput.value,
            fromLanguage: 'Deutsch',
            toLanguage: 'Englisch',
          }),
        });

        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          nameEnInput.value = nameData.translatedText;
        } else {
          const error = await nameResponse.json();
          const errorMsg = error.error || 'Fehler beim Übersetzen des Namens';
          const errorDetails = error.details ? ` ${error.details}` : '';
          const errorDebug = error.debug ? ` (Debug: ${JSON.stringify(error.debug)})` : '';
          throw new Error(errorMsg + errorDetails + errorDebug);
        }
      }

      // Übersetze Beschreibung
      if (descriptionInput && descriptionInput.value.trim() && descriptionEnInput) {
        const descResponse = await fetch('/api/ai/translate-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: descriptionInput.value,
            fromLanguage: 'Deutsch',
            toLanguage: 'Englisch',
          }),
        });

        if (descResponse.ok) {
          const descData = await descResponse.json();
          descriptionEnInput.value = descData.translatedText;
        } else {
          const error = await descResponse.json();
          const errorMsg = error.error || 'Fehler beim Übersetzen der Beschreibung';
          const errorDetails = error.details ? ` ${error.details}` : '';
          const errorDebug = error.debug ? ` (Debug: ${JSON.stringify(error.debug)})` : '';
          throw new Error(errorMsg + errorDetails + errorDebug);
        }
      }

      toast.success('Übersetzung erfolgreich');
    } catch (error: any) {
      let errorMessage = error.message || 'Unbekannter Fehler';
      
      // Versuche Retry-Delay aus der Fehlermeldung zu extrahieren
      const retryMatch = errorMessage.match(/in (\d+) Sekunden/i);
      if (retryMatch) {
        const retrySeconds = parseInt(retryMatch[1]);
        toast.error(`Fehler bei der Übersetzung: ${errorMessage}`, {
          duration: Math.min(retrySeconds * 1000, 10000),
        });
      } else {
        toast.error(`Fehler bei der Übersetzung: ${errorMessage}`);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Funktion zum Übersetzen von Englisch nach Deutsch
  const handleTranslateToGerman = async () => {
    if (!hasValidApiKey) {
      toast.error('Bitte konfigurieren Sie einen API-Key in den Einstellungen');
      return;
    }

    setIsTranslating(true);
    try {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      const nameEnInput = document.getElementById('nameEn') as HTMLInputElement;
      const descriptionEnInput = document.getElementById('descriptionEn') as HTMLTextAreaElement;

      if (!nameInput || !nameEnInput) {
        throw new Error('Formularfelder nicht gefunden');
      }

      // Übersetze Name
      if (nameEnInput.value.trim()) {
        const nameResponse = await fetch('/api/ai/translate-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: nameEnInput.value,
            fromLanguage: 'Englisch',
            toLanguage: 'Deutsch',
          }),
        });

        if (nameResponse.ok) {
          const nameData = await nameResponse.json();
          nameInput.value = nameData.translatedText;
        } else {
          const error = await nameResponse.json();
          const errorMsg = error.error || 'Fehler beim Übersetzen des Namens';
          const errorDetails = error.details ? ` ${error.details}` : '';
          const errorDebug = error.debug ? ` (Debug: ${JSON.stringify(error.debug)})` : '';
          throw new Error(errorMsg + errorDetails + errorDebug);
        }
      }

      // Übersetze Beschreibung
      if (descriptionEnInput && descriptionEnInput.value.trim() && descriptionInput) {
        const descResponse = await fetch('/api/ai/translate-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: descriptionEnInput.value,
            fromLanguage: 'Englisch',
            toLanguage: 'Deutsch',
          }),
        });

        if (descResponse.ok) {
          const descData = await descResponse.json();
          descriptionInput.value = descData.translatedText;
        } else {
          const error = await descResponse.json();
          const errorMsg = error.error || 'Fehler beim Übersetzen der Beschreibung';
          const errorDetails = error.details ? ` ${error.details}` : '';
          const errorDebug = error.debug ? ` (Debug: ${JSON.stringify(error.debug)})` : '';
          throw new Error(errorMsg + errorDetails + errorDebug);
        }
      }

      toast.success('Übersetzung erfolgreich');
    } catch (error: any) {
      let errorMessage = error.message || 'Unbekannter Fehler';
      
      // Versuche Retry-Delay aus der Fehlermeldung zu extrahieren
      const retryMatch = errorMessage.match(/in (\d+) Sekunden/i);
      if (retryMatch) {
        const retrySeconds = parseInt(retryMatch[1]);
        toast.error(`Fehler bei der Übersetzung: ${errorMessage}`, {
          duration: Math.min(retrySeconds * 1000, 10000),
        });
      } else {
        toast.error(`Fehler bei der Übersetzung: ${errorMessage}`);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">
          Zielgruppen verwalten
        </h1>
      </div>

      <div>
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Verwalten Sie hier die Zielgruppen für die Software-Einträge.
          </p>
          <Button onClick={handleNewTargetGroup}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Zielgruppe
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beschreibung
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Übersetzung
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt am
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {targetGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Keine Zielgruppen vorhanden. Erstellen Sie eine neue Zielgruppe.
                    </td>
                  </tr>
                ) : (
                  targetGroups.map((targetGroup) => {
                    const hasTranslation = (targetGroup.nameEn && targetGroup.nameEn.trim().length > 0) || 
                                         (targetGroup.descriptionEn && targetGroup.descriptionEn.trim().length > 0);
                    
                    return (
                      <tr key={targetGroup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {targetGroup.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {targetGroup.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {hasTranslation ? (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-green-600" title="Übersetzung vorhanden" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <XCircle className="h-5 w-5 text-gray-400" title="Keine Übersetzung" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(targetGroup.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTargetGroup(targetGroup)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTargetGroup(targetGroup.id, targetGroup.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialog für Neue/Bearbeiten Zielgruppe */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? 'Zielgruppe bearbeiten' : 'Neue Zielgruppe'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 2-Spalten-Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Linke Spalte: Deutsche Felder */}
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-green-700">Deutsche Felder</h3>
                      {hasValidApiKey && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleTranslateToEnglish}
                          disabled={isTranslating}
                          className="text-xs"
                        >
                          <Languages className="h-3 w-3 mr-1" />
                          {isTranslating ? 'Übersetzt...' : 'DE → EN'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingTargetGroup?.name || ''}
                        required
                        placeholder="Name der Zielgruppe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Beschreibung (optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingTargetGroup?.description || ''}
                        placeholder="Beschreibung der Zielgruppe"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Rechte Spalte: Englische Felder */}
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-blue-700">Englische Felder (optional)</h3>
                      {hasValidApiKey && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleTranslateToGerman}
                          disabled={isTranslating}
                          className="text-xs"
                        >
                          <Languages className="h-3 w-3 mr-1" />
                          {isTranslating ? 'Übersetzt...' : 'EN → DE'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nameEn">Name (English)</Label>
                      <Input
                        id="nameEn"
                        name="nameEn"
                        defaultValue={editingTargetGroup?.nameEn || ''}
                        placeholder="Target group name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">Description (English)</Label>
                      <Textarea
                        id="descriptionEn"
                        name="descriptionEn"
                        defaultValue={editingTargetGroup?.descriptionEn || ''}
                        placeholder="Target group description"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit">
                    {isEditMode ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
