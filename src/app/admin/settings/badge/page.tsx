'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BadgeSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Badge-Einstellungen abrufen
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Einstellungen: ${response.status}`);
      }
      const allSettings = await response.json();
      // Filtere nur die Badge-Einstellungen
      return allSettings.filter((setting: Setting) => 
        ['availableBadgeText', 'showBadges', 'badgeBackgroundColor', 'badgeTextColor'].includes(setting.key)
      );
    },
  });

  // Einstellungen in das Formular laden
  useEffect(() => {
    if (settings && settings.length > 0 && !isInitialized) {
      const initialFormData: Record<string, string> = {};
      settings.forEach((setting) => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  // Einstellung aktualisieren
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Aktualisieren der Einstellung');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Badge-Einstellung erfolgreich aktualisiert');
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

  // Benutzerfreundlicher Name für Einstellungen
  const getSettingFriendlyName = (key: string): string => {
    const nameMap: Record<string, string> = {
      availableBadgeText: 'Text für Verfügbarkeits-Badge',
      showBadges: 'Badges anzeigen',
      badgeBackgroundColor: 'Hintergrundfarbe',
      badgeTextColor: 'Textfarbe',
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

  if (isLoading) {
    return <div className="p-8">Lade Badge-Einstellungen...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">Fehler beim Laden der Badge-Einstellungen</div>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['settings'] })}
          className="mt-4"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // Gruppiere die Einstellungen nach Typ
  const toggleSettings = settings.filter(s => getSettingType(s.key) === 'toggle');
  const colorSettings = settings.filter(s => getSettingType(s.key) === 'color');
  const textSettings = settings.filter(s => getSettingType(s.key) === 'text');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Badge-Einstellungen</h1>
        <p className="text-gray-500 mt-2">Passen Sie das Erscheinungsbild und Verhalten der Badges an</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Allgemeine Badge-Einstellungen</CardTitle>
          <CardDescription>Aktivieren oder deaktivieren Sie die Anzeige von Badges</CardDescription>
        </CardHeader>
        <CardContent>
          {toggleSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between py-2">
              <Label htmlFor={`setting-${setting.key}`} className="font-medium">
                {getSettingFriendlyName(setting.key)}
              </Label>
              <Button
                variant={formData[setting.key] === 'true' ? 'default' : 'outline'}
                onClick={() => handleToggleChange(setting.key, formData[setting.key] !== 'true')}
                className="w-20"
              >
                {formData[setting.key] === 'true' ? 'Ein' : 'Aus'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Badge-Text</CardTitle>
          <CardDescription>Passen Sie den Text an, der auf dem Badge angezeigt wird</CardDescription>
        </CardHeader>
        <CardContent>
          {textSettings.map((setting) => (
            <div key={setting.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`setting-${setting.key}`} className="font-medium">
                  {getSettingFriendlyName(setting.key)}
                </Label>
                <Button 
                  onClick={() => handleSaveSetting(setting.key)}
                  disabled={formData[setting.key] === setting.value}
                  size="sm"
                >
                  Speichern
                </Button>
              </div>
              <Input
                id={`setting-${setting.key}`}
                value={formData[setting.key] || ''}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badge-Farben</CardTitle>
          <CardDescription>Passen Sie die Farben der Badges an</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorSettings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`setting-${setting.key}`} className="font-medium">
                    {getSettingFriendlyName(setting.key)}
                  </Label>
                  <Button 
                    onClick={() => handleSaveSetting(setting.key)}
                    disabled={formData[setting.key] === setting.value}
                    size="sm"
                  >
                    Speichern
                  </Button>
                </div>
                <div className="flex gap-3 items-center">
                  <Input
                    id={`setting-${setting.key}`}
                    type="color"
                    value={formData[setting.key] || '#000000'}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    type="text"
                    value={formData[setting.key] || '#000000'}
                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vorschau */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Badge-Vorschau</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 bg-gray-100 rounded-md">
            <div 
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: formData.badgeBackgroundColor || '#22c55e',
                color: formData.badgeTextColor || '#ffffff'
              }}
            >
              {formData.availableBadgeText || 'Verfügbar'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
