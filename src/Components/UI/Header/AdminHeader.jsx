import React, { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Option, Select } from "@material-tailwind/react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

export default function AdminHeader({ active, sidebarOpen, ...props }) {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const menuRef = useRef(null);
    const { t, i18n } = useTranslation();

    // Правильное определение темы по умолчанию
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        // Приоритет: сохраненная тема > системная тема > светлая тема
        const defaultTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

        setIsDarkMode(defaultTheme === "dark");

        if (defaultTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Сохраняем тему если ее еще нет
        if (!savedTheme) {
            localStorage.setItem("theme", defaultTheme);
        }
    }, []);

    // Установка дефолтного языка (если не выбран) - ИСПРАВЛЕНО
    useEffect(() => {
        const savedLang = localStorage.getItem("lang");
        if (!savedLang) {
            // Устанавливаем русский по умолчанию
            localStorage.setItem("lang", "ru");
            i18n.changeLanguage("ru");
        } else {
            // Если язык сохранен, применяем его
            i18n.changeLanguage(savedLang);
        }
    }, [i18n]);

    const toggleDarkMode = () => {
        const newDark = !isDarkMode;
        setIsDarkMode(newDark);
        if (newDark) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Закрытие дропдауна при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLanguage = (lng) => {
        if (lng) {
            i18n.changeLanguage(lng);
            localStorage.setItem("lang", lng);
        }
    };

    const handleProfile = () => {
        const nesw = Cookies.get("nesw");
        if (nesw === "SefwfmgrUID") navigate("/factory/profile");
        else if (nesw === "SesdsdfmgrUID") navigate("/warehouse/profile");
        else navigate("/profile");
    };

    return (
        <div
            className={`header fixed top-[10px] w-full z-30 flex justify-between items-center mb-6 px-3 py-2 rounded-2xl border shadow-lg transition-all duration-500 ${isDarkMode
                ? "bg-transparent backdrop-blur-md border-gray-700 shadow-gray-900/20"
                : "bg-transparent backdrop-blur-md border-gray-200"
                }`}
            style={{
                maxWidth: sidebarOpen ? "calc(99% - 300px)" : "calc(99% - 120px)",
                left: sidebarOpen ? "310px" : "120px",
            }}
        >
            {/* Кнопка назад */}
            <div className="flex items-center gap-[20px]">
                <Button
                    onClick={() => navigate(-1)}
                    className={`backbtn px-4 py-[5px] rounded-xl transition-all duration-300 ${isDarkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-black hover:bg-black text-white"
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 16 16">
                        <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="m2.87 7.75l1.97 1.97a.75.75 0 1 1-1.06 1.06L.53 7.53L0 7l.53-.53l3.25-3.25a.75.75 0 0 1 1.06 1.06L2.87 6.25h9.88a3.25 3.25 0 0 1 0 6.5h-2a.75.75 0 0 1 0-1.5h2a1.75 1.75 0 1 0 0-3.5z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </Button>
            </div>

            {/* Селектор языка, темная тема, профиль */}
            <div className="flex items-center gap-[10px]">
                {/* Селектор языка */}
                <div className={`w-[80px] rounded-[10px] shadow-lg ${isDarkMode
                    ? "bg-gray-800/80 backdrop-blur-md"
                    : "bg-white/80 backdrop-blur-md"
                    }`}>
                    <Select
                        value={i18n.language || "ru"}
                        onChange={(lng) => changeLanguage(lng)}
                        size="md"
                        color={isDarkMode ? "blue-gray" : "blue"}
                        containerProps={{ className: "!min-w-0 !w-full" }}
                        className={`outline-none ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                        labelProps={{
                            className: isDarkMode ? "text-gray-300" : "text-gray-700"
                        }}
                        menuProps={{
                            className: isDarkMode
                                ? "dark:bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        }}
                    >
                        <Option value="ru">Ru</Option>
                        <Option value="en">En</Option>
                        <Option value="uz">Uz</Option>
                    </Select>
                </div>

                {/* Темная/светлая тема */}
                <button
                    onClick={toggleDarkMode}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl border shadow transition-all duration-500 ${isDarkMode
                        ? "bg-gray-800/80 hover:bg-gray-700/80 border-gray-600 text-yellow-300 backdrop-blur-md"
                        : "bg-white/80 hover:bg-gray-100/80 border-gray-300 text-gray-700 backdrop-blur-md"
                        } ${isHovered ? "scale-110 rotate-12" : "scale-100 rotate-0"}`}
                    title={isDarkMode ? "Светлый режим" : "Тёмный режим"}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Профиль */}
                <div className="relative flex items-center gap-[5px]" ref={menuRef}>
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        className={`header__profile_per flex items-center gap-[3px] px-[10px] py-1 rounded-xl border shadow transition-all duration-300 text-sm font-medium backdrop-blur-md ${isDarkMode
                            ? "bg-gray-800/80 hover:bg-gray-700/80 border-gray-600 text-white"
                            : "bg-white/80 hover:bg-gray-100/80 border-gray-300 text-gray-800"
                            }`}
                    >
                        <div className={`p-2 rounded-full backdrop-blur-md ${isDarkMode ? "bg-gray-700/80" : "bg-gray-200/80"
                            }`}>
                            <User className="w-4 h-4" />
                        </div>
                        <ChevronDown className={`iconHeader w-4 h-4 transition-transform duration-300 ${openMenu ? "rotate-180" : ""
                            }`} />
                    </button>

                    {openMenu && (
                        <div
                            className={`absolute right-0 top-16 w-48 backdrop-blur-xl border shadow-xl rounded-xl py-2 z-50 overflow-hidden ${isDarkMode
                                ? "bg-gray-800/95 border-gray-600"
                                : "bg-white/95 border-gray-200"
                                }`}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-300"
                                }`} />
                            <button
                                onClick={handleProfile}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-all duration-200 ${isDarkMode
                                    ? "text-white hover:bg-gray-700/50"
                                    : "text-gray-700 hover:bg-gray-100/50"
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span>{t('Profil')}</span>
                            </button>
                            <div className={`h-px my-1 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                }`} />
                            <button
                                onClick={handleLogout}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 transition-all duration-200 ${isDarkMode
                                    ? "text-red-400 hover:bg-red-900/20"
                                    : "text-red-600 hover:bg-red-50/50"
                                    }`}
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t('Out')}</span>
                            </button>
                        </div>
                    )}
                    {props.children}
                </div>
            </div>
        </div>
    );
}