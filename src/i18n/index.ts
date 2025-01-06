import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en';
import zhTranslation from './zh';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    zh: {
      translation: zhTranslation,
    },
  },
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 