'use client';

import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';

interface TargetGroup {
  id: string;
  name: string;
}

interface TargetGroupFilterProps {
  selectedTargetGroup: string | null;
  onSelectTargetGroup: (targetGroup: string | null) => void;
}

export function TargetGroupFilter({ selectedTargetGroup, onSelectTargetGroup }: TargetGroupFilterProps) {
  // Zielgruppen aus der API laden
  const { data: targetGroups = [], isLoading } = useQuery<TargetGroup[]>({
    queryKey: ['target-groups'],
    queryFn: async () => {
      const response = await fetch('/api/target-groups');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Zielgruppen');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-4">Zielgruppen werden geladen...</div>;
  }

  if (targetGroups.length === 0) {
    return null; // Keine Zielgruppen vorhanden, Filter nicht anzeigen
  }

  return (
    <div className="flex flex-wrap gap-2 py-4 justify-center">
      <Button
        variant={selectedTargetGroup === null ? "default" : "outline"}
        onClick={() => onSelectTargetGroup(null)}
        className="rounded-full"
      >
        Alle
      </Button>
      {targetGroups.map((targetGroup) => (
        <Button
          key={targetGroup.id}
          variant={selectedTargetGroup === targetGroup.id ? "default" : "outline"}
          onClick={() => onSelectTargetGroup(targetGroup.id)}
          className="rounded-full"
        >
          {targetGroup.name}
        </Button>
      ))}
    </div>
  );
}