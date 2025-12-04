import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import ru from "./locales/ru.json";
import en from "./locales/en.json";
import uz from "./locales/uz.json";

// Получаем сохраненный язык ИЛИ устанавливаем русский по умолчанию
const savedLanguage = localStorage.getItem("lang");
if (!savedLanguage) {
    localStorage.setItem("lang", "ru");
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            en: { translation: en },
            uz: { translation: uz },
        },
        lng: savedLanguage || "ru", // Явно устанавливаем язык
        fallbackLng: "ru",
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;