// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import swTranslation from '../locales/sw/translation.json';
import soTranslation from '../locales/so/translation.json';
import arTranslation from '../locales/ar/translation.json';
import frTranslation from '../locales/fr/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  sw: {
    translation: swTranslation
  },
  so: {
    translation: soTranslation
  },
  ar: {
    translation: arTranslation
  },
  fr: {
    translation: frTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Save language preference
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;