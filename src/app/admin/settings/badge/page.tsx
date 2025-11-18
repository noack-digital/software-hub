/* eslint-disable @next/next/no-img-element */
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
  const [isUploadingInhouseLogo, setIsUploadingInhouseLogo] = useState(false);
  const [isFetchingInhouseLogo, setIsFetchingInhouseLogo] = useState(false);
  const [inhouseLogoWebsite, setInhouseLogoWebsite] = useState('');

  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Einstellungen: ${response.status}`);
      }
      const allSettings = await response.json();
      return allSettings.filter((setting: Setting) =>
        [
          'availableBadgeText',
          'showBadges',
          'badgeBackgroundColor',
          'badgeTextColor',
          'showPrivacyIndicator',
          'inhouseLogoUrl',
          'inhouseLogoTooltip',
        ].includes(setting.key)
      );
    },
  });

  useEffect(() => {
    if (settings.length > 0 && !isInitialized) {
      const initialFormData: Record<string, string> = {};
      settings.forEach((setting) => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
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
    onError: (err: any) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = (key: string) => {
    updateSettingMutation.mutate({
      key,
      value: formData[key] || '',
    });
  };

  const handleToggleChange = (key: string, checked: boolean) => {
    const value = checked ? 'true' : 'false';
    setFormData((prev) => ({ ...prev, [key]: value }));
    updateSettingMutation.mutate({ key, value });
  };

  const getSettingFriendlyName = (key: string): string => {
    const nameMap: Record<string, string> = {
      availableBadgeText: 'Text für Verfügbarkeits-Badge',
      showBadges: 'Verfügbarkeits-Badge anzeigen',
      showPrivacyIndicator: 'DSGVO-Ampel anzeigen',
      inhouseLogoUrl: 'Inhouse-Logo',
      inhouseLogoTooltip: 'Tooltip-Text für Inhouse-Logo',
      badgeBackgroundColor: 'Hintergrundfarbe',
      badgeTextColor: 'Textfarbe',
    };
    return nameMap[key] || key;
  };

  const getSettingType = (key: string): 'text' | 'toggle' | 'color' | 'custom' => {
    if (key === 'showBadges' || key === 'showPrivacyIndicator') {
      return 'toggle';
    }
    if (key === 'badgeBackgroundColor' || key === 'badgeTextColor') {
      return 'color';
    }
    if (key === 'inhouseLogoUrl') {
      return 'custom';
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
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['settings'] })} className="mt-4">
          Erneut versuchen
        </Button>
      </div>
    );
  }

  const colorSettings = settings.filter((s) => getSettingType(s.key) === 'color');
  const textSettings = settings.filter((s) => getSettingType(s.key) === 'text');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Badge-Einstellungen</h1>
        <p className="text-gray-500 mt-2">Passen Sie das Erscheinungsbild und Verhalten der Badges an</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Verfügbarkeits-Badge</CardTitle>
          <CardDescription>Aktivieren Sie den Badge oder passen Sie Text und Farben an</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <Label className="font-medium">Verfügbarkeits-Badge anzeigen</Label>
            <Button
              variant={formData.showBadges === 'true' ? 'default' : 'outline'}
              onClick={() => handleToggleChange('showBadges', formData.showBadges !== 'true')}
              className="w-20"
            >
              {formData.showBadges === 'true' ? 'Ein' : 'Aus'}
            </Button>
          </div>

          <div className="grid gap-4">
            {textSettings
              .filter((setting) => setting.key === 'availableBadgeText')
              .map((setting) => (
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
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>DSGVO-Ampel</CardTitle>
          <CardDescription>
            Steuerung der Ampelanzeige und Logo für inhouse gehostete Software
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-2 border-b pb-4">
            <div>
              <Label className="font-medium">DSGVO-Ampel anzeigen</Label>
              <p className="text-sm text-gray-500">Steuert die Anzeige der Ampel im Frontend</p>
            </div>
            <Button
              variant={formData.showPrivacyIndicator === 'true' ? 'default' : 'outline'}
              onClick={() => handleToggleChange('showPrivacyIndicator', formData.showPrivacyIndicator !== 'true')}
              className="w-24"
            >
              {formData.showPrivacyIndicator === 'true' ? 'Ein' : 'Aus'}
            </Button>
          </div>

          <div className="space-y-4">
            {formData.inhouseLogoUrl && (
              <div className="flex flex-wrap items-center gap-4 p-3 border rounded-md">
                <img
                  src={formData.inhouseLogoUrl}
                  alt="Inhouse Logo"
                  className="h-12 w-12 object-contain border border-gray-200 rounded bg-white"
                />
                <div className="flex-1 text-sm text-gray-600 break-all">{formData.inhouseLogoUrl}</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleInputChange('inhouseLogoUrl', '')}>
                    Entfernen
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveSetting('inhouseLogoUrl')}
                    disabled={updateSettingMutation.isPending}
                  >
                    Speichern
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="inhouseLogoFile">Logo hochladen</Label>
              <Input
                id="inhouseLogoFile"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setIsUploadingInhouseLogo(true);
                  try {
                    const allowedTypes = [
                      'image/png',
                      'image/jpeg',
                      'image/jpg',
                      'image/svg+xml',
                      'image/x-icon',
                      'image/vnd.microsoft.icon',
                    ];
                    if (!allowedTypes.includes(file.type)) {
                      toast.error('Ungültiger Dateityp. Erlaubt sind: PNG, JPEG, SVG, ICO');
                      return;
                    }
                    const maxSize = 2 * 1024 * 1024;
                    if (file.size > maxSize) {
                      toast.error('Datei zu groß. Maximale Größe: 2MB');
                      return;
                    }
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    const response = await fetch('/api/software/upload-logo', {
                      method: 'POST',
                      body: uploadData,
                    });
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Fehler beim Hochladen des Logos');
                    }
                    const data = await response.json();
                    setFormData((prev) => ({ ...prev, inhouseLogoUrl: data.logoUrl }));
                    updateSettingMutation.mutate({ key: 'inhouseLogoUrl', value: data.logoUrl });
                    toast.success('Logo erfolgreich gespeichert');
                  } catch (uploadError: any) {
                    toast.error(uploadError.message || 'Fehler beim Hochladen des Logos');
                  } finally {
                    setIsUploadingInhouseLogo(false);
                    event.target.value = '';
                  }
                }}
                disabled={isUploadingInhouseLogo}
              />
            </div>

            <div className="grid gap-2">
              <Label>Logo per Website-URL laden</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={inhouseLogoWebsite}
                  onChange={(e) => setInhouseLogoWebsite(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isFetchingInhouseLogo}
                  onClick={async () => {
                    if (!inhouseLogoWebsite.trim()) {
                      toast.error('Bitte eine Website-URL eingeben');
                      return;
                    }
                    setIsFetchingInhouseLogo(true);
                    try {
                      const response = await fetch('/api/software/fetch-favicon', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ websiteUrl: inhouseLogoWebsite.trim() }),
                      });
                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Fehler beim Herunterladen des Favicons');
                      }
                      const data = await response.json();
                      setFormData((prev) => ({ ...prev, inhouseLogoUrl: data.logoUrl }));
                      updateSettingMutation.mutate({ key: 'inhouseLogoUrl', value: data.logoUrl });
                      toast.success('Logo erfolgreich gespeichert');
                    } catch (faviconError: any) {
                      toast.error(faviconError.message || 'Fehler beim Laden des Favicons');
                    } finally {
                      setIsFetchingInhouseLogo(false);
                    }
                  }}
                >
                  {isFetchingInhouseLogo ? 'Lädt...' : 'Favicon laden'}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Logo-URL manuell setzen</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.inhouseLogoUrl || ''}
                  onChange={(e) => handleInputChange('inhouseLogoUrl', e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => handleSaveSetting('inhouseLogoUrl')}
                  disabled={updateSettingMutation.isPending}
                >
                  Speichern
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inhouseTooltipText">Tooltip-Text für das Inhouse-Logo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="inhouseTooltipText"
                  value={formData.inhouseLogoTooltip || ''}
                  onChange={(e) => handleInputChange('inhouseLogoTooltip', e.target.value)}
                  placeholder="z. B. Diese Software wird intern gehostet."
                />
                <Button
                  size="sm"
                  onClick={() => handleSaveSetting('inhouseLogoTooltip')}
                  disabled={updateSettingMutation.isPending}
                >
                  Speichern
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Dieser Text wird im Frontend beim Hover über das Inhouse-Logo angezeigt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                color: formData.badgeTextColor || '#ffffff',
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

