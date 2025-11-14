'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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

export default function MiscSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Sonstige Einstellungen abrufen
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Einstellungen: ${response.status}`);
      }
      const allSettings = await response.json();
      // Filtere nur die relevanten Einstellungen
      return allSettings.filter((setting: Setting) => 
        ['stickyHeader', 'showLogos'].includes(setting.key)
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
    } else if (settings.length === 0 && !isInitialized) {
      // Standardwerte setzen, wenn keine Einstellungen gefunden wurden
      setFormData({
        stickyHeader: 'true',
        showLogos: 'true'
      });
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
      toast.success('Einstellung erfolgreich aktualisiert');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

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

  // Einstellungen erstellen, falls sie noch nicht existieren
  useEffect(() => {
    const createDefaultSettings = async () => {
      if (isInitialized) {
        const defaultSettings = [
          { key: 'stickyHeader', value: 'true', description: 'Sticky Header im Frontend' },
          { key: 'showLogos', value: 'true', description: 'Zeigt Logos/Favicons vor Software-Namen an' }
        ];
        
        for (const defaultSetting of defaultSettings) {
          const exists = settings.some((s: Setting) => s.key === defaultSetting.key);
          if (!exists) {
            try {
              await fetch('/api/settings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(defaultSetting),
              });
            } catch (error) {
              console.error(`Fehler beim Erstellen der Einstellung ${defaultSetting.key}:`, error);
            }
          }
        }
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      }
    };
    createDefaultSettings();
  }, [isInitialized, settings, queryClient]);

  // Benutzerfreundlicher Name für Einstellungen
  const getSettingFriendlyName = (key: string): string => {
    const nameMap: Record<string, string> = {
      stickyHeader: 'Sticky Header im Frontend',
      showLogos: 'Logos anzeigen',
    };
    return nameMap[key] || key;
  };

  // Benutzerfreundliche Beschreibung für Einstellungen
  const getSettingDescription = (key: string): string => {
    const descriptionMap: Record<string, string> = {
      stickyHeader: 'Wenn aktiviert, bleibt der Header beim Scrollen oben fixiert.',
      showLogos: 'Zeigt Logos/Favicons vor Software-Namen im Frontend und Admin-Bereich an.',
    };
    return descriptionMap[key] || '';
  };

  if (isLoading) {
    return <div className="p-8">Lade Einstellungen...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">Fehler beim Laden der Einstellungen</div>
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
        <h1 className="text-3xl font-bold">Sonstige Einstellungen</h1>
        <p className="text-gray-500 mt-2">Weitere Einstellungen für den Software Hub</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Layout-Einstellungen</CardTitle>
          <CardDescription>Passen Sie das Layout des Software Hubs an</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="setting-stickyHeader" className="font-medium">
                  {getSettingFriendlyName('stickyHeader')}
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  {getSettingDescription('stickyHeader')}
                </p>
              </div>
              <Button
                variant={formData.stickyHeader === 'true' ? 'default' : 'outline'}
                onClick={() => handleToggleChange('stickyHeader', formData.stickyHeader !== 'true')}
                className="w-20"
              >
                {formData.stickyHeader === 'true' ? 'Ein' : 'Aus'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-2 border-t pt-4">
              <div>
                <Label htmlFor="setting-showLogos" className="font-medium">
                  {getSettingFriendlyName('showLogos')}
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  {getSettingDescription('showLogos')}
                </p>
              </div>
              <Button
                variant={formData.showLogos === 'true' ? 'default' : 'outline'}
                onClick={() => handleToggleChange('showLogos', formData.showLogos !== 'true')}
                className="w-20"
              >
                {formData.showLogos === 'true' ? 'Ein' : 'Aus'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}