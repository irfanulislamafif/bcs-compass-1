import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';

const STORAGE_KEY = 'bcs_compass_language';

const savedLanguage =
  typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY)
    : null;

const initialLanguage =
  savedLanguage === 'bn' || savedLanguage === 'en' ? savedLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

/* Persist language changes */
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    /* ignore */
  }
});

/* Set initial lang attribute */
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export default i18n;