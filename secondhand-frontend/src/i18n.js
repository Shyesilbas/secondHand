import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationTR from './locales/tr/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  tr: {
    translation: translationTR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Default is English as requested
    lng: 'en', // Force default language to English
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
