import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
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
            <Link href="/impressum" className="text-sm text-gray-600 hover:text-gray-900">
              Impressum
            </Link>
            <Link href="/datenschutz" className="text-sm text-gray-600 hover:text-gray-900">
              Datenschutz
            </Link>
            <a 
              href="https://github.com/noack-digital/software-hub" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Lizenziert unter der MIT-Lizenz. Jeder darf diese Software kostenlos herunterladen, nutzen und weiterentwickeln.
        </div>
      </div>
    </footer>
  );
}
