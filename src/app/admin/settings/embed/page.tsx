'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Code, Globe, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getBaseUrl } from '@/lib/base-url';

export default function EmbedSettingsPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState('800px');
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [targetGroups, setTargetGroups] = useState<Array<{id: string, name: string}>>([]);

  // Kategorien und Zielgruppen laden + Base-URL setzen
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dynamische Base-URL sofort setzen
        const dynamicBaseUrl = getBaseUrl();
        setBaseUrl(dynamicBaseUrl);
        
        const [categoriesRes, targetGroupsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/target-groups')
        ]);
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
        
        if (targetGroupsRes.ok) {
          const targetGroupsData = await targetGroupsRes.json();
          setTargetGroups(targetGroupsData);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        // Fallback bei Fehler - verwende dynamische Base-URL
        const fallbackBaseUrl = getBaseUrl();
        setBaseUrl(fallbackBaseUrl);
      }
    };

    fetchData();
  }, []);

  // URL Parameter erstellen
  const getUrlParams = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryId', selectedCategory);
    if (selectedTargetGroup) params.append('targetGroupId', selectedTargetGroup);
    if (!showHeader) params.append('hideHeader', 'true');
    if (!showFooter) params.append('hideFooter', 'true');
    params.append('embed', 'true');
    
    return params.toString();
  };

  // Vollständige Embed-URL
  const getEmbedUrl = () => {
    const params = getUrlParams();
    return `${baseUrl}${params ? `?${params}` : ''}`;
  };

  // iFrame Code generieren
  const getIframeCode = () => {
    const url = getEmbedUrl();
    return `<iframe 
  src="${url}" 
  width="${embedWidth}" 
  height="${embedHeight}"
  frameborder="0"
  scrolling="auto"
  title="Software Hub">
</iframe>`;
  };

  // JavaScript Embed Code generieren
  const getScriptCode = () => {
    const url = getEmbedUrl();
    const containerId = 'software-hub-embed';
    
    return `<div id="${containerId}"></div>
<script>
(function() {
  var iframe = document.createElement('iframe');
  iframe.src = '${url}';
  iframe.width = '${embedWidth}';
  iframe.height = '${embedHeight}';
  iframe.frameBorder = '0';
  iframe.scrolling = 'auto';
  iframe.title = 'Software Hub';
  iframe.style.border = 'none';
  iframe.style.width = '${embedWidth}';
  iframe.style.height = '${embedHeight}';
  
  var container = document.getElementById('${containerId}');
  if (container) {
    container.appendChild(iframe);
  }
})();
</script>`;
  };

  // WordPress Shortcode generieren
  const getWordPressCode = () => {
    const params = [];
    if (selectedCategory) params.push(`category="${selectedCategory}"`);
    if (selectedTargetGroup) params.push(`target_group="${selectedTargetGroup}"`);
    if (embedWidth !== '100%') params.push(`width="${embedWidth}"`);
    if (embedHeight !== '800px') params.push(`height="${embedHeight}"`);
    if (!showHeader) params.push('hide_header="true"');
    if (!showFooter) params.push('hide_footer="true"');
    
    return `[software_hub ${params.join(' ')}]`;
  };

  // Code in Zwischenablage kopieren
  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast.success(`${type} Code in Zwischenablage kopiert`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Fehler beim Kopieren in die Zwischenablage');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Software Hub Einbetten</h1>
          <p className="text-gray-600 mt-2">
            Generieren Sie Embed-Code um den Software Hub in andere Webseiten einzubinden
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Konfiguration */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Embed-Konfiguration
              </h2>
              
              <div className="space-y-4">
                {/* Base URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://your-domain.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Die URL Ihrer Software Hub Installation
                  </p>
                </div>

                {/* Dimensionen */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breite
                    </label>
                    <input
                      type="text"
                      value={embedWidth}
                      onChange={(e) => setEmbedWidth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Höhe
                    </label>
                    <input
                      type="text"
                      value={embedHeight}
                      onChange={(e) => setEmbedHeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="800px"
                    />
                  </div>
                </div>

                {/* Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorgefilterte Kategorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Kategorien</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vorgefilterte Zielgruppe
                  </label>
                  <select
                    value={selectedTargetGroup}
                    onChange={(e) => setSelectedTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Alle Zielgruppen</option>
                    {targetGroups.map((targetGroup) => (
                      <option key={targetGroup.id} value={targetGroup.id}>
                        {targetGroup.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Anzeige-Optionen */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showHeader}
                      onChange={(e) => setShowHeader(e.target.checked)}
                      className="mr-2"
                    />
                    Header anzeigen
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showFooter}
                      onChange={(e) => setShowFooter(e.target.checked)}
                      className="mr-2"
                    />
                    Footer anzeigen
                  </label>
                </div>
              </div>
            </div>

            {/* Vorschau */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Vorschau URL
              </h2>
              <div className="bg-gray-50 p-3 rounded-md">
                <code className="text-sm break-all">{getEmbedUrl()}</code>
              </div>
              <a
                href={getEmbedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                In neuem Tab öffnen →
              </a>
            </div>
          </div>

          {/* Code-Generierung */}
          <div className="space-y-6">
            {/* iFrame Code */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  iFrame Embed Code
                </h2>
                <button
                  onClick={() => copyToClipboard(getIframeCode(), 'iFrame')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {copiedCode === 'iFrame' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode === 'iFrame' ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm"><code>{getIframeCode()}</code></pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Für statische HTML-Seiten und die meisten CMS-Systeme
              </p>
            </div>

            {/* JavaScript Code */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JavaScript Embed Code
                </h2>
                <button
                  onClick={() => copyToClipboard(getScriptCode(), 'JavaScript')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {copiedCode === 'JavaScript' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode === 'JavaScript' ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm"><code>{getScriptCode()}</code></pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Für dynamisches Laden und bessere Kontrolle über das Styling
              </p>
            </div>

            {/* WordPress Shortcode */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  WordPress Shortcode
                </h2>
                <button
                  onClick={() => copyToClipboard(getWordPressCode(), 'WordPress')}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {copiedCode === 'WordPress' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedCode === 'WordPress' ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm"><code>{getWordPressCode()}</code></pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Für WordPress (erfordert ein entsprechendes Plugin)
              </p>
            </div>
          </div>
        </div>

        {/* Anwendungshinweise */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-4">Anwendungshinweise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Moodle Integration:</h4>
              <ul className="space-y-1">
                <li>• Verwenden Sie den iFrame Code in HTML-Blöcken</li>
                <li>• Aktivieren Sie "HTML-Editor" für bessere Kontrolle</li>
                <li>• Passen Sie die Höhe je nach Inhalt an</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">TYPO3 Integration:</h4>
              <ul className="space-y-1">
                <li>• Nutzen Sie HTML-Content-Elemente</li>
                <li>• Oder erstellen Sie ein eigenes Plugin</li>
                <li>• Berücksichtigen Sie responsive Breakpoints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">WordPress Integration:</h4>
              <ul className="space-y-1">
                <li>• iFrame Code in HTML-Blöcken verwenden</li>
                <li>• Oder Custom HTML Widget nutzen</li>
                <li>• Plugin für Shortcode-Unterstützung entwickeln</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Allgemeine Tipps:</h4>
              <ul className="space-y-1">
                <li>• Testen Sie verschiedene Höhen-Einstellungen</li>
                <li>• Verwenden Sie HTTPS für sichere Einbindung</li>
                <li>• Prüfen Sie die Responsive-Darstellung</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}