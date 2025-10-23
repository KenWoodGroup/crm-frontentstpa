import React, { useState } from "react";
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
import { Alert } from "../../../../utils/Alert";

export default function WarehouseExpensesCreate({ refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        location_id: Cookies?.get('ul_nesw'),
        note: "",
        created_by: Cookies?.get('us_nesw'),
    });

    const handleOpen = () => setOpen(!open);

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
        try {
            setLoading(true);
            const payload = {
                ...form,
                amount: Number(form.amount.replace(/\s/g, "")) || 0,
            };

            const response = await Expenses.CreateExpenses(payload);
            Alert("Muvaffaqiyatli yaratildi ", "success");
            setOpen(false);
            refresh()
        } catch (error) {
            Alert(`Xatolik yuz berdi ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

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
                            label="Сумма"
                            name="amount"
                            value={form.amount}
                            onChange={handleAmountChange}
                            placeholder=""
                        />

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
