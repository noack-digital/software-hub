'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

// Typ für Kategorie
type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Kategorien abrufen
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Kategorien');
      }
      return response.json();
    },
  });

  // Mutation zum Erstellen einer neuen Kategorie
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/categories', {
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
        throw new Error(error.error || 'Fehler beim Erstellen der Kategorie');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategorie erfolgreich erstellt');
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Mutation zum Aktualisieren einer Kategorie
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!editingCategory) return null;

      const response = await fetch('/api/categories', {
        method: 'PATCH',
        body: JSON.stringify({
          id: editingCategory.id,
          name: formData.get('name'),
          description: formData.get('description'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Aktualisieren der Kategorie');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategorie erfolgreich aktualisiert');
      setIsDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Mutation zum Löschen einer Kategorie
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Löschen der Kategorie');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategorie erfolgreich gelöscht');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Funktion zum Öffnen des Dialogs für eine neue Kategorie
  const handleNewCategory = () => {
    setIsEditMode(false);
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  // Funktion zum Öffnen des Dialogs zum Bearbeiten einer Kategorie
  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // Funktion zum Löschen einer Kategorie mit Bestätigung
  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Kategorie "${name}" wirklich löschen?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Funktion zum Verarbeiten des Formulars
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (isEditMode && editingCategory) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-green-900">
            Kategorien verwalten
          </h1>
          <UserNav />
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Verwalten Sie hier die Kategorien für die Software-Einträge.
          </p>
          <Button onClick={handleNewCategory}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Neue Kategorie
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt am
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Keine Kategorien vorhanden. Erstellen Sie eine neue Kategorie.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
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

        {/* Dialog für Neue/Bearbeiten Kategorie */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {isEditMode ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name || ''}
                    required
                    placeholder="Name der Kategorie"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung (optional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCategory?.description || ''}
                    placeholder="Beschreibung der Kategorie"
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
