import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../translations/fr';
import { en } from '../translations/en';

const LanguageContext = createContext();

const translations = {
  fr,
  en
};

const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const DEFAULT_LANGUAGE = 'fr'; // French as base language

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Try to get saved language from localStorage
    const savedLanguage = localStorage.getItem('foy-lekke-language');
    return savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage) 
      ? savedLanguage 
      : DEFAULT_LANGUAGE;
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('foy-lekke-language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key, fallback = '') => {
    // Split the key by dots to navigate nested objects
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If key not found in current language, try English as fallback
        if (currentLanguage !== 'en') {
          let englishValue = translations.en;
          for (const k2 of keys) {
            if (englishValue && typeof englishValue === 'object' && k2 in englishValue) {
              englishValue = englishValue[k2];
            } else {
              englishValue = null;
              break;
            }
          }
          if (englishValue && typeof englishValue === 'string') {
            return englishValue;
          }
        }
        // Return fallback if key not found in any language
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  // Function to handle pluralization
  const tc = (count, singleKey, pluralKey) => {
    return count === 1 ? t(singleKey) : t(pluralKey);
  };

  // Function to format time ago
  const formatTimeAgo = (count, unit) => {
    const unitKey = `reviews.timeAgo.${unit}`;
    const unitText = t(unitKey);
    return `${count} ${unitText}`;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
    tc,
    formatTimeAgo
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;