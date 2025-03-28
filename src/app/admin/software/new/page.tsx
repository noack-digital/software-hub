'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

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
  const [costModel, setCostModel] = useState('kostenlos');
  const [subscriptionPeriod, setSubscriptionPeriod] = useState('monatlich');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
          shortDescription: formData.get('shortDescription'),
          description: formData.get('description'),
          logo: formData.get('logo'),
          types: types,
          categories: selectedCategories, // IDs der ausgewählten Kategorien
          costs: costsInfo,
          features: formData.get('features'),
          alternatives: formData.get('alternatives'),
          notes: formData.get('notes'),
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
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold" style={{ color: '#004d3d' }}>
            Neue Software hinzufügen
          </h1>
          <UserNav />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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

        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
          {/* Grundlegende Informationen */}
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Grundlegende Informationen</h2>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Name der Software *</Label>
              <Input
                id="name"
                name="name"
                placeholder="z.B. Microsoft Word"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Kurze Beschreibung der Software und ihrer Hauptfunktionen"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="z.B. https://www.microsoft.com/word"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                placeholder="URL zum Logo der Software"
              />
            </div>
          </div>

          {/* Kategorisierung */}
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Kategorisierung</h2>
            
            <div className="grid gap-2">
              <Label>Typ</Label>
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

          {/* Zusätzliche Informationen */}
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Zusätzliche Informationen</h2>
            
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
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Anmerkungen</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Zusätzliche Anmerkungen oder Hinweise"
              />
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
      </main>
    </div>
  );
}
