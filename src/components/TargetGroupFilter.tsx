'use client';

import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';

interface TargetGroup {
  id: string;
  name: string;
  nameEn?: string | null;
}

interface TargetGroupFilterProps {
  selectedTargetGroup: string | null;
  onSelectTargetGroup: (targetGroup: string | null) => void;
}

export function TargetGroupFilter({ selectedTargetGroup, onSelectTargetGroup }: TargetGroupFilterProps) {
  const { language, t } = useLanguage();
  
  // Zielgruppen aus der API laden
  const { data: targetGroups = [], isLoading } = useQuery<TargetGroup[]>({
    queryKey: ['target-groups'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/target-groups');
        if (!response.ok) {
          console.warn('Zielgruppen konnten nicht geladen werden, verwende leere Liste');
          return [];
        }
        return response.json();
      } catch (error) {
        console.warn('Fehler beim Laden der Zielgruppen:', error);
        return [];
      }
    },
  });

  // Hilfsfunktion zum Abrufen des Zielgruppen-Namens je nach Sprache
  const getTargetGroupName = (targetGroup: TargetGroup) => {
    if (language === 'en' && targetGroup.nameEn) {
      return targetGroup.nameEn;
    }
    return targetGroup.name;
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">{t('common.loading')}</div>;
  }

  console.log('TargetGroupFilter - targetGroups:', targetGroups, 'isLoading:', isLoading);

  return (
    <div className="flex flex-wrap gap-2 py-4 justify-center">
      <Button
        variant={selectedTargetGroup === null ? "default" : "outline"}
        onClick={() => onSelectTargetGroup(null)}
        className="rounded-full"
      >
        Alle Zielgruppen
      </Button>
      {targetGroups && targetGroups.length > 0 ? (
        targetGroups.map((targetGroup) => (
          <Button
            key={targetGroup.id}
            variant={selectedTargetGroup === targetGroup.id ? "default" : "outline"}
            onClick={() => onSelectTargetGroup(selectedTargetGroup === targetGroup.id ? null : targetGroup.id)}
            className="rounded-full"
          >
            {getTargetGroupName(targetGroup)}
          </Button>
        ))
      ) : (
        !isLoading && <div className="text-sm text-gray-500">Keine Zielgruppen verfügbar</div>
      )}
    </div>
  );
}

