import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, Select, Option, Button } from "@material-tailwind/react";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const { i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate

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
            className="flex bg-transparent border-transparent justify-between items-center p-0 min-h-[60px] mb-[10px]"
        >
            <div>
                <Button onClick={() => navigate(-1)} className="py-[8px] flex items-center justify-center">
                    <svg className="text-[25px] " xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24"><path fill="currentColor" d="m4 10l-.707.707L2.586 10l.707-.707zm17 8a1 1 0 1 1-2 0zM8.293 15.707l-5-5l1.414-1.414l5 5zm-5-6.414l5-5l1.414 1.414l-5 5zM4 9h10v2H4zm17 7v2h-2v-2zm-7-7a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5z"></path></svg>
                </Button>
            </div>
            <div className="flex items-center gap-4">
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
                <div className="w-36 bg-white dark:bg-card-dark px-[10px] py-[5px] rounded-[10px] shadow-lg">
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
