'use client';

import { Button } from '@/components/ui/button';
import { useLanguage, languages } from '@/lib/LanguageContext';

export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <Button
          key={lang}
          variant={lang === language ? 'default' : 'outline'}
          size="sm"
          onClick={() => changeLanguage(lang)}
          className="w-10"
        >
          {lang.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}