'use client';

import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  // Kategorien aus der API laden
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Kategorien');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-4">Kategorien werden geladen...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 py-4 justify-center">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onSelectCategory(null)}
        className="rounded-full"
      >
        Alle
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onSelectCategory(category.id)}
          className="rounded-full"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
