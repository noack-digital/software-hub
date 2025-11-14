'use client';

import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';

interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { language, t } = useLanguage();
  
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

  // Hilfsfunktion zum Abrufen des Kategorien-Namens je nach Sprache
  const getCategoryName = (category: Category) => {
    if (language === 'en' && category.nameEn) {
      return category.nameEn;
    }
    return category.name;
  };

  if (isLoading) {
    return <div className="flex justify-center py-4">{t('common.loading')}</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 py-4 justify-center">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onSelectCategory(null)}
        className="rounded-full"
      >
        {t('categories.all') || 'Alle'}
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onSelectCategory(category.id)}
          className="rounded-full"
        >
          {getCategoryName(category)}
        </Button>
      ))}
    </div>
  );
}
