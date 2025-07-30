'use client';

// Import version from package.json for display
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { version as appVersion } from '../../../../package.json';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Package, Home, ChevronDown, ChevronUp, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface SubMenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  submenu?: SubMenuItem[];
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'USER';
  const isAdmin = userRole === 'ADMIN';

  const toggleSubmenu = (href: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  // Basismenüpunkte, die für alle Benutzer sichtbar sind
  const menuItems: MenuItem[] = [
    { 
      href: '/admin', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard'
    },
    { 
      href: '/admin/software',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Software'
    },
    { 
      href: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      label: 'Kategorien'
    },
    {
      href: '/admin/target-groups',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Zielgruppen'
    },
    {
      href: '/admin/import-export',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      label: 'Import/Export'
    },
  ];

  // Einstellungsmenü nur für Administratoren
  if (isAdmin) {
    menuItems.push({ 
      href: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Einstellungen',
      submenu: [
        {
          href: '/admin/settings/badge',
          label: 'Badge-Einstellungen',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )
        },
        {
          href: '/admin/settings/footer',
          label: 'Footer',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          href: '/admin/settings/embed',
          label: 'Einbetten',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          )
        },
        {
          href: '/admin/users',
          label: 'Benutzer',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        }
      ]
    });
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header mit Logo */}
      <div className="flex items-center p-4 border-b bg-white">
        <div className="flex items-center flex-1 gap-2">
          {/* Logo mit Link zur Startseite */}
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            {!isCollapsed && (
              <span className="font-semibold text-xl">Software Hub</span>
            )}
          </Link>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.href)}
                    className={cn(
                      'flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors',
                      pathname.startsWith(item.href) ? 'bg-gray-100' : '',
                      isCollapsed ? 'justify-center' : 'justify-between'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("text-gray-500", pathname.startsWith(item.href) ? 'text-gray-900' : '')}>
                        {item.icon}
                      </div>
                      {!isCollapsed && (
                        <span className={cn("text-sm font-medium", pathname.startsWith(item.href) ? 'text-gray-900' : 'text-gray-500')}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      expandedMenus[item.href] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {/* Submenu */}
                  {expandedMenus[item.href] && !isCollapsed && (
                    <ul className="mt-1 pl-10 space-y-1">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={cn(
                              'flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors',
                              pathname === subItem.href ? 'bg-gray-100' : ''
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("text-gray-500", pathname === subItem.href ? 'text-gray-900' : '')}>
                                {subItem.icon}
                              </div>
                              <span className={cn("text-sm font-medium", pathname === subItem.href ? 'text-gray-900' : 'text-gray-500')}>
                                {subItem.label}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors',
                    pathname === item.href ? 'bg-gray-100' : '',
                    isCollapsed ? 'justify-center' : ''
                  )}
                >
                  <div className={cn("text-gray-500", pathname === item.href ? 'text-gray-900' : '')}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className={cn("ml-3 text-sm font-medium", pathname === item.href ? 'text-gray-900' : 'text-gray-500')}>
                      {item.label}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      


      {/* Footer */}
      <div className="p-4 border-t">
        {!isCollapsed && (
          <div>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Administrator' : 'Benutzer'}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {session?.user?.name || 'Benutzer'}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{process.env.NEXT_PUBLIC_APP_VERSION || 'v1.0.0'}</span>
              <a 
                href="https://github.com/noack-digital/software-hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition-colors"
                title="GitHub Repository"
              >
                <Github className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
