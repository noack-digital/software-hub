'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Software } from '@prisma/client';
import { Search, Pencil, Trash2, Globe, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";

// Typen für die Kategorien
interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface SoftwareWithCategories {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  url: string;
  types: string[];
  costs: string;
  available: boolean;
  categories: {
    id: string;
    name: string;
  }[];
}

// Typen für die Software
const softwareTypes = [
  { id: 'web', name: 'Web' },
  { id: 'desktop', name: 'Desktop' },
  { id: 'mobile', name: 'Mobile' },
];

// Kostenmodelle
const costModels = [
  { id: 'kostenlos', name: 'Kostenlos' },
  { id: 'einmalig', name: 'Einmalige Lizenzkosten' },
  { id: 'abo', name: 'Abo-Modell' },
];

// Abo-Zeiträume
const subscriptionPeriods = [
  { id: 'monatlich', name: 'Pro Monat' },
  { id: 'jährlich', name: 'Pro Jahr' },
];

export function AdminSoftwareList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState<Set<string>>(new Set());
  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [costModel, setCostModel] = useState('kostenlos');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('monatlich');
  const [licensePrice, setLicensePrice] = useState('');
  const [subscriptionPrice, setSubscriptionPrice] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  const { data: software = [], isLoading } = useQuery<SoftwareWithCategories[]>({
    queryKey: ['software', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      
      const response = await fetch(`/api/software?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/software/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete software');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Software erfolgreich gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen der Software');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SoftwareWithCategories> }) => {
      const response = await fetch(`/api/software/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update software');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      setIsEditDialogOpen(false);
      toast.success('Software erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren der Software');
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch('/api/software/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error('Failed to delete selected software');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Ausgewählte Software-Einträge wurden erfolgreich gelöscht');
      setIsDeleteSelectedDialogOpen(false);
      setDeleteConfirmation('');
      setSelectedSoftware(new Set());
    },
    onError: () => {
      toast.error('Fehler beim Löschen der ausgewählten Software-Einträge');
    },
  });

  const handleEdit = (software: SoftwareWithCategories) => {
    setEditingSoftware(software);
    
    // Kostenmodell aus dem String extrahieren
    if (software.costs.includes('Einmalige Lizenzkosten')) {
      setCostModel('einmalig');
      // Preis extrahieren (Format: "Einmalige Lizenzkosten: XX.XX €")
      const priceMatch = software.costs.match(/Einmalige Lizenzkosten: ([\d.]+) €/);
      setLicensePrice(priceMatch ? priceMatch[1] : '');
    } else if (software.costs.includes('Abo-Modell')) {
      setCostModel('abo');
      // Preis extrahieren (Format: "Abo-Modell: ab XX.XX € pro Monat/Jahr")
      const priceMatch = software.costs.match(/Abo-Modell: ab ([\d.]+) €/);
      setSubscriptionPrice(priceMatch ? priceMatch[1] : '');
      
      if (software.costs.includes('pro Monat')) {
        setSubscriptionPeriod('monatlich');
      } else {
        setSubscriptionPeriod('jährlich');
      }
    } else {
      setCostModel('kostenlos');
    }
    
    // Typ-Auswahl zurücksetzen und aus dem String extrahieren
    setSelectedTypes([]);
    if (software.types) {
      const typeIds = software.types.map(typeName => {
        const type = softwareTypes.find(t => t.name === typeName);
        return type ? type.id : null;
      }).filter(id => id !== null) as string[];
      
      setSelectedTypes(typeIds);
    }
    
    // Kategorie-Auswahl zurücksetzen und aus dem String extrahieren
    setSelectedCategories([]);
    if (software.categories) {
      const categoryIds = software.categories.map(category => category.id);
      
      setSelectedCategories(categoryIds);
    }
    
    setIsEditDialogOpen(true);
  };

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId) 
        : [...prev, typeId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingSoftware) return;
    
    // Kostenmodell-Informationen zusammenstellen
    let costsInfo = formData.get('costModel') as string;
    
    if (costsInfo === 'einmalig') {
      const price = formData.get('licensePrice');
      costsInfo = `Einmalige Lizenzkosten: ${price} €`;
    } else if (costsInfo === 'abo') {
      const price = formData.get('subscriptionPrice');
      const period = formData.get('subscriptionPeriod');
      costsInfo = `Abo-Modell: ab ${price} € ${period === 'monatlich' ? 'pro Monat' : 'pro Jahr'}`;
    } else {
      costsInfo = 'Kostenlos';
    }
    
    updateMutation.mutate({
      id: editingSoftware.id,
      data: {
        name: formData.get('name') as string,
        url: formData.get('url') as string,
        shortDescription: formData.get('shortDescription') as string,
        description: formData.get('description') as string,
        categories: selectedCategories,
        types: selectedTypes,
        costs: costsInfo,
        available: formData.get('available') === 'true',
      }
    });
    
    setIsEditDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Software löschen möchten?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSoftware(new Set(software.map(item => item.id)));
    } else {
      setSelectedSoftware(new Set());
    }
  };

  const handleSelectSoftware = (id: string) => {
    const newSelected = new Set(selectedSoftware);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSoftware(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (deleteConfirmation !== 'LÖSCHEN') {
      toast.error('Bitte geben Sie "LÖSCHEN" ein, um fortzufahren');
      return;
    }
    const selectedIds = Array.from(selectedSoftware);
    deleteSelectedMutation.mutate(selectedIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Software-Liste</h2>
        <div className="flex gap-2">
          {selectedSoftware.size > 0 && (
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteSelectedDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Ausgewählte löschen ({selectedSoftware.size})
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Software suchen..."
            className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading || isCategoriesLoading ? (
        <div className="text-center py-8">Lade Software...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedSoftware.size === software.length}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kosten</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Verfügbar</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {software.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSoftware.has(item.id)}
                      onChange={() => handleSelectSoftware(item.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.categories.map(category => category.name).join(', ')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.types.join(', ')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.costs}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.available ? 'Ja' : 'Nein'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Software bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Details der Software. Klicken Sie auf Speichern, wenn Sie fertig sind.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            
            // Prüfen, ob mindestens ein Typ ausgewählt wurde
            if (selectedTypes.length === 0) {
              toast.error('Bitte wählen Sie mindestens einen Typ aus');
              return;
            }

            // Prüfen, ob mindestens eine Kategorie ausgewählt wurde
            if (selectedCategories.length === 0) {
              toast.error('Bitte wählen Sie mindestens eine Kategorie aus');
              return;
            }
            
            handleUpdate(new FormData(e.currentTarget));
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingSoftware?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                defaultValue={editingSoftware?.url}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Kurzbeschreibung</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                defaultValue={editingSoftware?.shortDescription}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingSoftware?.description}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategorie (Mehrfachauswahl möglich)</Label>
                <div className="space-y-2 pt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-category-${category.id}`} 
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label 
                        htmlFor={`edit-category-${category.id}`}
                        className="cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Typ (Mehrfachauswahl möglich)</Label>
                <div className="space-y-2 pt-2">
                  {softwareTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`edit-type-${type.id}`} 
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => toggleType(type.id)}
                      />
                      <Label 
                        htmlFor={`edit-type-${type.id}`}
                        className="cursor-pointer"
                      >
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="costModel">Kostenmodell</Label>
                <select
                  id="costModel"
                  name="costModel"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                  value={costModel}
                  onChange={(e) => setCostModel(e.target.value)}
                >
                  {costModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {costModel === 'einmalig' && (
                <div className="space-y-2 pl-4 border-l-2 border-green-200">
                  <Label htmlFor="licensePrice">Lizenzpreis (€)</Label>
                  <Input
                    id="licensePrice"
                    name="licensePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={licensePrice}
                    onChange={(e) => setLicensePrice(e.target.value)}
                    placeholder="z.B. 49.99"
                  />
                </div>
              )}

              {costModel === 'abo' && (
                <div className="space-y-4 pl-4 border-l-2 border-green-200">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPrice">Preis ab (€)</Label>
                    <Input
                      id="subscriptionPrice"
                      name="subscriptionPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={subscriptionPrice}
                      onChange={(e) => setSubscriptionPrice(e.target.value)}
                      placeholder="z.B. 9.99"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPeriod">Abrechnungszeitraum</Label>
                    <select
                      id="subscriptionPeriod"
                      name="subscriptionPeriod"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      required
                      value={subscriptionPeriod}
                      onChange={(e) => setSubscriptionPeriod(e.target.value)}
                    >
                      {subscriptionPeriods.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="available">Verfügbarkeit</Label>
              <select
                id="available"
                name="available"
                defaultValue={editingSoftware?.available ? 'true' : 'false'}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                <option value="true">Verfügbar</option>
                <option value="false">Nicht verfügbar</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Ausgewählte Software löschen</DialogTitle>
            <DialogDescription>
              Achtung: Diese Aktion kann nicht rückgängig gemacht werden! 
              {selectedSoftware.size} ausgewählte Software-Einträge werden unwiderruflich gelöscht.
              <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
                Geben Sie "LÖSCHEN" ein, um fortzufahren:
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="LÖSCHEN"
              className="text-center"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteSelectedDialogOpen(false);
                setDeleteConfirmation('');
              }}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmation !== 'LÖSCHEN'}
            >
              Unwiderruflich löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
