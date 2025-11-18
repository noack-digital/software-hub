/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserNav } from '@/components/UserNav';
import { Package, Search, ExternalLink, Globe, Monitor, Laptop, Smartphone, Info } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from '@/components/CategoryFilter';
import { TargetGroupFilter } from '@/components/TargetGroupFilter';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Software {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  url: string;
  logo?: string | null;
  types: string[];
  costs: string;
  available: boolean;
  dataPrivacyStatus?: 'DSGVO_COMPLIANT' | 'EU_HOSTED' | 'NON_EU';
  inhouseHosted?: boolean;
  // Englische Übersetzungen
  nameEn?: string | null;
  shortDescriptionEn?: string | null;
  descriptionEn?: string | null;
  featuresEn?: string | null;
  alternativesEn?: string | null;
  notesEn?: string | null;
  categories: {
    id: string;
    name: string;
    nameEn?: string | null;
  }[];
  targetGroups?: {
    id: string;
    name: string;
    nameEn?: string | null;
  }[];
}

// Hilfsfunktion für das Software-Typ-Icon
function getSoftwareTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'web':
      return <Globe className="h-4 w-4" />;
    case 'desktop':
      return <Laptop className="h-4 w-4" />;
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

// Card-Animation Varianten
const cardVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.98,
    y: 10
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: {
      duration: 0.15
    }
  }
};

const privacyStatusMeta: Record<
  NonNullable<Software['dataPrivacyStatus']>,
  { label: string; tooltip: string; colorClass: string }
> = {
  DSGVO_COMPLIANT: {
    label: 'DSGVO-konform',
    tooltip: 'Diese Software wird DSGVO-konform betrieben.',
    colorClass: 'bg-green-500',
  },
  EU_HOSTED: {
    label: 'Hosting in der EU',
    tooltip: 'Server befinden sich in der EU – weitere Prüfung empfohlen.',
    colorClass: 'bg-yellow-500',
  },
  NON_EU: {
    label: 'Server außerhalb der EU',
    tooltip: 'Serverstandort außerhalb der EU – prüfen Sie die Rechtsgrundlage.',
    colorClass: 'bg-red-500',
  },
};

