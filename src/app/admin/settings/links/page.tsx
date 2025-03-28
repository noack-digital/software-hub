'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function LinksSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Einstellungen abrufen
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Einstellungen');
      }
      const data = await response.json();
      // Filtere nur die Link-bezogenen Einstellungen
      const linkSettings = data.filter((setting: Setting) => 
        ['impressumUrl', 'datenschutzUrl', 'openLinksInNewTab', 'showFooterLinks'].includes(setting.key)
      );
      
      // Erstelle fehlende Einstellungen, falls sie noch nicht existieren
      const requiredSettings = [
        { key: 'impressumUrl', value: '/impressum', description: 'URL zur Impressum-Seite' },
        { key: 'datenschutzUrl', value: '/datenschutz', description: 'URL zur Datenschutz-Seite' },
        { key: 'openLinksInNewTab', value: 'false', description: 'Links in neuem Tab öffnen' },
        { key: 'showFooterLinks', value: 'true', description: 'Footer-Links anzeigen' }
      ];
      
      for (const requiredSetting of requiredSettings) {
        if (!linkSettings.some(s => s.key === requiredSetting.key)) {
          // Einstellung existiert noch nicht, erstelle sie
          await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requiredSetting),
          });
        }
      }
      
      // Lade Einstellungen erneut, falls neue erstellt wurden
      if (linkSettings.length < requiredSettings.length) {
        const refreshResponse = await fetch('/api/settings');
        const refreshData = await refreshResponse.json();
        return refreshData.filter((setting: Setting) => 
          ['impressumUrl', 'datenschutzUrl', 'openLinksInNewTab', 'showFooterLinks'].includes(setting.key)
        );
      }
      
      return linkSettings;
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

  // Benutzerfreundlicher Name für Einstellungen
  const getSettingFriendlyName = (key: string): string => {
    const nameMap: Record<string, string> = {
      impressumUrl: 'Impressum URL',
      datenschutzUrl: 'Datenschutz URL',
      openLinksInNewTab: 'Links in neuem Tab öffnen',
      showFooterLinks: 'Footer-Links anzeigen',
    };
    return nameMap[key] || key;
  };

  // Beschreibung für Einstellungen
  const getSettingDescription = (key: string): string => {
    const descriptionMap: Record<string, string> = {
      impressumUrl: 'Die URL zur Impressum-Seite. Kann eine relative URL (z.B. /impressum) oder eine absolute URL (z.B. https://example.com/impressum) sein.',
      datenschutzUrl: 'Die URL zur Datenschutz-Seite. Kann eine relative URL (z.B. /datenschutz) oder eine absolute URL (z.B. https://example.com/datenschutz) sein.',
      openLinksInNewTab: 'Wenn aktiviert, werden die Footer-Links in einem neuen Tab geöffnet.',
      showFooterLinks: 'Wenn aktiviert, werden die Links zu Impressum und Datenschutz im Footer angezeigt.',
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Einstellungen
          </Button>
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-semibold">Link-Einstellungen</h1>
        <p className="text-gray-500 mt-1">Verwalten Sie die Links im Footer der Anwendung</p>
      </div>

      <div className="grid gap-6">
        {/* URL-Einstellungen */}
        <Card>
          <CardHeader>
            <CardTitle>Link-URLs</CardTitle>
            <CardDescription>Definieren Sie die URLs für die Footer-Links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Impressum URL */}
            <div className="space-y-2">
              <Label htmlFor="impressumUrl">Impressum URL</Label>
              <Input
                id="impressumUrl"
                value={formData.impressumUrl || ''}
                onChange={(e) => handleInputChange('impressumUrl', e.target.value)}
                placeholder="/impressum"
              />
              <p className="text-sm text-gray-500">{getSettingDescription('impressumUrl')}</p>
            </div>
            
            {/* Datenschutz URL */}
            <div className="space-y-2">
              <Label htmlFor="datenschutzUrl">Datenschutz URL</Label>
              <Input
                id="datenschutzUrl"
                value={formData.datenschutzUrl || ''}
                onChange={(e) => handleInputChange('datenschutzUrl', e.target.value)}
                placeholder="/datenschutz"
              />
              <p className="text-sm text-gray-500">{getSettingDescription('datenschutzUrl')}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                handleSaveSetting('impressumUrl');
                handleSaveSetting('datenschutzUrl');
              }}
            >
              URLs speichern
            </Button>
          </CardFooter>
        </Card>

        {/* Link-Verhalten */}
        <Card>
          <CardHeader>
            <CardTitle>Link-Verhalten</CardTitle>
            <CardDescription>Konfigurieren Sie das Verhalten der Footer-Links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Links in neuem Tab öffnen */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="openLinksInNewTab"
                checked={formData.openLinksInNewTab === 'true'}
                onCheckedChange={(checked) => 
                  handleToggleChange('openLinksInNewTab', checked === true)
                }
              />
              <div className="grid gap-1.5">
                <Label htmlFor="openLinksInNewTab">Links in neuem Tab öffnen</Label>
                <p className="text-sm text-gray-500">{getSettingDescription('openLinksInNewTab')}</p>
              </div>
            </div>
            
            {/* Footer-Links anzeigen */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFooterLinks"
                checked={formData.showFooterLinks === 'true'}
                onCheckedChange={(checked) => 
                  handleToggleChange('showFooterLinks', checked === true)
                }
              />
              <div className="grid gap-1.5">
                <Label htmlFor="showFooterLinks">Footer-Links anzeigen</Label>
                <p className="text-sm text-gray-500">{getSettingDescription('showFooterLinks')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
