import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Plus, Minus, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsWareHouse() {
    const [zoom, setZoom] = useState(100);
    const { t } = useTranslation();
    const [fontScale, setFontScale] = useState(100);
    const [barcodeMode, setBarcodeMode] = useState("auto"); // 'auto' | 'modal'

    const minZoom = 80, maxZoom = 150, step = 10;
    const minFont = 80, maxFont = 150;

    useEffect(() => {
        const savedZoom = localStorage.getItem("appZoom");
        const savedFont = localStorage.getItem("textFontScale");
        const savedBarcodeMode = localStorage.getItem("barcodeMode");

        if (savedZoom) {
            const v = Number(savedZoom);
            setZoom(v);
            applyZoom(v);
        }
        if (savedFont) {
            const v = Number(savedFont);
            setFontScale(v);
            applyFontScale(v);
        }
        if (savedBarcodeMode) {
            setBarcodeMode(savedBarcodeMode);
        }
    }, []);

    const applyZoom = (v) => (document.body.style.zoom = `${v}%`);
    const applyFontScale = (p) => (document.documentElement.style.fontSize = `${(p / 100) * 16}px`);

    const handleZoomChange = (v) => {
        const c = Math.min(maxZoom, Math.max(minZoom, v));
        setZoom(c);
        applyZoom(c);
        localStorage.setItem("appZoom", c);
    };

    const handleFontChange = (v) => {
        const c = Math.min(maxFont, Math.max(minFont, v));
        setFontScale(c);
        applyFontScale(c);
        localStorage.setItem("textFontScale", c);
    };

    const resetAll = () => {
        setZoom(100);
        setFontScale(100);
        applyZoom(100);
        applyFontScale(100);
        localStorage.setItem("appZoom", 100);
        localStorage.setItem("textFontScale", 100);
    };

    const handleBarcodeModeChange = (mode) => {
        setBarcodeMode(mode);
        localStorage.setItem("barcodeMode", mode);
    };

    return (
        <div className="transition-colors duration-300 pb-4 xs:pb-6 sm:pb-[30px] px-2 xs:px-4 sm:px-0">
            <Typography
                variant="h2"
                className="mb-4 xs:mb-5 sm:mb-6 font-semibold text-gray-800 dark:text-gray-100 text-xl xs:text-2xl sm:text-3xl lg:text-4xl"
            >
                {t('Settings')}
            </Typography>

            {/* --- Ekran masshtabi --- */}
            <Card className="shadow-md rounded-xl xs:rounded-2xl mb-4 xs:mb-5 sm:mb-6 bg-card-light dark:bg-card-dark transition-colors">
                <CardBody className="p-4 xs:p-5 sm:p-6 flex flex-col gap-3 xs:gap-4">
                    <Typography variant="h6" className="text-gray-700 dark:text-gray-200 text-sm xs:text-base">
                        {t('Mon_mash')}
                    </Typography>
                    <div className="flex items-center justify-start xs:justify-start gap-3 xs:gap-4">
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleZoomChange(zoom - step)}
                            disabled={zoom <= minZoom}
                            className="p-2 dark:border-gray-600 dark:text-gray-200 min-w-10"
                        >
                            <Minus size={16} className="xs:size-[18px]" />
                        </Button>
                        <Typography
                            variant="h5"
                            className="w-12 xs:w-16 text-center text-gray-800 dark:text-gray-100 text-base xs:text-lg"
                        >
                            {zoom}%
                        </Typography>
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleZoomChange(zoom + step)}
                            disabled={zoom >= maxZoom}
                            className="p-2 dark:border-gray-600 dark:text-gray-200 min-w-10"
                        >
                            <Plus size={16} className="xs:size-[18px]" />
                        </Button>
                    </div>
                </CardBody>
            </Card>
            {/* --- Matn hajmi --- */}
            <Card className="shadow-md rounded-xl xs:rounded-2xl mb-4 xs:mb-5 sm:mb-6 bg-card-light dark:bg-card-dark transition-colors">
                <CardBody className="p-4 xs:p-5 sm:p-6 flex flex-col gap-4 xs:gap-5 sm:gap-6">
                    <Typography variant="h6" className="text-gray-700 dark:text-gray-200 text-sm xs:text-base">
                        {t('Text_size')}
                    </Typography>
                    <div className="flex items-center justify-start xs:justify-start gap-3 xs:gap-4">
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleFontChange(fontScale - step)}
                            disabled={fontScale <= minFont}
                            className="p-2 dark:border-gray-600 dark:text-gray-200 min-w-10"
                        >
                            <Minus size={16} className="xs:size-[18px]" />
                        </Button>
                        <Typography
                            variant="h5"
                            className="w-12 xs:w-16 text-center text-gray-800 dark:text-gray-100 text-base xs:text-lg"
                        >
                            {fontScale}%
                        </Typography>
                        <Button
                            color="blue-gray"
                            variant="outlined"
                            onClick={() => handleFontChange(fontScale + step)}
                            disabled={fontScale >= maxFont}
                            className="p-2 dark:border-gray-600 dark:text-gray-200 min-w-10"
                        >
                            <Plus size={16} className="xs:size-[18px]" />
                        </Button>
                    </div>

                    <input
                        type="range"
                        min={minFont}
                        max={maxFont}
                        step="5"
                        value={fontScale}
                        onChange={(e) => handleFontChange(Number(e.target.value))}
                        className="w-full accent-blue-500 dark:accent-blue-400 h-2 xs:h-3"
                    />

                    <div
                        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-3 xs:p-4 sm:p-5 mt-2 xs:mt-3 sm:mt-4 transition-colors"
                        style={{
                            fontSize: `${(fontScale / 100) * 16}px`,
                            transition: "font-size 0.2s ease",
                        }}
                    >
                        <Typography className="mb-1 xs:mb-2 font-medium text-gray-800 dark:text-gray-100 text-sm xs:text-base">
                            {t('Test_text')}
                        </Typography>
                        <p className="text-gray-600 dark:text-gray-300 text-xs xs:text-sm">
                            {t('Test_text2')}
                        </p>
                    </div>

                    <div className="flex justify-start xs:justify-end gap-2 xs:gap-3">
                        <Button
                            color="blue"
                            onClick={resetAll}
                            className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-xs xs:text-sm px-3 xs:px-4 py-2 xs:py-3"
                        >
                            {t('restart')}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* --- 🆕 Shtrix bilan ishlash usuli --- */}
            <Card className="shadow-md rounded-xl xs:rounded-2xl bg-card-light dark:bg-card-dark transition-colors">
                <CardBody className="p-4 xs:p-5 sm:p-6 flex flex-col gap-3 xs:gap-4 sm:gap-5">
                    <Typography variant="h6" className="text-gray-700 dark:text-gray-200 text-sm xs:text-base">
                        {t("Qr_text")}
                    </Typography>

                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
                        <Button
                            onClick={() => handleBarcodeModeChange("auto")}
                            className={`py-2 xs:py-3 rounded-lg xs:rounded-xl transition-colors text-xs xs:text-sm ${barcodeMode === "auto"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {t('Qr_text2')}
                            {barcodeMode === "auto" && <Check size={14} className="xs:size-[18px] inline ml-1 xs:ml-2" />}
                        </Button>

                        <Button
                            onClick={() => handleBarcodeModeChange("modal")}
                            className={`py-2 xs:py-3 rounded-lg xs:rounded-xl transition-colors text-xs xs:text-sm ${barcodeMode === "modal"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                        >
                            {t('Qr_text3')}
                            {barcodeMode === "modal" && <Check size={14} className="xs:size-[18px] inline ml-1 xs:ml-2" />}
                        </Button>
                    </div>

                    <div className="text-gray-600 dark:text-gray-300 text-xs xs:text-sm border-t border-gray-200 dark:border-gray-700 pt-2 xs:pt-3">
                        {barcodeMode === "auto" ? (
                            <p>
                                {t('Qr_text4')}
                            </p>
                        ) : (
                            <p>
                                {t('Qr_text5')}
                            </p>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
