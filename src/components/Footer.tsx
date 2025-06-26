'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FooterLink {
  id: string;
  text: string;
  url: string;
  order: number;
  isActive: boolean;
}

export function Footer() {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchFooterLinks = async () => {
      try {
        const response = await fetch('/api/footer-links');
        if (response.ok) {
          const data = await response.json();
          setFooterLinks(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Footer-Links:', error);
        // Fallback zu Standard-Links bei Fehler
        setFooterLinks([
          { id: '1', text: 'Impressum', url: '/impressum', order: 1, isActive: true },
          { id: '2', text: 'Datenschutz', url: '/datenschutz', order: 2, isActive: true },
          { id: '3', text: 'GitHub', url: 'https://github.com/noack-digital/software-hub', order: 3, isActive: true }
        ]);
      }
    };

    fetchFooterLinks();
  }, []);
  
  return (
    <footer className="bg-white border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              {currentYear} Software Hub. Entwickelt von Alexander Noack für die Hochschule für Nachhaltige Entwicklung Eberswalde (HNEE).
            </p>
          </div>
          <div className="flex space-x-6">
            {footerLinks.map((link) => {
              // Prüfen ob es ein externer Link ist
              const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
              
              if (isExternal) {
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.text}
                  </a>
                );
              } else {
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.text}
                  </Link>
                );
              }
            })}
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Lizenziert unter der MIT-Lizenz. Jeder darf diese Software kostenlos herunterladen, nutzen und weiterentwickeln.
        </div>
      </div>
    </footer>
  );
}
