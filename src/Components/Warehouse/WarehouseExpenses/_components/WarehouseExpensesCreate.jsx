import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Input,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";
import Cookies from "js-cookie";

import { Expenses } from "../../../../utils/Controllers/Expenses";
import { Cash } from "../../../../utils/Controllers/Cash";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseExpensesCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cashes, setCashes] = useState([]);

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        location_id: Cookies?.get('ul_nesw'),
        cash_id: "",
        note: "",
        created_by: Cookies?.get('us_nesw'),
    });

    const handleOpen = () => setOpen(!open);

    const GetAllCash = async () => {
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];
            setCashes(data);

            // Автоматически выбираем первую кассу
            if (data.length > 0 && !form.cash_id) {
                setForm((prev) => ({ ...prev, cash_id: String(data[0].id) }));
            }
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    // 🔹 форматирование чисел с пробелами
    const formatNumber = (value) => {
        const cleaned = value.replace(/\D/g, ""); // удаляем всё, кроме цифр
        if (!cleaned) return "";
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        const formatted = formatNumber(value);
        setForm((prev) => ({
            ...prev,
            amount: formatted,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const CreateExpenses = async () => {
        if (!form.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...form,
                amount: Number(form.amount.replace(/\s/g, "")) || 0,
                cash_id: form.cash_id
            };

            const response = await Expenses.CreateExpenses(payload);
            Alert("Muvaffaqiyatli yaratildi", "success");
            setOpen(false);
            setForm({
                amount: "",
                method: "cash",
                location_id: Cookies?.get('ul_nesw'),
                cash_id: "",
                note: "",
                created_by: Cookies?.get('us_nesw'),
            });
            refresh();
        } catch (error) {
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) GetAllCash();
    }, [open]);

    return (
        <>
            <Button color="green" onClick={handleOpen}>
                Создать Расход
            </Button>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Создать новый расход</DialogHeader>
                <DialogBody divider>
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Сумма (so'm)"
                            name="amount"
                            value={form.amount}
                            onChange={handleAmountChange}
                            placeholder=""
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
                            <Option value="cash">Наличные</Option>
                            <Option value="card">Карта</Option>
                            <Option value="transfer">Банк</Option>
                        </Select>

                        <Textarea
                            label="Комментарий"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                        />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" color="gray" onClick={handleOpen} className="mr-2">
                        Отмена
                    </Button>
                    <Button color="green" onClick={CreateExpenses} disabled={loading}>
                        {loading ? "Создание..." : "Создать"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}