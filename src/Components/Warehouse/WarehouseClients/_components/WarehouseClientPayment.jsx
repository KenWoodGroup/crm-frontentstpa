import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
    IconButton,
    Tooltip,
    Textarea,
} from "@material-tailwind/react";
import { BanknoteArrowDown } from "lucide-react";
import Cookies from "js-cookie";

import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseClientPayment({ client, refresh }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        status: "confirmed",
        payer_id: client?.id,
        receiver_id: Cookies?.get(`ul_nesw`),
        
        note: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    // форматирование суммы с пробелами
    const formatNumber = (value) => {
        if (!value) return "";
        const numericValue = value.replace(/\D/g, "");
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // обработка изменений
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "amount") {
            setForm((prev) => ({
                ...prev,
                amount: formatNumber(value),
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            // удаляем пробелы перед отправкой
            const numericAmount = Number(form.amount.replace(/\s/g, ""));

            const payload = {
                ...form,
                amount: numericAmount,
            };

            await Payment.Payment(payload);
            Alert("Muvaffaqiyatli", "success");

            handleOpen();
            setForm({
                amount: "",
                method: "cash",
                status: "confirmed",
                payer_id: client?.id,
                receiver_id: Cookies?.get(`ul_nesw`),
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });

            if (refresh) refresh();
        } catch (error) {
            console.log("Xato:", error);
            Alert("To‘lovni yaratishda xato", "error");
        }
    };

    return (
        <>
            {/* Иконка открытия модала */}
            <Tooltip content="Сделать оплату">
                <IconButton variant="text" color="green" onClick={handleOpen}>
                    <BanknoteArrowDown size={18} />
                </IconButton>
            </Tooltip>

            {/* Модал */}
            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создать оплату</DialogHeader>
                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Сумма (so‘m)"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                    />

                    <Select
                        label="Метод оплаты"
                        name="method"
                        value={form.method}
                        onChange={(val) =>
                            setForm((p) => ({ ...p, method: val }))
                        }
                    >
                        <Option value="cash">Naqd (Cash)</Option>
                        <Option value="transfer">O‘tkazma (Transfer)</Option>
                        <Option value="card">Karta orqali</Option>
                    </Select>

                    <Textarea
                        label="Izoh"
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                    />
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                    >
                        Отменить
                    </Button>
                    <Button color="green" onClick={handleSubmit}>
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
