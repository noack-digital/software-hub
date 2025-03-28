'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FooterSettings {
  impressumUrl: string;
  datenschutzUrl: string;
  openLinksInNewTab: boolean;
  showFooterLinks: boolean;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({
    impressumUrl: '/impressum',
    datenschutzUrl: '/datenschutz',
    openLinksInNewTab: false,
    showFooterLinks: true
  });
  
  useEffect(() => {
    // Lade Footer-Einstellungen
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const footerSettings: FooterSettings = {
            impressumUrl: '/impressum',
            datenschutzUrl: '/datenschutz',
            openLinksInNewTab: false,
            showFooterLinks: true
          };
          
          // Extrahiere die relevanten Einstellungen
          data.forEach((setting: any) => {
            if (setting.key === 'impressumUrl') {
              footerSettings.impressumUrl = setting.value;
            } else if (setting.key === 'datenschutzUrl') {
              footerSettings.datenschutzUrl = setting.value;
            } else if (setting.key === 'openLinksInNewTab') {
              footerSettings.openLinksInNewTab = setting.value === 'true';
            } else if (setting.key === 'showFooterLinks') {
              footerSettings.showFooterLinks = setting.value === 'true';
            }
          });
          
          setSettings(footerSettings);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Footer-Einstellungen:', error);
      }
    }
    
    loadSettings();
  }, []);
  
  return (
    <footer className="bg-white border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              {currentYear} Software Hub. Entwickelt von <a href="https://www.linkedin.com/in/noack-alexander/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 underline">Alexander Noack</a> für die <a href="https://hnee.de" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 underline">Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE)</a>.
            </p>
          </div>
          {settings.showFooterLinks && (
            <div className="flex space-x-6">
              <a 
                href={settings.impressumUrl} 
                target={settings.openLinksInNewTab ? "_blank" : "_self"} 
                rel={settings.openLinksInNewTab ? "noopener noreferrer" : ""}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Impressum
              </a>
              <a 
                href={settings.datenschutzUrl} 
                target={settings.openLinksInNewTab ? "_blank" : "_self"} 
                rel={settings.openLinksInNewTab ? "noopener noreferrer" : ""}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Datenschutz
              </a>
              <a 
                href="https://github.com/noack-digital/software-hub" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                GitHub
              </a>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Lizenziert unter der MIT-Lizenz. Jeder darf diese Software kostenlos herunterladen, nutzen und weiterentwickeln.
        </div>
      </div>
    </footer>
  );
}
