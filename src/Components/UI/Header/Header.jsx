import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Select, Option, Button } from "@material-tailwind/react";
import { Moon, Sun } from "lucide-react";

export default function Header() {
    const { i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);

    // При загрузке проверяем тему из localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const changeLanguage = (lng) => {
        if (lng) i18n.changeLanguage(lng);
    };

    return (
        <Navbar
            shadow={false}
            fullWidth
            className="flex bg-transparent border-transparent justify-end items-center p-0 min-h-[60px] mb-[10px]"
        >
            <div className="flex items-center gap-4">
                {/* Переключатель темы */}
                <Button
                    onClick={toggleDarkMode}
                    variant="outlined"
                    color={darkMode ? "blue-gray" : "blue"}
                    className="flex items-center gap-2 rounded-lg shadow-md px-4 py-2"
                >
                    {darkMode ? (
                        <>
                            <Sun size={18} />
                        </>
                    ) : (
                        <>
                            <Moon size={18} />
                        </>
                    )}
                </Button>

                {/* Выбор языка */}
                <div className="w-36 bg-white dark:bg-blue-gray-900 px-[10px] py-[5px] rounded-[10px] shadow-lg">
                    <Select
                        label="Язык"
                        value={i18n.language}
                        onChange={(lng) => changeLanguage(lng)}
                        size="md"
                        color="blue"
                        className="text-sm bg-transparent dark:text-white"
                        containerProps={{
                            className: "!min-w-0 !w-full",
                        }}
                        menuProps={{
                            className: "z-[9999]",
                        }}
                    >
                        <Option value="ru">Русский</Option>
                        <Option value="en">English</Option>
                        <Option value="uz">O‘zbek</Option>
                    </Select>
                </div>
            </div>
        </Navbar>
    );
}
