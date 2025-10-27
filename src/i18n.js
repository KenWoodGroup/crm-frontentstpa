import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Импортируем переводы
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import uz from "./locales/uz.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            en: { translation: en },
            uz: { translation: uz },
        },
        fallbackLng: "ru", // 🇷🇺 Русский по умолчанию
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"], // язык будет запоминаться
        },
    });

export default i18n;
