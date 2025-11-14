'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Software } from '@prisma/client';
import { Search, Pencil, Trash2, Globe, Monitor, CheckCircle2, XCircle, Sparkles, Download, Upload, X, ImageIcon } from 'lucide-react';
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
  logo?: string | null;
  types: string[];
  targetGroups?: string[];
  costs: string;
  available: boolean;
  // Englische Übersetzungen
  nameEn?: string | null;
  shortDescriptionEn?: string | null;
  descriptionEn?: string | null;
  featuresEn?: string | null;
  alternativesEn?: string | null;
  notesEn?: string | null;
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

// Zielgruppen werden aus der API geladen

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
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>([]);
  const [showLogos, setShowLogos] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [fetchingFavicons, setFetchingFavicons] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Lade showLogos Einstellung
  useEffect(() => {
    const fetchShowLogos = async () => {
      try {
        const response = await fetch('/api/settings?key=showLogos');
        if (response.ok) {
          const data = await response.json();
          if (data && data.value) {
            setShowLogos(data.value.toLowerCase() === 'true');
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der showLogos Einstellung:', error);
      }
    };
    fetchShowLogos();
  }, []);

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

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
  });

  // Zielgruppen aus der API laden
  const { data: targetGroups = [], isLoading: isLoadingTargetGroups } = useQuery<Category[]>({
    queryKey: ['target-groups'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/target-groups');
        if (!response.ok) {
          console.warn('Zielgruppen konnten nicht geladen werden');
          return [];
        }
        return response.json();
      } catch (error) {
        console.warn('Fehler beim Laden der Zielgruppen:', error);
        return [];
      }
    },
  });

  const { data: software = [], isLoading } = useQuery<SoftwareWithCategories[]>({
    queryKey: ['software', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      
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

  // Logo-Upload Funktion
  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Ungültiger Dateityp. Erlaubt sind: PNG, JPEG, SVG, ICO');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Datei zu groß. Maximale Größe: 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/software/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Hochladen des Logos');
      }

      const data = await response.json();
      const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
      if (logoInput) {
        logoInput.value = data.logoUrl;
      }
      setLogoUrl(data.logoUrl);
      toast.success('Logo erfolgreich hochgeladen');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  };

  // Logo entfernen
  const handleRemoveLogo = () => {
    const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
    if (logoInput) {
      logoInput.value = '';
    }
    setLogoUrl('');
  };

  // Favicon-Download Funktion
  const handleFetchFavicon = async () => {
    const websiteField = document.getElementById('edit-website') as HTMLInputElement;
    const websiteUrl = websiteField?.value?.trim();

    if (!websiteUrl) {
      toast.error('Bitte geben Sie zuerst die Website-URL ein');
      return;
    }

    setIsFetchingFavicon(true);
    try {
      const response = await fetch('/api/software/fetch-favicon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Herunterladen des Favicons');
      }

      const data = await response.json();
      const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
      if (logoInput) {
        logoInput.value = data.logoUrl;
      }
      setLogoUrl(data.logoUrl);
      toast.success('Favicon erfolgreich heruntergeladen');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsFetchingFavicon(false);
    }
  };

  const handleEdit = (software: SoftwareWithCategories) => {
    setEditingSoftware(software);
    // Setze Logo-URL beim Öffnen des Dialogs
    const initialLogoUrl = software.logo || '';
    setLogoUrl(initialLogoUrl);
    
    // Setze auch das versteckte Input-Feld nach kurzer Verzögerung (nachdem Dialog gerendert wurde)
    setTimeout(() => {
      const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
      if (logoInput) {
        logoInput.value = initialLogoUrl;
      }
    }, 100);
    
    // Kostenmodell aus dem String extrahieren
    if (software.costs.includes('Einmalige Lizenzkosten')) {
      setCostModel('einmalig');
      const priceMatch = software.costs.match(/Einmalige Lizenzkosten: ([\d.]+) €/);
      setLicensePrice(priceMatch ? priceMatch[1] : '');
    } else if (software.costs.includes('Abo-Modell')) {
      setCostModel('abo');
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
    
    // Zielgruppen-Auswahl zurücksetzen und aus dem Array extrahieren
    setSelectedTargetGroups([]);
    if (software.targetGroups && Array.isArray(software.targetGroups)) {
      const targetGroupIds = software.targetGroups.map(group => group.id);
      setSelectedTargetGroups(targetGroupIds);
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

  const toggleTargetGroup = (targetGroupId: string) => {
    setSelectedTargetGroups(prev => 
      prev.includes(targetGroupId) 
        ? prev.filter(id => id !== targetGroupId) 
        : [...prev, targetGroupId]
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
    
    // Logo-Wert aus dem versteckten Input-Feld oder State lesen
    const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
    const logoValue = logoInput?.value || logoUrl || editingSoftware.logo || '';
    
    updateMutation.mutate({
      id: editingSoftware.id,
      data: {
        name: formData.get('name') as string,
        url: formData.get('website') as string,
        shortDescription: formData.get('shortDescription') as string,
        description: formData.get('description') as string,
        logo: logoValue,
        categories: selectedCategories,
        types: selectedTypes,
        targetGroups: selectedTargetGroups, // IDs der ausgewählten Zielgruppen
        costs: costsInfo,
        available: formData.get('available') === 'true',
        // Englische Felder
        nameEn: formData.get('nameEn') as string || null,
        shortDescriptionEn: formData.get('shortDescriptionEn') as string || null,
        descriptionEn: formData.get('descriptionEn') as string || null,
        featuresEn: formData.get('featuresEn') as string || null,
        alternativesEn: formData.get('alternativesEn') as string || null,
        notesEn: formData.get('notesEn') as string || null,
        features: formData.get('features') as string || null,
        alternatives: formData.get('alternatives') as string || null,
        notes: formData.get('notes') as string || null,
      }
    });
    
    setIsEditDialogOpen(false);
    setLogoUrl(''); // Reset nach dem Speichern
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

      {isLoading ? (
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
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Übersetzung</th>
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
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {item.logo ? (
                      <img 
                        src={item.logo} 
                        alt={`${item.name} Logo`}
                        className="h-8 w-8 object-contain mx-auto"
                        onError={(e) => {
                          // Fallback falls Logo nicht geladen werden kann
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (fetchingFavicons.has(item.id)) return;
                          
                          setFetchingFavicons(prev => new Set(prev).add(item.id));
                          
                          try {
                            let websiteUrl = item.url;
                            
                            // Wenn keine URL vorhanden ist, verwende KI um die URL zu ermitteln
                            if (!websiteUrl || websiteUrl.trim().length === 0) {
                              if (!hasValidApiKey) {
                                toast.error('Keine URL vorhanden und kein API-Key konfiguriert. Bitte URL manuell hinzufügen.');
                                return;
                              }
                              
                              // Verwende KI um URL zu ermitteln
                              const aiResponse = await fetch('/api/ai/fill-software', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ softwareName: item.name }),
                              });
                              
                              if (!aiResponse.ok) {
                                throw new Error('Fehler bei der KI-Anfrage');
                              }
                              
                              const aiData = await aiResponse.json();
                              websiteUrl = aiData.url || '';
                              
                              if (!websiteUrl || websiteUrl.trim().length === 0) {
                                toast.error('KI konnte keine URL für diese Software finden.');
                                return;
                              }
                            }
                            
                            // Lade Favicon herunter
                            const faviconResponse = await fetch('/api/software/fetch-favicon', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ websiteUrl }),
                            });
                            
                            if (!faviconResponse.ok) {
                              const error = await faviconResponse.json();
                              throw new Error(error.error || 'Fehler beim Herunterladen des Favicons');
                            }
                            
                            const faviconData = await faviconResponse.json();
                            
                            // Aktualisiere Software mit neuem Logo (und URL falls durch KI ermittelt)
                            const updateData: any = { logo: faviconData.logoUrl };
                            if (websiteUrl !== item.url) {
                              updateData.url = websiteUrl;
                            }
                            
                            const updateResponse = await fetch(`/api/software/${item.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(updateData),
                            });
                            
                            if (!updateResponse.ok) {
                              throw new Error('Fehler beim Aktualisieren des Logos');
                            }
                            
                            // Aktualisiere die Software-Liste
                            queryClient.invalidateQueries({ queryKey: ['software'] });
                            toast.success('Favicon erfolgreich heruntergeladen und gespeichert');
                          } catch (error: any) {
                            toast.error(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
                          } finally {
                            setFetchingFavicons(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(item.id);
                              return newSet;
                            });
                          }
                        }}
                        disabled={fetchingFavicons.has(item.id)}
                        className="h-8 w-8 p-0"
                        title="Favicon mit KI herunterladen"
                      >
                        {fetchingFavicons.has(item.id) ? (
                          <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {((item.nameEn && item.nameEn.trim().length > 0) || 
                      (item.shortDescriptionEn && item.shortDescriptionEn.trim().length > 0) || 
                      (item.descriptionEn && item.descriptionEn.trim().length > 0)) ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600" title="Übersetzung vorhanden" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-gray-400" title="Keine Übersetzung" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.categories.map(category => category.name).join(', ')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.types.map(type => {
                      const typeObj = softwareTypes.find(t => t.id === type.toLowerCase());
                      return typeObj ? typeObj.name : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
                    }).join(', ')}
                  </td>
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
        <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[90vh] overflow-y-auto w-full">
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
          }} className="space-y-8 max-w-7xl mx-auto">
            {/* Verstecktes Logo-Feld */}
            <input type="hidden" id="edit-logo" name="logo" value={logoUrl || editingSoftware?.logo || ''} />
            
            {/* Grundlegende Informationen */}
            <div className="space-y-4 bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Grundlegende Informationen</h2>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name der Software *</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="z.B. Microsoft Word"
                    defaultValue={editingSoftware?.name}
                    required
                    className="flex-1"
                  />
                  {hasValidApiKey && (
                    <Button
                      type="button"
                      onClick={async () => {
                        const nameInput = document.getElementById('edit-name') as HTMLInputElement;
                        const softwareName = nameInput?.value?.trim();
                        if (!softwareName) {
                          toast.error('Bitte geben Sie zuerst den Namen der Software ein');
                          return;
                        }
                        setIsAILoading(true);
                        try {
                          const response = await fetch('/api/ai/fill-software', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ softwareName }),
                          });
                          if (!response.ok) throw new Error('Fehler bei der KI-Anfrage');
                          const data = await response.json();
                          const fields = [
                            { id: 'edit-shortDescription', value: data.shortDescription },
                            { id: 'edit-description', value: data.description },
                            { id: 'edit-website', value: data.url },
                            { id: 'edit-features', value: data.features },
                            { id: 'edit-alternatives', value: data.alternatives },
                            { id: 'edit-notes', value: data.notes },
                            { id: 'edit-shortDescriptionEn', value: data.shortDescriptionEn },
                            { id: 'edit-descriptionEn', value: data.descriptionEn },
                            { id: 'edit-featuresEn', value: data.featuresEn },
                            { id: 'edit-alternativesEn', value: data.alternativesEn },
                            { id: 'edit-notesEn', value: data.notesEn },
                          ];
                          fields.forEach(({ id, value }) => {
                            const field = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
                            if (field && value) field.value = value;
                          });
                          
                          // Kategorien setzen, falls vorhanden
                          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
                            setSelectedCategories(data.categories);
                            toast.success(`Formular erfolgreich mit KI-Daten befüllt. ${data.categories.length} Kategorie(n) zugeordnet.`);
                          } else {
                            toast.success('Formular erfolgreich mit KI-Daten befüllt');
                          }
                        } catch (error: any) {
                          toast.error(`Fehler: ${error.message}`);
                        } finally {
                          setIsAILoading(false);
                        }
                      }}
                      disabled={isAILoading}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isAILoading ? 'Lädt...' : 'Mit KI befüllen lassen'}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-website">Website</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-website"
                    name="website"
                    placeholder="z.B. https://www.microsoft.com/word"
                    defaultValue={editingSoftware?.url}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchFavicon}
                    disabled={isFetchingFavicon}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isFetchingFavicon ? 'Lädt...' : 'Favicon laden'}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-logoFile">Logo</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="edit-logoFile"
                    name="logoFile"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                    onChange={handleUploadLogo}
                    disabled={isUploadingLogo}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('edit-logoFile')?.click()}
                    disabled={isUploadingLogo}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploadingLogo ? 'Lädt...' : 'Logo hochladen'}
                  </Button>
                </div>
                {(logoUrl || editingSoftware?.logo) && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={logoUrl || editingSoftware?.logo || ''} 
                        alt="Logo Vorschau" 
                        className="h-12 w-12 object-contain border border-gray-200 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium text-green-700">Logo geladen</p>
                        <p className="text-xs text-green-600 font-mono break-all">{logoUrl || editingSoftware?.logo}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        handleRemoveLogo();
                        // Auch das versteckte Input-Feld zurücksetzen
                        const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
                        if (logoInput) {
                          logoInput.value = '';
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Deutsch/Englisch nebeneinander */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Linke Spalte: Deutsche Felder */}
              <div className="space-y-4 bg-white p-6 rounded-lg border border-green-200">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Deutsche Felder</h2>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-shortDescription">Kurzbeschreibung</Label>
                  <Textarea
                    id="edit-shortDescription"
                    name="shortDescription"
                    placeholder="Kurze Beschreibung für die Kartenansicht"
                    defaultValue={editingSoftware?.shortDescription || ''}
                    rows={2}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Beschreibung *</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    placeholder="Detaillierte Beschreibung der Software und ihrer Hauptfunktionen"
                    defaultValue={editingSoftware?.description || ''}
                    required
                    rows={5}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-features">Hauptfunktionen</Label>
                  <Textarea
                    id="edit-features"
                    name="features"
                    placeholder="Liste der wichtigsten Funktionen (eine pro Zeile)"
                    defaultValue={(editingSoftware as any)?.features || ''}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-alternatives">Alternativen</Label>
                  <Textarea
                    id="edit-alternatives"
                    name="alternatives"
                    placeholder="Alternative Software-Lösungen (eine pro Zeile)"
                    defaultValue={(editingSoftware as any)?.alternatives || ''}
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Anmerkungen</Label>
                  <Textarea
                    id="edit-notes"
                    name="notes"
                    placeholder="Zusätzliche Anmerkungen oder Hinweise"
                    defaultValue={(editingSoftware as any)?.notes || ''}
                    rows={3}
                  />
                </div>
              </div>

              {/* Rechte Spalte: Englische Felder */}
              <div className="space-y-4 bg-white p-6 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Englische Felder (optional)</h2>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-shortDescriptionEn">Short Description (English)</Label>
                  <Textarea
                    id="edit-shortDescriptionEn"
                    name="shortDescriptionEn"
                    placeholder="Short description for card view"
                    defaultValue={editingSoftware?.shortDescriptionEn || ''}
                    rows={2}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-descriptionEn">Description (English)</Label>
                  <Textarea
                    id="edit-descriptionEn"
                    name="descriptionEn"
                    placeholder="Detailed description in English"
                    defaultValue={editingSoftware?.descriptionEn || ''}
                    rows={5}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-featuresEn">Features (English)</Label>
                  <Textarea
                    id="edit-featuresEn"
                    name="featuresEn"
                    placeholder="List of main features (one per line)"
                    defaultValue={(editingSoftware as any)?.featuresEn || ''}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-alternativesEn">Alternatives (English)</Label>
                  <Textarea
                    id="edit-alternativesEn"
                    name="alternativesEn"
                    placeholder="Alternative software solutions (one per line)"
                    defaultValue={(editingSoftware as any)?.alternativesEn || ''}
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-notesEn">Notes (English)</Label>
                  <Textarea
                    id="edit-notesEn"
                    name="notesEn"
                    placeholder="Additional notes or hints in English"
                    defaultValue={(editingSoftware as any)?.notesEn || ''}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Klassifizierung */}
            <div className="space-y-4 bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Klassifizierung</h2>
              
              <div className="grid gap-2">
                <Label>Software-Typ</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {softwareTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-type-${type.id}`}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => toggleType(type.id)}
                      />
                      <Label htmlFor={`edit-type-${type.id}`} className="font-normal cursor-pointer">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Kategorien</Label>
                {isCategoriesLoading ? (
                  <div>Kategorien werden geladen...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`edit-category-${category.id}`} className="font-normal cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Zielgruppe</Label>
              {isLoadingTargetGroups ? (
                <div>Zielgruppen werden geladen...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {targetGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-targetGroup-${group.id}`}
                        checked={selectedTargetGroups.includes(group.id)}
                        onCheckedChange={() => toggleTargetGroup(group.id)}
                      />
                      <Label htmlFor={`edit-targetGroup-${group.id}`} className="font-normal cursor-pointer">
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

            {/* Kosten */}
            <div className="space-y-4 bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Kosten</h2>
              
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="edit-cost-free"
                    name="costModelRadio"
                    value="kostenlos"
                    checked={costModel === 'kostenlos'}
                    onChange={() => setCostModel('kostenlos')}
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="edit-cost-free" className="font-normal">Kostenlos</Label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edit-cost-license"
                      name="costModelRadio"
                      value="einmalig"
                      checked={costModel === 'einmalig'}
                      onChange={() => setCostModel('einmalig')}
                      className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="edit-cost-license" className="font-normal">Einmalige Lizenzkosten</Label>
                  </div>
                  
                  {costModel === 'einmalig' && (
                    <div className="pl-6">
                      <div className="flex items-center space-x-2">
                        <Input
                          id="edit-licensePrice"
                          name="licensePrice"
                          type="number"
                          placeholder="Preis in €"
                          className="w-32"
                          min="0"
                          step="0.01"
                          value={licensePrice}
                          onChange={(e) => setLicensePrice(e.target.value)}
                        />
                        <span>€</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="edit-cost-subscription"
                      name="costModelRadio"
                      value="abo"
                      checked={costModel === 'abo'}
                      onChange={() => setCostModel('abo')}
                      className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="edit-cost-subscription" className="font-normal">Abo-Modell</Label>
                  </div>
                  
                  {costModel === 'abo' && (
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span>ab</span>
                        <Input
                          id="edit-subscriptionPrice"
                          name="subscriptionPrice"
                          type="number"
                          placeholder="Preis in €"
                          className="w-32"
                          min="0"
                          step="0.01"
                          value={subscriptionPrice}
                          onChange={(e) => setSubscriptionPrice(e.target.value)}
                        />
                        <span>€</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          id="edit-subscriptionPeriod"
                          name="subscriptionPeriod"
                          value={subscriptionPeriod}
                          onChange={(e) => setSubscriptionPeriod(e.target.value)}
                          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              </div>
            </div>

            {/* Verfügbarkeit */}
            <div className="space-y-2 bg-white p-6 rounded-lg border">
              <Label htmlFor="edit-available">Verfügbarkeit</Label>
              <select
                id="edit-available"
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
              <Button type="button" variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setLogoUrl('');
                // Reset verstecktes Logo-Feld
                const logoInput = document.getElementById('edit-logo') as HTMLInputElement;
                if (logoInput && editingSoftware) {
                  logoInput.value = editingSoftware.logo || '';
                }
              }}>
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
