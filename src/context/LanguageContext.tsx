import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SharedPreferences } from '../utilities/SharedPreferences';
import translations, { type Language, type Translations } from '../utilities/translations';

interface LanguageContextType {
  currentLanguage: Language;
  translations: Translations;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  // Load initial language
  useEffect(() => {
    const loadInitialLanguage = async () => {
      try {
        const savedLanguage = await SharedPreferences.get('language') as Language;
        console.log("Initial language loaded:", savedLanguage);
        if (savedLanguage && ['en', 'az', 'ru'].includes(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
        }
      } catch (error) {
        console.error("Error loading language:", error);
      } finally {
        setIsLanguageLoaded(true);
      }
    };
    loadInitialLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await SharedPreferences.set('language', lang);
      setCurrentLanguage(lang);
      console.log("Language changed to:", lang);
    } catch (error) {
      console.error("Error setting language:", error);
    }
  };

  if (!isLanguageLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        translations: translations[currentLanguage],
        setLanguage 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 