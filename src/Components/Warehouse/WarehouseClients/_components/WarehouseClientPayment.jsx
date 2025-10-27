import React, { useEffect, useState } from "react";
import {
    Dialog, DialogHeader, DialogBody, DialogFooter,
    Button, Input, Select, Option, IconButton, Tooltip, Textarea,
} from "@material-tailwind/react";
import { BanknoteArrowDown } from "lucide-react";
import Cookies from "js-cookie";

import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { Cash } from "../../../../utils/Controllers/Cash";

export default function WarehouseClientPayment({ client, refresh }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        status: "confirmed",
        payer_id: client?.id,
        receiver_id: Cookies?.get("ul_nesw"),
        cash_id: "",
        note: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen((p) => !p);

    const GetAllCash = async () => {
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];
            setCashes(data);

            // Если есть кассы и cash_id пустой, установим первую кассу по умолчанию
            if (data.length > 0 && !form.cash_id) {
                setForm((prev) => ({ ...prev, cash_id: String(data[0].id) }));
            }
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    const formatNumber = (value) => {
        if (!value) return "";
        const numericValue = value.replace(/\D/g, "");
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "amount") {
            setForm((prev) => ({ ...prev, amount: formatNumber(value) }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!form.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }
        try {
            const numericAmount = Number(form.amount.replace(/\s/g, ""));
            const payload = {
                ...form,
                amount: numericAmount,
                cash_id: form.cash_id
            };

            await Payment.Payment(payload);
            Alert("Оплата успешно создана", "success");

            handleOpen();
            setForm({
                amount: "",
                method: "cash",
                status: "confirmed",
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                cash_id: "",
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });

            if (refresh) refresh();
        } catch (error) {
            console.log("Ошибка:", error);
            Alert("Ошибка при создании оплаты", "error");
        }
    };

    useEffect(() => {
        if (open) GetAllCash();
    }, [open]);

    return (
        <>
            <Tooltip content="Сделать оплату">
                <IconButton variant="text" color="green" onClick={handleOpen}>
                    <BanknoteArrowDown size={18} />
                </IconButton>
            </Tooltip>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создать оплату</DialogHeader>

                <DialogBody divider className="flex flex-col gap-4">
                    <Input
                        label="Сумма (so'm)"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                    />
                    <Select
                        key={form.cash_id} // Добавьте эту строку
                        label="Выберите кассу"
                        value={form.cash_id}
                        onChange={(val) => setForm((p) => ({ ...p, cash_id: val }))}
                    >
                        {cashes.map((cash) => (
                            <Option key={cash.id} value={String(cash.id)}>
                                {`${cash.name} — ${Number(cash.balance).toLocaleString()} so'm (${new Date(
                                    cash.createdAt
                                ).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })})`}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        label="Метод оплаты"
                        value={form.method}
                        onChange={(val) => setForm((p) => ({ ...p, method: val }))}
                    >
                        <Option value="cash">Naqd (Cash)</Option>
                        <Option value="transfer">O'tkazma (Transfer)</Option>
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
                    <Button variant="text" color="red" onClick={handleOpen} className="mr-2">
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