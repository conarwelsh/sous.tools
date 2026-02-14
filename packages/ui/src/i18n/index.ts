import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Type safety for resources
const resources = {
  en: {
    common: {
      welcome: "Welcome to Sous",
      pairing: "Pair Device",
      saving: "Saving...",
      saved: "Saved successfully!",
    },
    culinary: {
      recipes: "Recipes",
      ingredients: "Ingredients",
    },
  },
  es: {
    common: {
      welcome: "Bienvenido a Sous",
      pairing: "Emparejar dispositivo",
      saving: "Guardando...",
      saved: "¡Guardado con éxito!",
    },
    culinary: {
      recipes: "Recetas",
      ingredients: "Ingredientes",
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    defaultNS: "common",
  });

export default i18n;
