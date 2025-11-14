'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ExternalLink, ArrowLeft, CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AISettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ valid: boolean; hasKey: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  // AI-Einstellungen abrufen
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Fehler beim Laden der Einstellungen: ${response.status}`);
      }
      const allSettings = await response.json();
      // Filtere nur die AI-Einstellungen
      return allSettings.filter((setting: Setting) => 
        ['geminiApiKey', 'aiDescriptionWords', 'aiShortDescriptionWords', 'aiAlternativesCount'].includes(setting.key)
      );
    },
  });

  // Einstellungen in das Formular laden
  useEffect(() => {
    // API-Key-Status prüfen
    const checkApiKeyStatus = async () => {
      setIsTestingKey(true);
      try {
        const response = await fetch('/api/ai/test-key');
        if (response.ok) {
          const data = await response.json();
          setApiKeyStatus(data);
        } else {
          setApiKeyStatus({ valid: false, hasKey: false, message: 'Fehler beim Prüfen des API-Keys' });
        }
      } catch (error) {
        console.error('Fehler beim Prüfen des API-Keys:', error);
        setApiKeyStatus({ valid: false, hasKey: false, message: 'Fehler beim Prüfen des API-Keys' });
      } finally {
        setIsTestingKey(false);
      }
    };

    if (settings && settings.length > 0 && !isInitialized) {
      const initialFormData: Record<string, string> = {};
      settings.forEach((setting) => {
        initialFormData[setting.key] = setting.value;
      });
      setFormData(initialFormData);
      setIsInitialized(true);
      
      // Prüfe API-Key-Status wenn Key vorhanden
      if (initialFormData['geminiApiKey'] && initialFormData['geminiApiKey'].trim().length > 0) {
        checkApiKeyStatus();
      } else {
        setApiKeyStatus({ valid: false, hasKey: false, message: 'Kein API-Key konfiguriert' });
      }
    } else if (settings.length === 0 && !isInitialized) {
      // Standardwerte setzen, wenn keine Einstellungen gefunden wurden
      setFormData({
        geminiApiKey: '',
        aiDescriptionWords: '100',
        aiShortDescriptionWords: '20',
        aiAlternativesCount: '5'
      });
      setIsInitialized(true);
      setApiKeyStatus({ valid: false, hasKey: false, message: 'Kein API-Key konfiguriert' });
    }
  }, [settings, isInitialized]);

  // API-Key-Status prüfen (für manuelle Prüfung)
  const checkApiKeyStatus = async () => {
    setIsTestingKey(true);
    try {
      const response = await fetch('/api/ai/test-key');
      if (response.ok) {
        const data = await response.json();
        setApiKeyStatus(data);
      } else {
        setApiKeyStatus({ valid: false, hasKey: false, message: 'Fehler beim Prüfen des API-Keys' });
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des API-Keys:', error);
      setApiKeyStatus({ valid: false, hasKey: false, message: 'Fehler beim Prüfen des API-Keys' });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Einstellungen erstellen, falls sie noch nicht existieren
  useEffect(() => {
    const createDefaultSettings = async () => {
      if (isInitialized) {
        const defaultSettings = [
          { key: 'geminiApiKey', value: '', description: 'Google Gemini API-Schlüssel für KI-Funktionen' },
          { key: 'aiDescriptionWords', value: '100', description: 'Anzahl Wörter für die ausführliche Beschreibung' },
          { key: 'aiShortDescriptionWords', value: '20', description: 'Anzahl Wörter für die Kurzbeschreibung' },
          { key: 'aiAlternativesCount', value: '5', description: 'Anzahl der Alternativen, die aufgelistet werden sollen' }
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

  // Einstellung aktualisieren oder erstellen
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Prüfen ob Einstellung existiert
      const existingSetting = settings.find((s: Setting) => s.key === key);
      
      if (existingSetting) {
        // Aktualisieren
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
      } else {
        // Erstellen
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value,
            description: 
              key === 'geminiApiKey' ? 'Google Gemini API-Schlüssel für KI-Funktionen' :
              key === 'aiDescriptionWords' ? 'Anzahl Wörter für die ausführliche Beschreibung' :
              key === 'aiShortDescriptionWords' ? 'Anzahl Wörter für die Kurzbeschreibung' :
              key === 'aiAlternativesCount' ? 'Anzahl der Alternativen, die aufgelistet werden sollen' :
              '',
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fehler beim Erstellen der Einstellung');
        }

        return response.json();
      }
    },
    onSuccess: () => {
      toast.success('Einstellung erfolgreich gespeichert');
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
    }, {
      onSuccess: () => {
        // Prüfe API-Key-Status nach dem Speichern
        if (key === 'geminiApiKey') {
          setTimeout(() => {
            checkApiKeyStatus();
          }, 500);
        }
      }
    });
  };

  // API-Key löschen
  const handleDeleteApiKey = () => {
    if (window.confirm('Möchten Sie den API-Key wirklich löschen?')) {
      updateSettingMutation.mutate({
        key: 'geminiApiKey',
        value: '',
      }, {
        onSuccess: () => {
          setFormData(prev => ({ ...prev, geminiApiKey: '' }));
          setApiKeyStatus({ valid: false, hasKey: false, message: 'Kein API-Key konfiguriert' });
          toast.success('API-Key wurde gelöscht');
        }
      });
    }
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
        <div className="flex items-center gap-2 mb-4">
          <Link href="/admin/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Einstellungen
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">KI-Einstellungen</h1>
        <p className="text-gray-500 mt-2">Konfigurieren Sie die KI-Funktionen für den Software Hub</p>
      </div>

      {/* Anleitung */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Kostenlosen Gemini API-Key erhalten</CardTitle>
          <CardDescription className="text-blue-700">
            Um die KI-Funktionen zu nutzen, benötigen Sie einen kostenlosen Google Gemini API-Key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Schritte zum Erhalt eines API-Keys:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Besuchen Sie das Google AI Studio: <a href="https://ai.google.dev/gemini-api/docs/api-key?hl=de" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                  https://ai.google.dev/gemini-api/docs/api-key?hl=de <ExternalLink className="h-3 w-3" />
                </a></li>
                <li>Melden Sie sich mit Ihrem Google-Konto an</li>
                <li>Klicken Sie auf &quot;API-Schlüssel abrufen&quot; oder &quot;Get API Key&quot;</li>
                <li>Erstellen Sie einen neuen API-Schlüssel für ein neues Projekt oder verwenden Sie ein bestehendes Projekt</li>
                <li>Kopieren Sie den generierten API-Schlüssel</li>
                <li>Fügen Sie den API-Schlüssel unten in das Feld ein und speichern Sie ihn</li>
              </ol>
            </div>
            <div className="bg-blue-100 p-3 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Hinweis:</strong> Der kostenlose Plan von Google Gemini bietet großzügige Limits für die meisten Anwendungsfälle. 
                Der API-Key wird sicher auf dem Server gespeichert und niemals im Client-Code verwendet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API-Key Einstellung */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Gemini API-Key</CardTitle>
          <CardDescription>
            Geben Sie Ihren Google Gemini API-Key ein, um die KI-Funktionen zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Status-Anzeige */}
            {apiKeyStatus && (
              <div className={`p-4 rounded-md border ${
                apiKeyStatus.valid 
                  ? 'bg-green-50 border-green-200' 
                  : apiKeyStatus.hasKey 
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {apiKeyStatus.valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className={`h-5 w-5 ${apiKeyStatus.hasKey ? 'text-yellow-600' : 'text-gray-600'}`} />
                  )}
                  <span className={`font-medium ${
                    apiKeyStatus.valid 
                      ? 'text-green-900' 
                      : apiKeyStatus.hasKey 
                        ? 'text-yellow-900'
                        : 'text-gray-900'
                  }`}>
                    {apiKeyStatus.valid 
                      ? 'API-Key ist gültig und funktioniert' 
                      : apiKeyStatus.hasKey 
                        ? 'API-Key ist ungültig oder funktioniert nicht'
                        : 'Kein API-Key konfiguriert'
                    }
                  </span>
                </div>
                <p className={`text-sm ${
                  apiKeyStatus.valid 
                    ? 'text-green-700' 
                    : apiKeyStatus.hasKey 
                      ? 'text-yellow-700'
                      : 'text-gray-700'
                }`}>
                  {apiKeyStatus.message}
                </p>
                {apiKeyStatus.hasKey && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkApiKeyStatus}
                      disabled={isTestingKey}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isTestingKey ? 'animate-spin' : ''}`} />
                      {isTestingKey ? 'Prüfe...' : 'Erneut prüfen'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="geminiApiKey">API-Key</Label>
              <div className="flex gap-2">
                <Input
                  id="geminiApiKey"
                  type="password"
                  value={formData['geminiApiKey'] || ''}
                  onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="font-mono flex-1"
                  disabled={!isInitialized}
                />
                {formData['geminiApiKey'] && formData['geminiApiKey'].trim().length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteApiKey}
                    disabled={updateSettingMutation.isPending}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Der API-Key wird verschlüsselt gespeichert und nur serverseitig verwendet.
              </p>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex gap-2">
          <Button 
            onClick={() => handleSaveSetting('geminiApiKey')}
            disabled={updateSettingMutation.isPending || !isInitialized}
            className="w-full sm:w-auto"
          >
            {updateSettingMutation.isPending ? 'Wird gespeichert...' : formData['geminiApiKey'] && formData['geminiApiKey'].trim().length > 0 ? 'API-Key aktualisieren' : 'API-Key speichern'}
          </Button>
          {formData['geminiApiKey'] && formData['geminiApiKey'].trim().length > 0 && (
            <Button
              variant="outline"
              onClick={checkApiKeyStatus}
              disabled={isTestingKey || !isInitialized}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isTestingKey ? 'animate-spin' : ''}`} />
              {isTestingKey ? 'Prüfe...' : 'Key testen'}
            </Button>
          )}
        </div>
      </Card>

      {/* KI-Generierungs-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>KI-Generierungs-Einstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie, wie die KI die Inhalte generieren soll.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="aiDescriptionWords">Anzahl Wörter für Beschreibung</Label>
              <Input
                id="aiDescriptionWords"
                type="number"
                min="50"
                max="500"
                value={formData['aiDescriptionWords'] || '100'}
                onChange={(e) => handleInputChange('aiDescriptionWords', e.target.value)}
                placeholder="100"
                disabled={!isInitialized}
              />
              <p className="text-sm text-gray-500">
                Anzahl der Wörter für die ausführliche Beschreibung (Standard: 100)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aiShortDescriptionWords">Anzahl Wörter für Kurzbeschreibung</Label>
              <Input
                id="aiShortDescriptionWords"
                type="number"
                min="10"
                max="50"
                value={formData['aiShortDescriptionWords'] || '20'}
                onChange={(e) => handleInputChange('aiShortDescriptionWords', e.target.value)}
                placeholder="20"
                disabled={!isInitialized}
              />
              <p className="text-sm text-gray-500">
                Anzahl der Wörter für die Kurzbeschreibung (Standard: 20, max. 150 Zeichen)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="aiAlternativesCount">Anzahl Alternativen</Label>
              <Input
                id="aiAlternativesCount"
                type="number"
                min="1"
                max="20"
                value={formData['aiAlternativesCount'] || '5'}
                onChange={(e) => handleInputChange('aiAlternativesCount', e.target.value)}
                placeholder="5"
                disabled={!isInitialized}
              />
              <p className="text-sm text-gray-500">
                Anzahl der alternativen Software-Lösungen, die aufgelistet werden sollen (Standard: 5)
              </p>
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex gap-2">
          <Button 
            onClick={() => handleSaveSetting('aiDescriptionWords')}
            disabled={updateSettingMutation.isPending || !isInitialized}
            variant="outline"
          >
            Beschreibung speichern
          </Button>
          <Button 
            onClick={() => handleSaveSetting('aiShortDescriptionWords')}
            disabled={updateSettingMutation.isPending || !isInitialized}
            variant="outline"
          >
            Kurzbeschreibung speichern
          </Button>
          <Button 
            onClick={() => handleSaveSetting('aiAlternativesCount')}
            disabled={updateSettingMutation.isPending || !isInitialized}
            variant="outline"
          >
            Alternativen speichern
          </Button>
        </div>
      </Card>
    </div>
  );
}

