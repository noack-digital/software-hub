'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2, Settings } from 'lucide-react';

// Typ für Zielgruppe
type TargetGroup = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function TargetGroupsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTargetGroup, setEditingTargetGroup] = useState<TargetGroup | null>(null);
  const queryClient = useQueryClient();

  // State für die Zielgruppen-Anzeige-Einstellung
  const [showTargetGroups, setShowTargetGroups] = useState(true);

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

  // Zielgruppen-Anzeige-Einstellung abrufen
  const { data: showTargetGroupsSetting } = useQuery({
    queryKey: ['settings', 'showTargetGroups'],
    queryFn: async () => {
      const response = await fetch('/api/settings?key=showTargetGroups');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Einstellung');
      }
      const data = await response.json();
      setShowTargetGroups(data?.value === 'true');
      return data;
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

  // Mutation zum Aktualisieren der Zielgruppen-Anzeige-Einstellung
  const updateShowTargetGroupsMutation = useMutation({
    mutationFn: async (newValue: boolean) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'showTargetGroups',
          value: newValue.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren der Einstellung');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'showTargetGroups'] });
      toast.success('Einstellung erfolgreich aktualisiert');
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

  // Funktion zum Umschalten der Zielgruppen-Anzeige
  const handleToggleShowTargetGroups = () => {
    const newValue = !showTargetGroups;
    setShowTargetGroups(newValue);
    updateShowTargetGroupsMutation.mutate(newValue);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-green-900">
            Zielgruppen verwalten
          </h1>
          <UserNav />
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Verwalten Sie hier die Zielgruppen für die Software-Einträge (Lehrende, Studierende, Mitarbeitende).
          </p>
          <Button onClick={handleNewTargetGroup}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Zielgruppe
          </Button>
        </div>

        {/* Einstellungsbereich für Zielgruppen-Anzeige */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Frontend-Anzeige</h3>
                <p className="text-sm text-gray-600">
                  Steuern Sie, ob Zielgruppen in den Software-Karten auf der Startseite angezeigt werden
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Zielgruppen {showTargetGroups ? 'anzeigen' : 'ausblenden'}
              </span>
              <button
                onClick={handleToggleShowTargetGroups}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  showTargetGroups ? 'bg-green-600' : 'bg-gray-200'
                }`}
                disabled={updateShowTargetGroupsMutation.isPending}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTargetGroups ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
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
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Keine Zielgruppen vorhanden. Erstellen Sie eine neue Zielgruppe.
                    </td>
                  </tr>
                ) : (
                  targetGroups.map((targetGroup) => (
                    <tr key={targetGroup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {targetGroup.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {targetGroup.description || '-'}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Dialog für Neue/Bearbeiten Zielgruppe */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? 'Zielgruppe bearbeiten' : 'Neue Zielgruppe'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTargetGroup?.name || ''}
                    required
                    placeholder="Name der Zielgruppe (z.B. Lehrende, Studierende, Mitarbeitende)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingTargetGroup?.description || ''}
                    placeholder="Beschreibung der Zielgruppe"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
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
      </main>
    </div>
  );
}