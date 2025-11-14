'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Einstellungen abrufen
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        console.log("Starte API-Anfrage für Einstellungen");
        setDebugInfo(prev => prev + "\nStarte API-Anfrage für Einstellungen");
        
        const response = await fetch('/api/settings');
        setDebugInfo(prev => prev + `\nAPI-Antwort Status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          setDebugInfo(prev => prev + `\nAPI-Fehler: ${errorText}`);
          throw new Error(`Fehler beim Laden der Einstellungen: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        // Filtere die Badge-Einstellungen heraus, da diese auf einer separaten Seite verwaltet werden
        const filteredData = data.filter((setting: Setting) => 
          !['availableBadgeText', 'showBadges', 'badgeBackgroundColor', 'badgeTextColor'].includes(setting.key)
        );
        setDebugInfo(prev => prev + `\nErhaltene Daten: ${JSON.stringify(filteredData).substring(0, 100)}...`);
        return filteredData;
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
        setDebugInfo(prev => prev + `\nException: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });

  // Einstellungen in das Formular laden - nur wenn sich settings ändert und noch nicht initialisiert wurde
  useEffect(() => {
    if (settings && settings.length > 0 && !isInitialized) {
      const initialFormData: Record<string, string> = {};
      settings.forEach((setting) => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
      setIsInitialized(true);
      setDebugInfo(prev => prev + `\nFormular initialisiert mit ${settings.length} Einstellungen`);
    }
  }, [settings, isInitialized]);

  // Einstellung aktualisieren
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      try {
        setDebugInfo(prev => prev + `\nUpdate-Anfrage für ${key}=${value}`);
        const response = await fetch('/api/settings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value,
          }),
        });

        setDebugInfo(prev => prev + `\nUpdate-Antwort Status: ${response.status}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          setDebugInfo(prev => prev + `\nUpdate-Fehler: ${JSON.stringify(errorData)}`);
          throw new Error(errorData.error || 'Fehler beim Aktualisieren der Einstellung');
        }

        return response.json();
      } catch (error) {
        setDebugInfo(prev => prev + `\nUpdate-Exception: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Einstellung erfolgreich aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Formularänderungen verarbeiten
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Einstellung speichern
  const handleSaveSetting = (key: string) => {
    updateSettingMutation.mutate({
      key,
      value: formData[key] || '',
    });
  };

  // Toggle-Änderung verarbeiten
  const handleToggleChange = (key: string, checked: boolean) => {
    const value = checked ? 'true' : 'false';
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // Automatisch speichern bei Toggle
    updateSettingMutation.mutate({
      key,
      value,
    });
  };

  // Beschreibung für Einstellungen
  const getSettingDescription = (key: string): string => {
    const setting = settings.find((s) => s.key === key);
    return setting?.description || '';
  };

  // Benutzerfreundlicher Name für Einstellungen
  const getSettingFriendlyName = (key: string): string => {
    const nameMap: Record<string, string> = {
      availableBadgeText: 'Text für Verfügbarkeits-Badge',
      showBadges: 'Badges anzeigen',
      badgeBackgroundColor: 'Badge-Hintergrundfarbe',
      badgeTextColor: 'Badge-Textfarbe',
    };
    return nameMap[key] || key;
  };

  // Bestimme den Typ der Einstellung
  const getSettingType = (key: string): 'text' | 'toggle' | 'color' => {
    if (key === 'showBadges') {
      return 'toggle';
    } else if (key === 'badgeBackgroundColor' || key === 'badgeTextColor') {
      return 'color';
    }
    return 'text';
  };

  // Rendere das entsprechende Eingabefeld basierend auf dem Einstellungstyp
  const renderInputField = (setting: Setting) => {
    const type = getSettingType(setting.key);
    
    switch (type) {
      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant={formData[setting.key] === 'true' ? 'default' : 'outline'}
              onClick={() => handleToggleChange(setting.key, formData[setting.key] !== 'true')}
              className="w-20"
            >
              {formData[setting.key] === 'true' ? 'Ein' : 'Aus'}
            </Button>
            <Label htmlFor={`setting-${setting.key}`}>
              {formData[setting.key] === 'true' ? 'Aktiviert' : 'Deaktiviert'}
            </Label>
          </div>
        );
      case 'color':
        return (
          <div className="grid gap-2">
            <Label htmlFor={`setting-${setting.key}`}>Farbe</Label>
            <div className="flex gap-4 items-center">
              <Input
                id={`setting-${setting.key}`}
                type="color"
                value={formData[setting.key] || '#000000'}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={formData[setting.key] || '#000000'}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid gap-2">
            <Label htmlFor={`setting-${setting.key}`}>Wert</Label>
            <Input
              id={`setting-${setting.key}`}
              value={formData[setting.key] || ''}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
            />
          </div>
        );
    }
  };

  if (isLoading) {
    return <div className="p-8">Lade Einstellungen...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">Fehler beim Laden der Einstellungen</div>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Debug-Informationen:</h3>
          <pre className="whitespace-pre-wrap text-xs">{error instanceof Error ? error.message : String(error)}</pre>
          <pre className="whitespace-pre-wrap text-xs mt-2">{debugInfo}</pre>
        </div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['settings'] })}
          className="mt-4"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-gray-500 mt-2">Verwalten Sie die Anwendungseinstellungen</p>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Badge-Einstellungen</h2>
          <p className="text-blue-600 mb-3">
            Die Einstellungen für Badges (Verfügbarkeits-Anzeige, Farben, etc.) wurden auf eine separate Seite verschoben.
          </p>
          <a 
            href="/admin/settings/badge" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Zu den Badge-Einstellungen
          </a>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h2 className="text-lg font-semibold text-green-700 mb-2">Link-Einstellungen</h2>
          <p className="text-green-600 mb-3">
            Verwalten Sie die Links im Footer (Impressum, Datenschutz) und deren Verhalten.
          </p>
          <a 
            href="/admin/settings/links" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Zu den Link-Einstellungen
          </a>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
          <h2 className="text-lg font-semibold text-purple-700 mb-2">KI-Einstellungen</h2>
          <p className="text-purple-600 mb-3">
            Konfigurieren Sie die KI-Funktionen für automatisches Ausfüllen von Software-Formularen.
          </p>
          <a 
            href="/admin/settings/ai" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Zu den KI-Einstellungen
          </a>
        </div>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle>{getSettingFriendlyName(setting.key)}</CardTitle>
              {setting.description && (
                <CardDescription>{setting.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {renderInputField(setting)}
              </div>
            </CardContent>
            <CardFooter>
              {getSettingType(setting.key) !== 'toggle' && (
                <Button 
                  onClick={() => handleSaveSetting(setting.key)}
                  disabled={formData[setting.key] === setting.value}
                >
                  Speichern
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
