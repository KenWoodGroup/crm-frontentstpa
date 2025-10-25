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

export default function MahsulotQoshishModal({ productId, data, refresh }) {

    const [open, setOpen] = useState(false);
    const [factoryCode, setFactoryCode] = useState("0000");
    const [form, setForm] = useState({
        product_id: productId,
        location_id: Cookies?.get("ul_nesw"),
        quantity: 0,
        purchase_price: 0,
        barcode: "",
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [barcodeGenerated, setBarcodeGenerated] = useState(false);
    const canvasRef = useRef(null);

    const handleOpen = () => {
        setOpen(!open);
        if (!open) {
            initializeForm();
        }
    };

    // Инициализация формы
    const initializeForm = () => {
        if (data?.barcode) {
            setForm({
                product_id: productId,
                location_id: Cookies?.get("ul_nesw"),
                quantity: Number(data.quantity) || 0,
                purchase_price: Number(data.purchase_price) || 0,
                barcode: data.barcode,
            });
            setIsSaved(true);
            setIsEdit(true);
            setEditMode(false);
            setBarcodeGenerated(true);
        } else {
            resetForm();
        }
    };

    const resetForm = () => {
        setForm({
            product_id: productId,
            location_id: Cookies?.get("ul_nesw"),
            quantity: 0,
            purchase_price: 0,
            barcode: "",
        });
        setIsSaved(false);
        setIsEdit(false);
        setEditMode(false);
        setBarcodeGenerated(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "barcode") {
            const digits = value.replace(/\D/g, "").slice(0, 13);
            setForm((old) => ({ ...old, [name]: digits }));
            setBarcodeGenerated(false);
            setIsSaved(false);
        } else {
            setForm((old) => ({ ...old, [name]: value }));
        }
    };

    const getBarcode = async () => {
        try {
            const response = await locationInfo.GetBarcode(Cookies.get("usd_nesw"));
            const raw = response?.data?.value;
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

    const handleGenerate = () => {
        const countryCode = "478";
        const plantCode = factoryCode.padStart(4, "0");
        const randomPart = Math.floor(100000 + Math.random() * 900000).toString();

        const code12 = (countryCode + plantCode + randomPart).slice(0, 12);
        const checkDigit = calculateCheckDigit(code12);
        const fullBarcode = code12 + checkDigit;

        if (!/^\d{13}$/.test(fullBarcode)) {
            Alert("Barcode noto'g'ri generatsiya qilindi!", "error");
            return;
        }

        setForm((old) => ({ ...old, barcode: fullBarcode }));
        setBarcodeGenerated(true);
        setIsSaved(false);
    };

    const handleSave = async () => {
        if (!form.barcode || form.barcode.length !== 13) {
            Alert("Barcode 13 ta raqamdan iborat bo'lishi kerak!", "error");
            return;
        }

        try {
            if (isEdit) {
                await Stock.EditStock({ form, id: data?.stock_id });
                Alert("Barcode muvaffaqiyatli yangilandi", "success");
                setEditMode(false);
                refresh()   
            } else {
                await Stock.CreateBarcode(form);
                Alert("Muvaffaqiyatli yaratildi", "success");
            }
            setIsSaved(true);
            setIsEdit(true);
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        }
    };

    const handleEdit = () => {
        setEditMode(true);
        setBarcodeGenerated(true);
    };

    const handleCancelEdit = () => {
        initializeForm();
    };

    const handlePrint = () => {
        const canvas = canvasRef.current;

        if (canvas) {
            const printWindow = window.open('', '_blank', 'width=400,height=300');

            if (printWindow) {
                const imgData = canvas.toDataURL('image/png');
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Barcode Print</title>
                            <style>
                                * {
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                body {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                }
                                .barcode-container {
                                    text-align: center;
                                    border: 1px solid #ddd;
                                    padding: 20px;
                                    background: white;
                                }
                                img {
                                    display: block;
                                    margin: 0 auto 10px;
                                    max-width: 100%;
                                }
                                p {
                                    font-size: 16px;
                                    font-weight: bold;
                                    color: #333;
                                }
                                @media print {
                                    body {
                                        padding: 0;
                                    }
                                    .barcode-container {
                                        border: none;
                                    }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="barcode-container">
                                <img src="${imgData}" alt="Barcode" />
                                <p>${form.barcode}</p>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();

                setTimeout(() => {
                    printWindow.print();
                }, 300);
            }
        }
    };

    // Рисование barcode - КРИТИЧЕСКИЙ useEffect
    useEffect(() => {
        const drawBarcode = () => {
            if (canvasRef.current && form.barcode && form.barcode.length === 13 && barcodeGenerated) {
                try {
                    // Очистка canvas перед рисованием
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    const barcode12 = form.barcode.slice(0, 12);
                    JsBarcode(canvasRef.current, barcode12, {
                        format: "EAN13",
                        displayValue: true,
                        fontSize: 16,
                        lineColor: "#000",
                        width: 2,
                        height: 80,
                        margin: 10,
                    });
                } catch (error) {
                    console.error("Barcode yaratishda xatolik:", error);
                }
            }
        };

        // Небольшая задержка для надежной отрисовки
        const timer = setTimeout(drawBarcode, 50);
        return () => clearTimeout(timer);
    }, [form.barcode, barcodeGenerated, open, editMode]);

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("uz-UZ", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    return (
        <div>
            <Button
                onClick={handleOpen}
                className="text-white px-6 py-2 rounded-xl transition"
            >
                {data?.barcode || isEdit ? "Barcode tahrirlash" : "Barcode qo'shish"}
            </Button>
            <Dialog open={open} handler={handleOpen} className="p-2 max-w-2xl">
                <DialogHeader>
                    <Typography variant="h5" className="text-gray-800 font-semibold">
                        {isEdit && !editMode ? "Barcode" : isEdit ? "Barcode tahrirlash" : "Barcode yaratish"}
                    </Typography>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-4">
                    {/* Поле ввода Barcode */}
                    <div className="w-full">
                        <Input
                            label="Barcode (EAN-13)"
                            name="barcode"
                            type="text"
                            value={form.barcode}
                            onChange={handleChange}
                            className="w-full"
                            maxLength={13}
                            disabled={(isEdit && !editMode) || isSaved}
                        />
                    </div>

                    {/* Кнопка Generate - всегда доступна */}
                    <div className="w-full">
                        <Button
                            onClick={handleGenerate}
                            className="w-full bg-blue-500 text-white rounded-lg"
                            disabled={(isEdit && !editMode) || (isSaved && !editMode)}
                        >
                            Yangi barcode generatsiya qilish
                        </Button>
                    </div>

                    {/* Отображение Barcode */}
                    {barcodeGenerated && form.barcode && form.barcode.length === 13 && (
                        <div className="flex flex-col items-center border-2 rounded-lg p-4 bg-gray-50 w-full">
                            <canvas ref={canvasRef}></canvas>
                            <Typography className="mt-3 text-base text-gray-700 font-semibold">
                                {form.barcode}
                            </Typography>

                            {data?.createdAt && (
                                <Typography className="mt-2 text-gray-500 text-sm">
                                    Yaratilgan: {formatDate(data.createdAt)}
                                </Typography>
                            )}
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div className="flex flex-wrap gap-2 w-full">
                        {/* Режим просмотра (barcode существует, не в режиме редактирования) */}
                        {isEdit && !editMode && (
                            <>
                                <Button
                                    onClick={handleEdit}
                                    className="flex-1 bg-orange-500 text-white rounded-lg"
                                >
                                    Tahrirlash
                                </Button>
                                <Button
                                    onClick={handlePrint}
                                    className="flex-1 bg-green-500 text-white rounded-lg"
                                >
                                    Chop etish
                                </Button>
                            </>
                        )}

                        {/* Режим редактирования или создания */}
                        {(!isEdit || editMode) && barcodeGenerated && !isSaved && (
                            <>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-600 text-white rounded-lg"
                                >
                                    {isEdit ? "Yangilash" : "Saqlash"}
                                </Button>
                                {editMode && (
                                    <Button
                                        onClick={handleCancelEdit}
                                        className="flex-1 bg-gray-500 text-white rounded-lg"
                                    >
                                        Bekor qilish
                                    </Button>
                                )}
                            </>
                        )}

                        {/* После сохранения нового barcode */}
                        {!isEdit && isSaved && (
                            <>
                                <Button
                                    onClick={handlePrint}
                                    className="flex-1 bg-green-500 text-white rounded-lg"
                                >
                                    Chop etish
                                </Button>
                                <Button
                                    onClick={resetForm}
                                    className="flex-1 bg-blue-500 text-white rounded-lg"
                                >
                                    Yana yaratish
                                </Button>
                            </>
                        )}
                    </div>
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