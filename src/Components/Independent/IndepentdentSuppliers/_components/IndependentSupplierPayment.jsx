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

export default function IndependentSupplierPayment({ supplier, refresh }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        status: "confirmed",
        payer_id: Cookies?.get("ul_nesw"),
        receiver_id: supplier?.id,
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
                payer_id: Cookies?.get("ul_nesw"),
                receiver_id: supplier?.id,
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

            <Dialog className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
                open={open} handler={handleOpen} size="sm">
                <DialogHeader className="flex justify-between items-center dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                    Создать оплату</DialogHeader>

                <DialogBody divider className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
                    <Input
                        label="Сумма (so'm)"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                    <Select
                        key={form.cash_id}
                        label="Выберите кассу"
                        value={form.cash_id}
                        onChange={(val) => setForm((p) => ({ ...p, cash_id: val }))}
                        className="text-gray-900 dark:text-text-dark  outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
                        }}
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
                        className="text-gray-900 dark:text-text-dark  outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
                        }}
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
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                    >
                        Отмена
                    </Button>
                    <Button
                        color="green"
                        onClick={handleSubmit}
                        className="bg-green-600 text-white hover:bg-green-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}