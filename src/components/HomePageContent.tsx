'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { UserNav } from '@/components/UserNav';
import { Package, Search, ExternalLink, Globe, Monitor, Laptop, Smartphone } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from '@/components/CategoryFilter';
import { TargetGroupFilter } from '@/components/TargetGroupFilter';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  types: string[];
  costs: string;
  available: boolean;
  categories: {
    id: string;
    name: string;
  }[];
  targetGroups: {
    id: string;
    name: string;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export function HomePageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<string | null>(null);
  const [badgeText, setBadgeText] = useState('Verfügbar');
  const [showBadges, setShowBadges] = useState(true);
  const [badgeBackgroundColor, setBadgeBackgroundColor] = useState('#10b981');
  const [badgeTextColor, setBadgeTextColor] = useState('#ffffff');
  const [showTargetGroups, setShowTargetGroups] = useState(true);

  // Embed-Parameter aus URL lesen
  const isEmbedMode = searchParams?.get('embed') === 'true';
  const hideHeader = searchParams?.get('hideHeader') === 'true';
  const hideFooter = searchParams?.get('hideFooter') === 'true';
  const embedCategoryId = searchParams?.get('categoryId');
  const embedTargetGroupId = searchParams?.get('targetGroupId');

  // Lade Badge-Einstellungen aus den Einstellungen
  useEffect(() => {
    const fetchBadgeSettings = async () => {
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

        // Zielgruppen-Anzeige laden
        const showTargetGroupsResponse = await fetch('/api/settings?key=showTargetGroups');
        if (showTargetGroupsResponse.ok) {
          const data = await showTargetGroupsResponse.json();
          if (data && data.value) {
            setShowTargetGroups(data.value.toLowerCase() === 'true');
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der Badge-Einstellungen:', error);
      }
    };

    fetchBadgeSettings();
  }, []);

  // Embed-Parameter beim Laden der Seite anwenden
  useEffect(() => {
    if (embedCategoryId) {
      setSelectedCategory(embedCategoryId);
    }
    if (embedTargetGroupId) {
      setSelectedTargetGroup(embedTargetGroupId);
    }
  }, [embedCategoryId, embedTargetGroupId]);

  const { data: softwareData = [], isLoading, error } = useQuery<Software[]>({
    queryKey: ['software', searchQuery, selectedCategory, selectedTargetGroup],
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

  // Filter Software basierend auf Suche, Kategorie und Zielgruppe
  const filteredSoftware = softwareData.filter(software => {
    const matchesSearch = software.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         software.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || software.categories.some(category => category.id === selectedCategory);
    const matchesTargetGroup = selectedTargetGroup === null || software.targetGroups.some(targetGroup => targetGroup.id === selectedTargetGroup);
    return matchesSearch && matchesCategory && matchesTargetGroup;
  });

  return (
    <div className={`min-h-screen bg-gray-50/50 ${isEmbedMode ? 'p-0' : ''}`}>
      {/* Header */}
      {!hideHeader && (
        <header className="sticky top-0 z-40 w-full border-b bg-white/50 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Package className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Software Hub</h1>
              </div>
              <div className="flex items-center space-x-4">
                <UserNav />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-6xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Software suchen..."
                className="h-10 w-full rounded-md border pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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

        {/* Software Grid */}
        {isLoading ? (
          <div className="text-center py-8">Lade Software...</div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {filteredSoftware.map((software) => (
                <motion.div
                  key={software.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Card className="overflow-hidden flex flex-col h-full relative">
                    <CardContent className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{software.name}</h3>
                          <a 
                            href={software.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-primary/80"
                            title="Zur Website"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          {software.types.map((type, index) => (
                            <div key={index} title={type.trim()} className="text-gray-500">
                              {getSoftwareTypeIcon(type.trim())}
                            </div>
                          ))}
                        </div>
                      </div>
                      {showBadges && software.available && (
                        <div className="absolute top-0 right-0">
                          <div 
                            className="py-1 px-3 text-sm font-semibold shadow-md"
                            style={{ 
                              backgroundColor: badgeBackgroundColor,
                              color: badgeTextColor
                            }}
                          >
                            {badgeText}
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{software.shortDescription}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {software.categories.map((category, index) => (
                          <Badge key={`cat-${index}`} variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        ))}
                        {showTargetGroups && software.targetGroups.map((targetGroup, index) => (
                          <Badge key={`tg-${index}`} variant="outline" className="text-xs">
                            {targetGroup.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-auto px-8">
                            Details anzeigen
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {software.name}
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
                            <div>
                              <h4 className="font-medium mb-1">Beschreibung</h4>
                              <p className="text-sm text-gray-600">{software.description}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Kategorien</h4>
                              <div className="flex flex-wrap gap-2">
                                {software.categories.map((category, index) => (
                                  <Badge key={index} variant="secondary">
                                    {category.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            {showTargetGroups && (
                              <div>
                                <h4 className="font-medium mb-1">Zielgruppen</h4>
                                <div className="flex flex-wrap gap-2">
                                  {software.targetGroups.map((targetGroup, index) => (
                                    <Badge key={index} variant="outline">
                                      {targetGroup.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium mb-1">Typ</h4>
                              <div className="flex gap-2">
                                {software.types.map((type, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    {getSoftwareTypeIcon(type.trim())}
                                    <span className="text-sm text-gray-600">{type.trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Kosten</h4>
                              <p className="text-sm text-gray-600">{software.costs}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Verfügbarkeit</h4>
                              <p className="text-sm text-gray-600">{software.available ? 'Verfügbar' : 'Nicht verfügbar'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}