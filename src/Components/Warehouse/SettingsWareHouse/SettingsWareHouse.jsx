import { useEffect, useState } from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Plus, Minus, Check } from "lucide-react";

export default function SettingsWareHouse() {
    const [zoom, setZoom] = useState(100);
    const [fontScale, setFontScale] = useState(100);
    const [barcodeMode, setBarcodeMode] = useState("auto"); // 'auto' | 'modal'

    const minZoom = 80, maxZoom = 150, step = 10;
    const minFont = 80, maxFont = 150;

    // Load saved settings
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

    // ✅ Yangi funksiya — barcode rejimini o‘zgartirish
    const handleBarcodeModeChange = (mode) => {
        setBarcodeMode(mode);
        localStorage.setItem("barcodeMode", mode);
    };

    return (
        <div>
            <Typography variant="h2" className="mb-6 font-semibold text-gray-800">
                Sozlamalar
            </Typography>

            {/* --- Ekran masshtabi --- */}
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

            {/* --- Matn hajmi --- */}
            <Card className="shadow-md rounded-2xl mb-6">
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
                        <Typography className="mb-2 font-medium">Sinov matni (test text)</Typography>
                        <p>
                            Bu joyda matn hajmini sinab ko‘rishingiz mumkin. Har safar siz qiymatni
                            o‘zgartirsangiz, matn darhol kattalashadi yoki kichrayadi.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button color="blue" onClick={resetAll}>
                            Tiklash hammasini
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* --- 🆕 Shtrix bilan ishlash usuli --- */}
            <Card className="shadow-md rounded-2xl">
                <CardBody className="p-6 flex flex-col gap-5">
                    <Typography variant="h6" className="text-gray-700">
                        Shtrix bilan ishlash usuli
                    </Typography>

                    <div className="flex gap-4">
                        <Button
                            onClick={() => handleBarcodeModeChange("auto")}
                            className={`flex-1 py-3 rounded-xl ${barcodeMode === "auto"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Avtomatik oxirgi partiyani tanlash
                            {barcodeMode === "auto" && <Check size={18} className="inline ml-2" />}
                        </Button>

                        <Button
                            onClick={() => handleBarcodeModeChange("modal")}
                            className={`flex-1 py-3 rounded-xl ${barcodeMode === "modal"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Modal orqali tanlash
                            {barcodeMode === "modal" && <Check size={18} className="inline ml-2" />}
                        </Button>
                    </div>

                    <div className="text-gray-600 text-sm border-t pt-3">
                        {barcodeMode === "auto" ? (
                            <p>
                                Shtrix urilganda tizim avtomatik tarzda oxirgi partiyani tanlaydi va
                                invoice-ga qo‘shadi. Tezroq ishlash uchun qulay.
                            </p>
                        ) : (
                            <p>
                                Shtrix urilganda tizim partiyalarni ro‘yxat ko‘rinishida chiqaradi va
                                siz keraklisini qo‘lda tanlaysiz. Aniqlik uchun qulay.
                            </p>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
