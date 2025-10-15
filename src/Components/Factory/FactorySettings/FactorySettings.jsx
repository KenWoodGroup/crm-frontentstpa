import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Plus, Minus } from "lucide-react";

export default function FactorySettings() {
    const [zoom, setZoom] = useState(100); // масштаб в %
    const [fontScale, setFontScale] = useState(100); // размер шрифта в %

    const minZoom = 80;
    const maxZoom = 150;
    const step = 10;

    const minFont = 80;
    const maxFont = 150;
    const defaultFont = 100;

    // Загружаем сохранённые настройки
    useEffect(() => {
        const savedZoom = localStorage.getItem("appZoom");
        const savedFont = localStorage.getItem("textFontScale");

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
    }, []);

    // ✅ Масштаб экрана без ломки fixed
    const applyZoom = (value) => {
        document.body.style.zoom = `${value}%`;
    };

    // ✅ Изменяем размер шрифта глобально
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

    return (
        <div>
            <Typography variant="h2" className="mb-6 font-semibold text-gray-800">
                Sozlamalar
            </Typography>

            {/* --- Масштаб экрана --- */}
            <Card className="shadow-md rounded-2xl mb-6">
                <CardBody className="p-6 flex flex-col gap-4">
                    <Typography variant="h6" className="text-gray-700">
                        Ekran masshtabi
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

                        <Typography variant="h5" className="w-16 text-center">
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
            <Card className="shadow-md rounded-2xl">
                <CardBody className="p-6 flex flex-col gap-6">
                    <Typography variant="h6" className="text-gray-700">
                        Matn hajmi
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

                        <Typography variant="h5" className="w-16 text-center">
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
                        className="w-full"
                    />

                    <div
                        className="border border-gray-200 bg-white rounded-lg p-5 mt-4"
                        style={{
                            fontSize: `${(fontScale / 100) * 16}px`,
                            transition: "font-size 0.2s ease",
                        }}
                    >
                        <Typography className="mb-2 font-medium">
                            Sinov matni (test text)
                        </Typography>
                        <p>
                            Bu joyda matn hajmini sinab ko‘rishingiz mumkin. Har safar siz
                            qiymатni o‘zgartirsangiz, matn darhol kattalashadi yoki
                            kichrayadi.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button color="blue" onClick={resetAll}>
                            Tiklash hammasini
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
