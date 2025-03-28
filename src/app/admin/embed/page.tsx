'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, ExternalLink } from 'lucide-react';

export default function EmbedPage() {
  const [activeTab, setActiveTab] = useState('iframe');
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const embedOptions = [
    {
      id: 'iframe',
      name: 'iFrame',
      description: 'Betten Sie den Software-Hub direkt als iFrame ein',
      code: `<iframe src="${baseUrl}" width="100%" height="800" frameborder="0"></iframe>`,
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'Laden Sie den Software-Hub dynamisch mit JavaScript',
      code: `<div id="software-hub-container"></div>
<script>
  (function() {
    var container = document.getElementById('software-hub-container');
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}';
    iframe.width = '100%';
    iframe.height = '800';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
  })();
</script>`,
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Einbettung in WordPress mit Shortcode',
      code: `[iframe src="${baseUrl}" width="100%" height="800" frameborder="0"]`,
      instructions: `
1. Installieren Sie ein iFrame-Plugin wie "Advanced iFrame" oder "Iframe".
2. Fügen Sie den Shortcode in Ihre Seite oder Ihren Beitrag ein.
3. Speichern und veröffentlichen Sie die Seite.`,
    },
    {
      id: 'typo3',
      name: 'TYPO3',
      description: 'Einbettung in TYPO3 CMS',
      code: `<f:format.raw>
  <iframe src="${baseUrl}" width="100%" height="800" frameborder="0"></iframe>
</f:format.raw>`,
      instructions: `
1. Erstellen Sie ein neues Inhaltselement vom Typ "HTML".
2. Fügen Sie den HTML-Code ein.
3. Speichern und veröffentlichen Sie die Seite.`,
    },
    {
      id: 'moodle',
      name: 'Moodle',
      description: 'Einbettung in Moodle-Kurse',
      code: `<iframe src="${baseUrl}" width="100%" height="800" frameborder="0"></iframe>`,
      instructions: `
1. Gehen Sie zu Ihrem Moodle-Kurs.
2. Aktivieren Sie den Bearbeitungsmodus.
3. Klicken Sie auf "Material oder Aktivität anlegen".
4. Wählen Sie "Textfeld" oder "HTML-Block".
5. Klicken Sie auf das HTML-Symbol in der Symbolleiste.
6. Fügen Sie den HTML-Code ein.
7. Speichern Sie die Änderungen.`,
    },
    {
      id: 'api',
      name: 'REST API',
      description: 'Zugriff auf die Daten über die REST API',
      code: `${baseUrl}/api/software`,
      instructions: `
1. Senden Sie eine GET-Anfrage an die API-URL.
2. Die Antwort enthält alle Software-Einträge im JSON-Format.
3. Filtern Sie nach Kategorien mit dem Parameter "?categoryId=ID".
4. Suchen Sie mit dem Parameter "?q=Suchbegriff".`,
    },
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(id);
      toast.success('Code kopiert!', {
        description: 'Der Einbettungscode wurde in die Zwischenablage kopiert.',
      });
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Einbetten</h1>
      
      <div className="mb-8">
        <p className="text-gray-600">
          Hier finden Sie verschiedene Möglichkeiten, den Software-Hub in andere Webseiten einzubinden.
          Wählen Sie die passende Option für Ihre Plattform und kopieren Sie den Code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {embedOptions.map((option) => (
          <Button
            key={option.id}
            variant={activeTab === option.id ? "default" : "outline"}
            onClick={() => setActiveTab(option.id)}
            className="text-sm"
          >
            {option.name}
          </Button>
        ))}
      </div>

      {embedOptions.map((option) => (
        <div key={option.id} className={activeTab === option.id ? "block" : "hidden"}>
          <Card>
            <CardHeader>
              <CardTitle>{option.name}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor={`${option.id}-code`}>Einbettungscode</Label>
                <div className="relative mt-1">
                  <div className="mt-1 rounded-md bg-gray-50 p-4 font-mono text-sm">
                    <pre className="whitespace-pre-wrap break-all">{option.code}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => handleCopy(option.code, option.id)}
                  >
                    {copied === option.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {option.instructions && (
                <div className="mt-6">
                  <Label>Anleitung</Label>
                  <div className="mt-1 rounded-md bg-gray-50 p-4 text-sm">
                    <pre className="whitespace-pre-wrap">{option.instructions}</pre>
                  </div>
                </div>
              )}

              {option.id === 'api' && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => window.open(`${baseUrl}/api/software`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    API testen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}

      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Anpassungsoptionen</h3>
        <p className="text-gray-600 mb-4">
          Sie können den eingebetteten Software-Hub mit zusätzlichen Parametern anpassen:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="category-filter">Nach Kategorie filtern</Label>
            <div className="flex mt-1">
              <Input
                id="category-filter"
                placeholder="Kategorie-ID"
                className="rounded-r-none"
              />
              <Button variant="secondary" className="rounded-l-none">
                Generieren
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Beispiel: <code>{baseUrl}?categoryId=1</code>
            </p>
          </div>

          <div>
            <Label htmlFor="search-filter">Mit Suchbegriff vorfiltern</Label>
            <div className="flex mt-1">
              <Input
                id="search-filter"
                placeholder="Suchbegriff"
                className="rounded-r-none"
              />
              <Button variant="secondary" className="rounded-l-none">
                Generieren
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Beispiel: <code>{baseUrl}?q=Office</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
