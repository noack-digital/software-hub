'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import deMessages from '../../messages/de/index.json';
import enMessages from '../../messages/en/index.json';

// Verfügbare Sprachen
export const languages = ['de', 'en'];

// Übersetzungen
const translations = {
  de: deMessages,
  en: enMessages
};

// Kontext erstellen
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Sprache aus localStorage laden oder Standardsprache verwenden
  const [language, setLanguage] = useState('de');
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && languages.includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  // Sprache ändern und im localStorage speichern
  const changeLanguage = (newLanguage) => {
    if (languages.includes(newLanguage)) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  // Übersetzungsfunktion
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return keys[keys.length - 1]; // Fallback: letzten Teil des Schlüssels zurückgeben
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook für den Zugriff auf den Kontext
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}