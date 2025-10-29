import { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    Switch,
} from "@material-tailwind/react";
import { Stock } from "../../../../utils/Controllers/Stock";
import { Alert } from "../../../../utils/Alert";
import { formatNumber, unformatNumber } from "../../../../utils/Helpers/Formater";

export default function WarehouseEdit({ data }) {
    const [open, setOpen] = useState(false);
    const [price, setPrice] = useState(formatNumber(data?.sale_price || 0));
    const [fixedQuantity, setFixedQuantity] = useState(!!data?.fixed_quantity);

    const handleOpen = () => setOpen(!open);

    const handleSave = async () => {
        try {
            const form = {
                fixed_quantity: fixedQuantity, 
                barcode: data.barcode,
                sale_price: unformatNumber(price),
            };

            const response = await Stock.EditStock({
                id: data?.id,
                form: form,
            });

            handleOpen();
            Alert("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
        } catch (error) {
            console.log(error);
            Alert(`Xatolik yuz berdi: ${error?.response?.data?.message || error.message}`, "error");
        }
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\s/g, "");
        if (!/^\d*$/.test(rawValue)) return;
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
                        Ma'lumotlarni tahrirlash
                    </Typography>
                </DialogHeader>

                <DialogBody className="flex flex-col gap-4">
                    <Input
                        label="Yangi narx"
                        type="text"
                        value={price}
                        onChange={handleChange}
                    />

                    <div className="flex items-center justify-between">
                        <Typography variant="small" color="blue-gray">
                            Cheklangan (fixed_quantity)
                        </Typography>
                        <Switch
                            color="blue"
                            checked={fixedQuantity}
                            onChange={(e) => setFixedQuantity(e.target.checked)}
                            label={fixedQuantity ? "Cheklangan" : "Cheklanmagan"}
                        />
                    </div>
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
