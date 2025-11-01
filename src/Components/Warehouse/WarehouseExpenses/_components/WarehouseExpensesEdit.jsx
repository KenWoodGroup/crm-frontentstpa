import React, { useState, useEffect, useRef } from "react";
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
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { Edit } from "lucide-react";
import Cookies from "js-cookie";
import { Expenses } from "../../../../utils/Controllers/Expenses";
import { Cash } from "../../../../utils/Controllers/Cash";
import { Alert } from "../../../../utils/Alert";

export default function WarehouseExpensesEdit({ data, refresh }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cashes, setCashes] = useState([]);
    const formRef = useRef(null); // 🔹 Для актуального состояния

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        cash_id: "",
        note: "",
        location_id: Cookies?.get("ul_nesw"),
        created_by: Cookies?.get("us_nesw"),
    });

    // 🔹 Синхронизируем ref с state
    useEffect(() => {
        formRef.current = form;
    }, [form]);

    const handleOpen = () => {
        if (!open) {
            // При открытии диалога заполняем форму данными
            setForm({
                amount: data?.amount
                    ? Math.floor(Number(data.amount))
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    : "",
                method: data?.method || "cash",
                cash_id: data?.cash?.id ? String(data.cash.id) : "",
                note: data?.note || "",
                location_id: data?.location_id || Cookies?.get("ul_nesw"),
                created_by: Cookies?.get("us_nesw"),
            });
        }
        setOpen(!open);
    };

    const GetAllCash = async () => {
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const cashData = response?.data || [];
            setCashes(cashData);
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    // 🔹 форматирование числа с пробелами
    const formatNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
        if (!cleaned) return "";
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        const formatted = formatNumber(value);
        setForm((prev) => ({ ...prev, amount: formatted }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleEdit = async () => {
        const currentForm = formRef.current; // 🔹 Берём актуальное состояние из ref

        console.log("🔴 Current form from ref:", currentForm); // 🔹 Для отладки
        console.log("🔴 cash_id from form:", currentForm.cash_id);

        if (!currentForm.cash_id || currentForm.cash_id === "") {
            Alert("Выберите кассу!", "warning");
            return;
        }

        try {
            setLoading(true);

            // 🔹 НЕ конвертируем cash_id в Number, оставляем как UUID string
            const payload = {
                amount: Number(currentForm.amount.replace(/\s/g, "")) || 0,
                cash_id: currentForm.cash_id, // 🔹 ОСТАВЛЯЕМ СТРОКОЙ (UUID)
                method: currentForm.method,
                note: currentForm.note,
                location_id: currentForm.location_id,
                created_by: currentForm.created_by,
            };

            console.log("🟢 Payload before sending:", JSON.stringify(payload, null, 2));
            console.log("🟢 cash_id type:", typeof payload.cash_id);
            console.log("🟢 cash_id value:", payload.cash_id);

            await Expenses.EditExpenses(payload, data.id);
            Alert("Расход успешно обновлён", "success");
            setOpen(false);
            refresh();
        } catch (error) {
            console.error("🔴 Error:", error);
            Alert(
                `Ошибка при обновлении: ${error?.response?.data?.message || error.message}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
        }
    }, [open]);

    return (
        <>
            <Tooltip content="Изменить">
                <IconButton variant="text" color="blue" onClick={handleOpen}>
                    <Edit size={18} />
                </IconButton>
            </Tooltip>

            <Dialog
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
                open={open}
                handler={handleOpen}
                size="sm"
            >
                <DialogHeader className="dark:text-text-dark">
                    Редактировать расход
                </DialogHeader>

                <DialogBody divider>
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Сумма (so'm)"
                            name="amount"
                            value={form.amount}
                            onChange={handleAmountChange}
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark"
                            }}
                            color="blue-gray"
                        />

                        <Select
                            key={`cash-select-${form.cash_id}-${cashes.length}`}
                            className="text-gray-900 dark:text-text-dark outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark"
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark"
                            }}
                            label="Выберите кассу"
                            value={form.cash_id || undefined}
                            onChange={(val) => {
                                console.log("Selected cash_id:", val, "Type:", typeof val); // 🔹 Отладка
                                setForm((prev) => ({ ...prev, cash_id: val ? String(val) : "" }));
                            }}
                        >
                            {cashes.map((cash) => (
                                <Option key={cash.id} value={String(cash.id)}>
                                    {cash.name}
                                </Option>
                            ))}
                        </Select>

                        <Select
                            label="Метод оплаты"
                            value={form.method}
                            onChange={(val) => setForm((prev) => ({ ...prev, method: val }))}
                            className="text-gray-900 dark:text-text-dark outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark"
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark"
                            }}
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
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            containerProps={{
                                className: "!min-w-0",
                            }}
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark"
                            }}
                            color="blue-gray"
                        />
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleOpen} className="mr-2">
                        Отмена
                    </Button>
                    <Button color="blue" onClick={handleEdit} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}