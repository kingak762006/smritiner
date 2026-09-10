import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import as from './as.json';
import hi from './hi.json';
import mr from './mr.json';

const translations = { en, as, hi, mr };

export const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('smriti_locale') || 'as'; // Default to Assamese for NER cultural focus
  });

  useEffect(() => {
    localStorage.setItem('smriti_locale', locale);
  }, [locale]);

  const t = (key) => {
    const keys = key.split('.');
    let current = translations[locale] || translations.en;
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English if missing
        let fallback = translations.en;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            return key;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  const getVoiceLocale = () => {
    switch (locale) {
      case 'as': return 'as-IN';
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-IN';
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, getVoiceLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
