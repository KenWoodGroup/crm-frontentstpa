import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FactorySettings() {
    const { t } = useTranslation();

    const [zoom, setZoom] = useState(100);
    const [fontScale, setFontScale] = useState(100);
    const [darkMode, setDarkMode] = useState(false);

    const minZoom = 80;
    const maxZoom = 150;
    const step = 10;

    const minFont = 80;
    const maxFont = 150;

    // Загружаем сохранённые настройки
    useEffect(() => {
        const savedZoom = localStorage.getItem("appZoom");
        const savedFont = localStorage.getItem("textFontScale");
        const savedTheme = localStorage.getItem("theme");

        if (savedZoom) {
            const value = Number(savedZoom);
            setZoom(value);
            applyZoom(value);
        }

        if (savedFont) {
            const value = Number(savedFont);
            setFontScale(value);
            applyFontScale(value);
        }

        if (savedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const applyZoom = (value) => {
        document.body.style.zoom = `${value}%`;
    };

    const applyFontScale = (percent) => {
        document.documentElement.style.fontSize = `${(percent / 100) * 16}px`;
    };

    const handleZoomChange = (newZoom) => {
        const clamped = Math.min(maxZoom, Math.max(minZoom, newZoom));
        setZoom(clamped);
        applyZoom(clamped);
        localStorage.setItem("appZoom", clamped);
    };

    const handleFontChange = (newScale) => {
        const clamped = Math.min(maxFont, Math.max(minFont, newScale));
        setFontScale(clamped);
        applyFontScale(clamped);
        localStorage.setItem("textFontScale", clamped);
    };

    const resetAll = () => {
        setZoom(100);
        setFontScale(100);
        applyZoom(100);
        applyFontScale(100);
        localStorage.setItem("appZoom", 100);
        localStorage.setItem("textFontScale", 100);
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <div className="transition-colors duration-300 bg-background-light dark:bg-background-dark min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h2" className="font-semibold text-text-light dark:text-text-dark">
                    {t("Settings")}
                </Typography>
            </div>

            {/* --- Масштаб экрана --- */}
            <Card className="shadow-md rounded-2xl mb-6 bg-card-light dark:bg-card-dark transition-colors duration-300">
                <CardBody className="p-6 flex flex-col gap-4">
                    <Typography variant="h6" className="text-text-light dark:text-text-dark">
                        {t("Screen_Zoom")}
                    </Typography>

                    <div className="flex items-center gap-4">
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleZoomChange(zoom - step)}
                            disabled={zoom <= minZoom}
                            className="p-2"
                        >
                            <Minus size={18} />
                        </Button>

                        <Typography variant="h5" className="w-16 text-center text-text-light dark:text-text-dark">
                            {zoom}%
                        </Typography>

                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleZoomChange(zoom + step)}
                            disabled={zoom >= maxZoom}
                            className="p-2"
                        >
                            <Plus size={18} />
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* --- Размер текста --- */}
            <Card className="shadow-md rounded-2xl bg-card-light dark:bg-card-dark transition-colors duration-300">
                <CardBody className="p-6 flex flex-col gap-6">
                    <Typography variant="h6" className="text-text-light dark:text-text-dark">
                        {t("Text_Size")}
                    </Typography>

                    <div className="flex items-center gap-4">
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleFontChange(fontScale - step)}
                            disabled={fontScale <= minFont}
                            className="p-2"
                        >
                            <Minus size={18} />
                        </Button>

                        <Typography variant="h5" className="w-16 text-center text-text-light dark:text-text-dark">
                            {fontScale}%
                        </Typography>

                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleFontChange(fontScale + step)}
                            disabled={fontScale >= maxFont}
                            className="p-2"
                        >
                            <Plus size={18} />
                        </Button>
                    </div>

                    <input
                        type="range"
                        min={minFont}
                        max={maxFont}
                        step="5"
                        value={fontScale}
                        onChange={(e) => handleFontChange(Number(e.target.value))}
                        className="w-full accent-blue-500"
                    />

                    <div
                        className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-5 mt-4 transition-all duration-300"
                        style={{
                            fontSize: `${(fontScale / 100) * 16}px`,
                        }}
                    >
                        <Typography className="mb-2 font-medium text-text-light dark:text-text-dark">
                            {t("Sample_Text")}
                        </Typography>
                        <p className="text-text-light dark:text-text-dark">
                            {t("Text_Size_Description")}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button color="blue" onClick={resetAll}>
                            {t("Reset_All")}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
