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
        fallbackLng: "ru", // 🇷🇺 Если не найден язык, используем русский
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"],
            lookupLocalStorage: "lang",
        },
        react: {
            useSuspense: false,
        },
    });

// 👇 Если не выбран язык, принудительно ставим русский
const currentLang = i18n.language || localStorage.getItem("lang");
if (!currentLang) {
    i18n.changeLanguage("ru");
    localStorage.setItem("lang", "ru");
}

export default i18n;