export default function HomePage() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string | null>(null);
  const [badgeText, setBadgeText] = useState(t('common.available'));
  const [showBadges, setShowBadges] = useState(true);
  const [badgeBackgroundColor, setBadgeBackgroundColor] = useState('#10b981');
  const [badgeTextColor, setBadgeTextColor] = useState('#ffffff');
  const [stickyHeader, setStickyHeader] = useState(true);
  const defaultInhouseTooltip = 'Diese Software wird inhouse gehostet.';
  const [showLogos, setShowLogos] = useState(true);
  const [backendShowPrivacyIndicator, setBackendShowPrivacyIndicator] = useState(true);
  const [inhouseLogoUrl, setInhouseLogoUrl] = useState<string | null>(null);
  const [inhouseLogoTooltip, setInhouseLogoTooltip] = useState<string>(defaultInhouseTooltip);

  // URL-Parameter beim Laden verarbeiten
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Kategorie-Parameter verarbeiten
      const categoryParam = params.get('categoryId');
      if (categoryParam) {
        console.log('URL-Parameter für Kategorie gefunden:', categoryParam);
        setSelectedCategory(categoryParam);
      }
      
      // Suchbegriff-Parameter verarbeiten
      const searchParam = params.get('q');
      if (searchParam) {
        console.log('URL-Parameter für Suche gefunden:', searchParam);
        setSearchQuery(searchParam);
      }
    }
  }, []);

  // Lade Badge-Einstellungen und andere Einstellungen aus der API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Badge-Text laden
        const textResponse = await fetch('/api/settings?key=availableBadgeText');
        if (textResponse.ok) {
          const data = await textResponse.json();
          if (data && data.value) {
            setBadgeText(data.value);
          }
        }

        // Badge-Anzeige laden
        const showResponse = await fetch('/api/settings?key=showBadges');
        if (showResponse.ok) {
          const data = await showResponse.json();
          if (data && data.value) {
            setShowBadges(data.value.toLowerCase() === 'true');
          }
        }

        // Badge-Hintergrundfarbe laden
        const bgColorResponse = await fetch('/api/settings?key=badgeBackgroundColor');
        if (bgColorResponse.ok) {
          const data = await bgColorResponse.json();
          if (data && data.value) {
            setBadgeBackgroundColor(data.value);
          }
        }

        // Badge-Textfarbe laden
        const textColorResponse = await fetch('/api/settings?key=badgeTextColor');
        if (textColorResponse.ok) {
          const data = await textColorResponse.json();
          if (data && data.value) {
            setBadgeTextColor(data.value);
          }
        }

        // Sticky Header Einstellung laden
        const stickyHeaderResponse = await fetch('/api/settings?key=stickyHeader');
        if (stickyHeaderResponse.ok) {
          const data = await stickyHeaderResponse.json();
          if (data && data.value) {
            setStickyHeader(data.value.toLowerCase() !== 'false');
          }
        }

        // Logo-Anzeige Einstellung laden
        const showLogosResponse = await fetch('/api/settings?key=showLogos');
        if (showLogosResponse.ok) {
          const data = await showLogosResponse.json();
          if (data && data.value) {
            setShowLogos(data.value.toLowerCase() === 'true');
          }
        }

        const showPrivacyIndicatorResponse = await fetch('/api/settings?key=showPrivacyIndicator');
        if (showPrivacyIndicatorResponse.ok) {
          const data = await showPrivacyIndicatorResponse.json();
          if (data && data.value) {
            const enabled = data.value.toLowerCase() === 'true';
            setBackendShowPrivacyIndicator(enabled);
          }
        }

        const inhouseLogoResponse = await fetch('/api/settings?key=inhouseLogoUrl');
        if (inhouseLogoResponse.ok) {
          const data = await inhouseLogoResponse.json();
          if (data && typeof data.value === 'string') {
            setInhouseLogoUrl(data.value.trim() || null);
          }
        }

        const inhouseTooltipResponse = await fetch('/api/settings?key=inhouseLogoTooltip');
        if (inhouseTooltipResponse.ok) {
          const data = await inhouseTooltipResponse.json();
          if (data && typeof data.value === 'string') {
            setInhouseLogoTooltip(data.value.trim() || defaultInhouseTooltip);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Einstellungen:', error);
      }
    };

    fetchSettings();
  }, []);

  const { data: softwareData = [], isLoading, error } = useQuery<Software[]>({
    queryKey: ['software', searchQuery, selectedCategory, selectedTargetGroup, language],
    queryFn: async () => {
      console.log('Homepage: Starte Datenabruf...');
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedTargetGroup) params.append('targetGroupId', selectedTargetGroup);
      
      const url = `/api/software?${params.toString()}`;
      console.log('Homepage: Sende Anfrage an:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Homepage: Fehler beim Abruf:', response.status, response.statusText, errorData);
        throw new Error(errorData.error || 'Fehler beim Laden der Daten');
      }
      
      const data = await response.json();
      console.log('Homepage: Daten erfolgreich geladen:', data.length, 'Einträge');
      return data;
    },
    retry: 1,
  });

  if (error) {
    console.error('Homepage: Query Error:', error);
  }

  const { data: demoCheck } = useQuery({
    queryKey: ['demo-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/demo/check');
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
    enabled: session?.user?.role === 'ADMIN',
    refetchInterval: session?.user?.role === 'ADMIN' ? 10000 : false,
  });

  // Filter Software basierend auf Suche und Kategorie
  const filteredSoftware = softwareData.filter(software => {
    // Je nach Sprache in den richtigen Feldern suchen
    const searchName = language === 'en' && software.nameEn ? software.nameEn : software.name;
    const searchShortDesc = language === 'en' && software.shortDescriptionEn ? software.shortDescriptionEn : software.shortDescription;

    const matchesSearch = searchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         searchShortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || software.categories.some(category => category.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Hilfsfunktion zum Abrufen des richtigen Textes je nach Sprache
  const getLocalizedText = (software: Software, field: 'name' | 'shortDescription' | 'description') => {
    if (language === 'en') {
      switch (field) {
        case 'name':
          return software.nameEn || software.name;
        case 'shortDescription':
          return software.shortDescriptionEn || software.shortDescription;
        case 'description':
          return software.descriptionEn || software.description;
        default:
          return '';
      }
    }
    // Deutsch (Standard)
    switch (field) {
      case 'name':
        return software.name;
      case 'shortDescription':
        return software.shortDescription;
      case 'description':
        return software.description;
      default:
        return '';
    }
  };

  // Hilfsfunktion zum Abrufen des Kategorien-Namens je nach Sprache
  const getCategoryName = (category: { id: string; name: string; nameEn?: string | null }) => {
    if (language === 'en' && category.nameEn) {
      return category.nameEn;
    }
    return category.name;
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className={`${stickyHeader ? 'sticky top-0' : ''} z-40 w-full border-b bg-white/50 backdrop-blur-lg`}>
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Software Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder={t('software.search')}
                className="h-10 w-full rounded-md border pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Zielgruppen-Filter */}
            <TargetGroupFilter
              selectedTargetGroup={selectedTargetGroup}
              onSelectTargetGroup={setSelectedTargetGroup}
            />
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
        </div>

        {session?.user?.role === 'ADMIN' && (demoCheck?.counts?.software || 0) === 0 && (
          <div className="mb-8 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 text-sm text-gray-800">
                <p className="font-medium">
                  Noch keine Software-Einträge vorhanden
                </p>
                <p className="mt-1">
                  Laden Sie den DEMO-Datensatz (17 Software-Einträge, 6 Kategorien, 3 Zielgruppen) oder
                  legen Sie eigene Inhalte im Admin-Bereich an, um den Software-Hub zu demonstrieren.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href="/admin/import-export">
                      DEMO-Daten laden
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/admin/software/new">
                      Eigene Software anlegen
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Software Grid */}
        {isLoading ? (
          <div className="text-center py-8">{t('common.loading')}</div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {filteredSoftware.map((software) => {
                const showInhouseLogo =
                  backendShowPrivacyIndicator &&
                  software.dataPrivacyStatus === 'DSGVO_COMPLIANT' &&
                  software.inhouseHosted &&
                  !!inhouseLogoUrl;

                return (
                  <motion.div
                    key={software.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                  <Card className="overflow-hidden flex flex-col h-full relative">
                    {(backendShowPrivacyIndicator && software.dataPrivacyStatus) ||
                    (showBadges && software.available) ? (
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-10">
                        {backendShowPrivacyIndicator &&
                          software.dataPrivacyStatus &&
                          privacyStatusMeta[software.dataPrivacyStatus] && (
                          <div
                            className="flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow"
                            title={privacyStatusMeta[software.dataPrivacyStatus].tooltip}
                          >
                            {showInhouseLogo && inhouseLogoUrl && (
                              <img
                                src={inhouseLogoUrl}
                                alt="Inhouse Logo"
                                className="h-5 w-5 object-contain rounded border border-gray-200 bg-white"
                                title={inhouseLogoTooltip || 'Inhouse gehostet'}
                                aria-label={inhouseLogoTooltip || 'Inhouse gehostet'}
                              />
                            )}
                            <div className="flex items-center gap-1">
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full ${privacyStatusMeta[software.dataPrivacyStatus].colorClass}`}
                              />
                              <span>{privacyStatusMeta[software.dataPrivacyStatus].label}</span>
                            </div>
                          </div>
                        )}
                        {showBadges && software.available && (
                          <div 
                            className="py-1 px-3 text-sm font-semibold shadow-md rounded bg-white"
                            style={{ 
                              backgroundColor: badgeBackgroundColor,
                              color: badgeTextColor
                            }}
                          >
                            {badgeText}
                          </div>
                        )}
                      </div>
                    ) : null}
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 flex-1">
                          {showLogos && software.logo && (
                            <img 
                              src={software.logo} 
                              alt={`${software.name} Logo`}
                              className="h-6 w-6 object-contain flex-shrink-0"
                              onError={(e) => {
                                // Fallback falls Logo nicht geladen werden kann
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <h3 className="font-semibold">{getLocalizedText(software, 'name')}</h3>
                          <a 
                            href={software.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-primary/80 flex-shrink-0"
                            title="Zur Website"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {software.types.map((type, index) => (
                            <div key={index} title={type.trim()} className="text-gray-500 flex-shrink-0">
                              {getSoftwareTypeIcon(type.trim())}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 flex-grow">{getLocalizedText(software, 'shortDescription')}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {software.categories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {getCategoryName(category)}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex justify-center flex-shrink-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-auto px-8">
                            {t('software.showDetails')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {showLogos && software.logo && (
                                <img 
                                  src={software.logo} 
                                  alt={`${software.name} Logo`}
                                  className="h-8 w-8 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              {getLocalizedText(software, 'name')}
                              <a 
                                href={software.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Kategorien direkt unter dem Namen */}
                            {software.categories.length > 0 && (
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {software.categories.map((category, index) => (
                                    <Badge key={index} variant="secondary">
                                      {getCategoryName(category)}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Lange Beschreibung */}
                            <div>
                              <h4 className="font-medium mb-1">{t('software.description')}</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{getLocalizedText(software, 'description')}</p>
                            </div>
                            
                            {/* Typ, Kosten und Verfügbarkeit */}
                            <div className="space-y-3 pt-2 border-t">
                              <div>
                                <h4 className="font-medium mb-1">{t('software.type')}</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {software.types.map((type, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                      {getSoftwareTypeIcon(type.trim())}
                                      <span className="text-sm text-gray-600">{type.trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">{t('software.costs')}</h4>
                                <p className="text-sm text-gray-600">{software.costs}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">{t('software.availability')}</h4>
                                <p className="text-sm text-gray-600">{software.available ? t('common.available') : t('common.notAvailable')}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
