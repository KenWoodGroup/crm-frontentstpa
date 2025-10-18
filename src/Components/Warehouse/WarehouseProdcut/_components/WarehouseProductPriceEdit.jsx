import { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
} from "@material-tailwind/react";
import { Stock } from "../../../../utils/Controllers/Stock";
import { Alert } from "../../../../utils/Alert";
import { formatNumber, unformatNumber } from "../../../../utils/Helpers/Formater";
export default function WarehouseEdit({ data }) {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(formatNumber(data?.price || 0));


    const handleOpen = () => setOpen(!open);

    const handleSave = async () => {
        try {
            const form = {
                product_id: data.product_id,
                location_id: data.location_id,
                quantity: Number(data.quantity),
                price: unformatNumber(price), // убираем пробелы перед отправкой
                barcode: data.barcode,
            };

            const response = await Stock.EditStock({
                id: data?.id,
                form: form,
            });

            handleOpen();
            Alert("Narx muvaffaqiyatli o‘zgartirildi", "success");
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message}`, "error");
        }
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\s/g, ""); // убираем пробелы во время ввода
        if (!/^\d*$/.test(rawValue)) return; // запрещаем ввод нецифровых символов
        setPrice(formatNumber(rawValue));
    };

    return (
        <>
            <Button
                size="sm"
                variant="outlined"
                color="blue"
                className="rounded-lg"
                onClick={handleOpen}
            >
                Narx o‘zgartirish
            </Button>

            <Dialog open={open} handler={handleOpen} size="xs">
                <DialogHeader>
                    <Typography variant="h6" color="blue-gray">
                        Narxni o‘zgartirish
                    </Typography>
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label="Yangi narx"
                        type="text"
                        value={price}
                        onChange={handleChange}
                    />
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2 rounded-lg"
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={handleSave}
                        className="rounded-lg"
                    >
                        Saqlash
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
