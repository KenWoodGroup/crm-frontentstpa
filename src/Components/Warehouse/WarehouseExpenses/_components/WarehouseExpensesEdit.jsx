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

    const [form, setForm] = useState({
        amount: data?.amount
            ? Math.floor(Number(data.amount))
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            : "",
        method: data?.method || "cash",
        cash_id: data?.cash_id ? String(data.cash_id) : "",
        note: data?.note || "",
        location_id: data?.location_id || Cookies?.get("ul_nesw"),
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen(!open);

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
        if (!form.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...form,
                amount: Number(form.amount.replace(/\s/g, "")) || 0,
                cash_id: Number(form.cash_id),
            };

            await Expenses.EditExpenses(payload, data.id);
            Alert("Расход успешно обновлён", "success");
            setOpen(false);
            refresh();
        } catch (error) {
            Alert(
                `Ошибка при обновлении: ${error?.response?.data?.message || error.message}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) GetAllCash();
    }, [open]);

    return (
        <>
            <Tooltip content="Изменить">
                <IconButton variant="text" color="blue" onClick={handleOpen}>
                    <Edit size={18} />
                </IconButton>
            </Tooltip>

            <Dialog open={open} handler={handleOpen} size="sm">
                <DialogHeader>Редактировать расход</DialogHeader>

                <DialogBody divider>
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Сумма (so'm)"
                            name="amount"
                            value={form.amount}
                            onChange={handleAmountChange}
                        />

                        <Select
                            key={`cash-select-${form.cash_id}-${cashes.length}`}
                            label="Выберите кассу"
                            value={form.cash_id}
                            onChange={(val) => setForm((p) => ({ ...p, cash_id: String(val) }))}
                        >
                            {cashes.map((cash) => (
                                <Option key={cash.id} value={String(cash.id)}>
                                    {`${cash.name}`}
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
                    <Button color="blue" onClick={handleEdit} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}