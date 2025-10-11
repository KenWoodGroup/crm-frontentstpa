import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Typography,
    Input,
} from "@material-tailwind/react";
import JsBarcode from "jsbarcode";
import Cookies from "js-cookie";
import { locationInfo } from "../../../../utils/Controllers/locationInfo";
import { Stock } from "../../../../utils/Controllers/Stock";
import { Alert } from "../../../../utils/Alert";

export default function MahsulotQoshishModal({ productId }) {
    const [open, setOpen] = useState(false);
    const [factoryCode, setFactoryCode] = useState("0000");
    const [form, setForm] = useState({
        product_id: productId,
        location_id: Cookies?.get("ul_nesw"),
        quantity: 0,
        price: 0,
        barcode: "",
    });
    const [generated, setGenerated] = useState(false);
    const canvasRef = useRef(null);

    const handleOpen = () => {
        setOpen(!open);
        setForm({
            product_id: productId,
            location_id: Cookies?.get("ul_nesw"),
            quantity: 0,
            price: 0,
            barcode: "",
        });
        setGenerated(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((old) => ({ ...old, [name]: value }));
    };

    const getBarcode = async () => {
        try {
            const response = await locationInfo.GetBarcode(Cookies.get("usd_nesw"));
            const raw = response?.data?.key;
            const onlyDigits = String(raw).replace(/\D/g, "");
            setFactoryCode(onlyDigits.padStart(4, "0"));
        } catch (error) {
            console.log("Zavod kodini olishda xatolik:", error);
            setFactoryCode("0001");
        }
    };

    useEffect(() => {
        if (open) getBarcode();
    }, [open]);

    const calculateCheckDigit = (code12) => {
        const digits = code12.split("").map(Number);
        const sum = digits.reduce(
            (acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3),
            0
        );
        const check = (10 - (sum % 10)) % 10;
        return check;
    };

    const handleGenerate = async () => {
        const countryCode = "478";
        const plantCode = factoryCode.padStart(4, "0");
        const randomPart = Math.floor(100000 + Math.random() * 900000).toString();

        const code12 = (countryCode + plantCode + randomPart).slice(0, 12);
        const checkDigit = calculateCheckDigit(code12);
        const fullBarcode = code12 + checkDigit;

        if (!/^\d{13}$/.test(fullBarcode)) {
            Alert("Barcode noto‘g‘ri generatsiya qilindi!", "error");
            return;
        }

        setForm((old) => ({ ...old, barcode: fullBarcode }));
        setGenerated(true);

        try {
            await Stock.CreateBarcode({
                ...form,
                barcode: fullBarcode,
            });

            Alert("Muvaffaqiyatli yaratildi", "success");
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        }
    };

    const handleManualSubmit = async () => {
        if (!form.barcode || !/^\d{13}$/.test(form.barcode)) {
            Alert("Barcode 13 raqamdan iborat bo‘lishi kerak!", "error");
            return;
        }

        try {
            await Stock.CreateBarcode(form);
            setGenerated(true);
            Alert("Muvaffaqiyatli qo‘lda yaratildi", "success");
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        }
    };

    useEffect(() => {
        if (form.barcode && generated && /^\d{13}$/.test(form.barcode)) {
            JsBarcode(canvasRef.current, form.barcode, {
                format: "EAN13",
                displayValue: true,
                fontSize: 16,
                lineColor: "#000",
                width: 2,
                height: 80,
            });
        }
    }, [form.barcode, generated]);

    return (
        <div>
            <Button
                onClick={handleOpen}
                className="text-white px-6 py-2 rounded-xl transition"
            >
                Barcode qo‘shish
            </Button>

            <Dialog open={open} handler={handleOpen} className="p-2">
                <DialogHeader>
                    <Typography variant="h5" className="text-gray-800 font-semibold">
                        Barcode yaratish
                    </Typography>
                </DialogHeader>

                <DialogBody className="flex flex-col items-center gap-4">
                    {/* Ручной ввод штрихкода */}
                    <div className="flex items-center gap-2 w-full">
                        <Input
                            label="Qo‘lda barcode kiritish (EAN-13)"
                            name="barcode"
                            type="text"
                            value={form.barcode}
                            onChange={handleChange}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleGenerate}
                            className="text-white rounded-lg"
                        >
                            Yratish
                        </Button>
                    </div>

                    {generated && (
                        <div className="flex flex-col items-center border rounded-lg p-3">
                            <canvas ref={canvasRef}></canvas>
                            <Typography className="mt-2 text-sm text-gray-600">
                                {form.barcode}
                            </Typography>
                        </div>
                    )}
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="outlined"
                        color="gray"
                        onClick={handleOpen}
                        className="rounded-xl"
                    >
                        Yopish
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}
