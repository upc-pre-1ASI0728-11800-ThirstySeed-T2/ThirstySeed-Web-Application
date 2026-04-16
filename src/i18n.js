import { createI18n } from 'vue-i18n';
import en from './i18n/en.json';
import es from './i18n/es.json';

const i18n = createI18n({
  locale: 'en', // Cambiado a inglés por defecto
  fallbackLocale: 'es', // Español como idioma de respaldo
  messages: {
    en,
    es
  }
});

export default i18n;
