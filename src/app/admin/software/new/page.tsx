'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, Download, Upload, X } from 'lucide-react';

// Typen für die Kategorien
interface Category {
  id: string;
  name: string;
  description: string | null;
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

export default function NewSoftwarePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isFetchingFavicon, setIsFetchingFavicon] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [costModel, setCostModel] = useState('kostenlos');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('monatlich');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>([]);

  // Prüfe ob API-Key vorhanden ist
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Prüfe direkt Settings, ob ein API-Key vorhanden ist
        const settingsResponse = await fetch('/api/settings?key=geminiApiKey');
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const hasKey = settingsData.value && settingsData.value.trim().length > 0;
          setHasValidApiKey(hasKey);
          
          // Optional: Teste auch ob der Key funktioniert (aber zeige Button trotzdem)
          if (hasKey) {
            try {
              const testResponse = await fetch('/api/ai/test-key');
              if (testResponse.ok) {
                const testData = await testResponse.json();
                // Button wird angezeigt wenn Key vorhanden ist, auch wenn Test fehlschlägt
                // Der Benutzer kann dann selbst sehen, ob der Key funktioniert
              }
            } catch (testError) {
              // Ignoriere Test-Fehler, Button wird trotzdem angezeigt
              console.log('API-Key-Test nicht möglich, aber Key vorhanden');
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des API-Keys:', error);
        setHasValidApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  // Kategorien aus der API laden
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Kategorien');
      }
      return response.json();
    },
  });

  // Zielgruppen aus der API laden
  const { data: targetGroups = [], isLoading: isLoadingTargetGroups } = useQuery<Category[]>({
    queryKey: ['target-groups'],
    queryFn: async () => {
      const response = await fetch('/api/target-groups');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zielgruppen');
      }
      return response.json();
    },
  });

  // Funktion zum Umschalten eines Typs
  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId) 
        : [...prev, typeId]
    );
  };

  // Funktion zum Umschalten einer Kategorie
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Funktion zum Umschalten einer Zielgruppe
  const toggleTargetGroup = (targetGroupId: string) => {
    setSelectedTargetGroups(prev => 
      prev.includes(targetGroupId) 
        ? prev.filter(id => id !== targetGroupId) 
        : [...prev, targetGroupId]
    );
  };

  // Logo-Upload Funktion
  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validiere Dateityp
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Ungültiger Dateityp. Erlaubt sind: PNG, JPEG, SVG, ICO');
      return;
    }

    // Validiere Dateigröße (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
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
      // Setze Logo-URL in verstecktem Input-Feld
      const logoInput = document.getElementById('logo') as HTMLInputElement;
      if (logoInput) {
        logoInput.value = data.logoUrl;
      }
      setLogoUrl(data.logoUrl);
      toast.success('Logo erfolgreich hochgeladen');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Logo entfernen
  const handleRemoveLogo = () => {
    const logoInput = document.getElementById('logo') as HTMLInputElement;
    if (logoInput) {
      logoInput.value = '';
    }
    setLogoUrl('');
  };

  // Favicon-Download Funktion
  const handleFetchFavicon = async () => {
    const websiteField = document.getElementById('website') as HTMLInputElement;
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
      // Setze Logo-URL in verstecktem Input-Feld
      const logoInput = document.getElementById('logo') as HTMLInputElement;
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

  // KI-Funktion zum Ausfüllen des Formulars
  const handleAIFill = async () => {
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const softwareName = nameInput?.value?.trim();

    if (!softwareName) {
      toast.error('Bitte geben Sie zuerst den Namen der Software ein');
      return;
    }

    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/fill-software', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ softwareName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler bei der KI-Anfrage');
      }

      const data = await response.json();

      // Deutsche Felder ausfüllen
      const shortDescriptionField = document.getElementById('shortDescription') as HTMLTextAreaElement;
      const descriptionField = document.getElementById('description') as HTMLTextAreaElement;
      const websiteField = document.getElementById('website') as HTMLInputElement;
      const featuresField = document.getElementById('features') as HTMLTextAreaElement;
      const alternativesField = document.getElementById('alternatives') as HTMLTextAreaElement;
      const notesField = document.getElementById('notes') as HTMLTextAreaElement;

      if (shortDescriptionField) shortDescriptionField.value = data.shortDescription || '';
      if (descriptionField) descriptionField.value = data.description || '';
      if (websiteField) websiteField.value = data.url || '';
      if (featuresField) featuresField.value = data.features || '';
      if (alternativesField) alternativesField.value = data.alternatives || '';
      if (notesField) notesField.value = data.notes || '';

      // Englische Felder ausfüllen
      const shortDescriptionEnField = document.getElementById('shortDescriptionEn') as HTMLTextAreaElement;
      const descriptionEnField = document.getElementById('descriptionEn') as HTMLTextAreaElement;
      const featuresEnField = document.getElementById('featuresEn') as HTMLTextAreaElement;
      const alternativesEnField = document.getElementById('alternativesEn') as HTMLTextAreaElement;
      const notesEnField = document.getElementById('notesEn') as HTMLTextAreaElement;

      if (shortDescriptionEnField) shortDescriptionEnField.value = data.shortDescriptionEn || '';
      if (descriptionEnField) descriptionEnField.value = data.descriptionEn || '';
      if (featuresEnField) featuresEnField.value = data.featuresEn || '';
      if (alternativesEnField) alternativesEnField.value = data.alternativesEn || '';
      if (notesEnField) notesEnField.value = data.notesEn || '';

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
  };

  // Mutation zum Erstellen einer neuen Software
  const createSoftwareMutation = useMutation({
    mutationFn: async (formData: FormData) => {
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

      // Ausgewählte Typen
      const types = selectedTypes;

      const response = await fetch('/api/software', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          url: formData.get('website'),
          shortDescription: formData.get('shortDescription') || formData.get('description')?.toString().substring(0, 150) || '',
          description: formData.get('description'),
          logo: formData.get('logo') as string || '',
          types: types,
          targetGroups: selectedTargetGroups, // IDs der ausgewählten Zielgruppen
          categories: selectedCategories, // IDs der ausgewählten Kategorien
          costs: costsInfo,
          features: formData.get('features'),
          alternatives: formData.get('alternatives'),
          notes: formData.get('notes'),
          // Englische Felder
          shortDescriptionEn: formData.get('shortDescriptionEn'),
          descriptionEn: formData.get('descriptionEn'),
          featuresEn: formData.get('featuresEn'),
          alternativesEn: formData.get('alternativesEn'),
          notesEn: formData.get('notesEn'),
          available: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen der Software');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['software'] });
      toast.success('Software erfolgreich erstellt');
      router.push('/admin/software');
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Kostenmodell-Informationen hinzufügen
    formData.append('costModel', costModel);
    formData.append('subscriptionPeriod', subscriptionPeriod);
    
    try {
      await createSoftwareMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Fehler beim Erstellen der Software:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#004d3d' }}>
          Neue Software hinzufügen
        </h1>
      </div>

      <div className="container mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/software')}
            className="text-sm font-medium hover:text-gray-900 flex items-center"
            style={{ color: '#004d3d' }}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück zur Übersicht
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
          {/* Verstecktes Logo-Feld */}
          <input type="hidden" id="logo" name="logo" />
          
          {/* Grundlegende Informationen */}
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Grundlegende Informationen</h2>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Name der Software *</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  name="name"
                  placeholder="z.B. Microsoft Word"
                  required
                  className="flex-1"
                />
                {hasValidApiKey && (
                  <Button
                    type="button"
                    onClick={handleAIFill}
                    disabled={isAILoading}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isAILoading ? 'Lädt...' : 'Mit KI befüllen lassen'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {hasValidApiKey 
                  ? 'Geben Sie den Namen ein und klicken Sie auf den Button, um die Felder automatisch auszufüllen.'
                  : 'Geben Sie den Namen der Software ein. Um die KI-Funktion zu nutzen, konfigurieren Sie bitte einen API-Key in den Einstellungen.'
                }
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex gap-2">
                <Input
                  id="website"
                  name="website"
                  placeholder="z.B. https://www.microsoft.com/word"
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
              <p className="text-xs text-gray-500">
                Geben Sie die Website-URL ein und klicken Sie auf den Button, um das Favicon automatisch herunterzuladen.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="logoFile"
                  name="logoFile"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                  onChange={handleUploadLogo}
                  disabled={isUploadingLogo}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('logoFile')?.click()}
                  disabled={isUploadingLogo}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingLogo ? 'Lädt...' : 'Logo hochladen'}
                </Button>
              </div>
              {logoUrl && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={logoUrl} 
                      alt="Logo Vorschau" 
                      className="h-12 w-12 object-contain border border-gray-200 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-green-700">Logo geladen</p>
                      <p className="text-xs text-green-600 font-mono">{logoUrl}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveLogo}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Laden Sie ein Logo hoch oder verwenden Sie den Favicon-Download von der Website.
              </p>
            </div>
          </div>

          {/* Deutsch/Englisch nebeneinander */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Linke Spalte: Deutsche Felder */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-green-700">Deutsche Felder</h2>
              
              <div className="grid gap-2">
                <Label htmlFor="shortDescription">Kurzbeschreibung</Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  placeholder="Kurze Beschreibung für die Kartenansicht"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Detaillierte Beschreibung der Software und ihrer Hauptfunktionen"
                  required
                  rows={5}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="features">Hauptfunktionen</Label>
                <Textarea
                  id="features"
                  name="features"
                  placeholder="Liste der wichtigsten Funktionen (eine pro Zeile)"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="alternatives">Alternativen</Label>
                <Textarea
                  id="alternatives"
                  name="alternatives"
                  placeholder="Alternative Software-Lösungen (eine pro Zeile)"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Anmerkungen</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Zusätzliche Anmerkungen oder Hinweise"
                  rows={3}
                />
              </div>
            </div>

            {/* Rechte Spalte: Englische Felder */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Englische Felder (optional)</h2>
              
              <div className="grid gap-2">
                <Label htmlFor="shortDescriptionEn">Short Description (English)</Label>
                <Textarea
                  id="shortDescriptionEn"
                  name="shortDescriptionEn"
                  placeholder="Short description for card view"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="descriptionEn">Description (English)</Label>
                <Textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  placeholder="Detailed description in English"
                  rows={5}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="featuresEn">Features (English)</Label>
                <Textarea
                  id="featuresEn"
                  name="featuresEn"
                  placeholder="List of main features (one per line)"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="alternativesEn">Alternatives (English)</Label>
                <Textarea
                  id="alternativesEn"
                  name="alternativesEn"
                  placeholder="Alternative software solutions (one per line)"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notesEn">Notes (English)</Label>
                <Textarea
                  id="notesEn"
                  name="notesEn"
                  placeholder="Additional notes or hints in English"
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
                      id={`type-${type.id}`}
                      checked={selectedTypes.includes(type.id)}
                      onCheckedChange={() => toggleType(type.id)}
                    />
                    <Label htmlFor={`type-${type.id}`} className="font-normal cursor-pointer">
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Kategorien</Label>
              {isLoadingCategories ? (
                <div>Kategorien werden geladen...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="font-normal cursor-pointer">
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
                  {targetGroups && targetGroups.length > 0 ? (
                    targetGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`targetGroup-${group.id}`}
                          checked={selectedTargetGroups.includes(group.id)}
                          onCheckedChange={() => toggleTargetGroup(group.id)}
                        />
                        <Label htmlFor={`targetGroup-${group.id}`} className="font-normal cursor-pointer">
                          {group.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Keine Zielgruppen verfügbar</div>
                  )}
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
                  id="cost-free"
                  name="costModelRadio"
                  value="kostenlos"
                  checked={costModel === 'kostenlos'}
                  onChange={() => setCostModel('kostenlos')}
                  className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="cost-free" className="font-normal">Kostenlos</Label>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cost-license"
                    name="costModelRadio"
                    value="einmalig"
                    checked={costModel === 'einmalig'}
                    onChange={() => setCostModel('einmalig')}
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="cost-license" className="font-normal">Einmalige Lizenzkosten</Label>
                </div>
                
                {costModel === 'einmalig' && (
                  <div className="pl-6">
                    <div className="flex items-center space-x-2">
                      <Input
                        id="licensePrice"
                        name="licensePrice"
                        type="number"
                        placeholder="Preis in €"
                        className="w-32"
                        min="0"
                        step="0.01"
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
                    id="cost-subscription"
                    name="costModelRadio"
                    value="abo"
                    checked={costModel === 'abo'}
                    onChange={() => setCostModel('abo')}
                    className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="cost-subscription" className="font-normal">Abo-Modell</Label>
                </div>
                
                {costModel === 'abo' && (
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>ab</span>
                      <Input
                        id="subscriptionPrice"
                        name="subscriptionPrice"
                        type="number"
                        placeholder="Preis in €"
                        className="w-32"
                        min="0"
                        step="0.01"
                      />
                      <span>€</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select
                        id="subscriptionPeriod"
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


          {/* Submit-Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              style={{ backgroundColor: '#004d3d' }}
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Software speichern'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
