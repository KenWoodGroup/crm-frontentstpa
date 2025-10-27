import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Select,
    Option,
    Textarea,
} from "@material-tailwind/react";
import Cookies from "js-cookie";
import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { Cash } from "../../../../utils/Controllers/Cash";

export default function WarehouseClientDetailPayment({ client, refresh, invoice }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);

    const [form, setForm] = useState({
        amount: "",
        method: "cash",
        status: "confirmed",
        payer_id: client?.id,
        receiver_id: Cookies?.get("ul_nesw"),
        note: "",
        cash_id: "",
        created_by: Cookies?.get("us_nesw"),
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
            const numericAmount = Number(form.amount.replace(/\s/g, ""));

            // формируем payload динамически
            const payload = {
                ...form,
                amount: numericAmount,
            };

            // если invoice передан — добавляем поле invoices
            if (invoice) {
                payload.invoices = [{ invoice_id: invoice.id }];
            }

            await Payment.Payment(payload);
            Alert("Muvaffaqiyatli", "success");

            handleOpen();
            setForm({
                amount: "",
                method: "cash",
                status: "confirmed",
                cash_id: "",
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });

            if (refresh) refresh();
        } catch (error) {
            console.log("Xato:", error);
            Alert("To‘lovni yaratishda xato", "error");
        }
    };

    useEffect(() => {
        if (open) GetAllCash();
    }, [open]);


    return (
        <>
            <Button className="py-[10px]" color="green" onClick={handleOpen}>
                Оплатить
            </Button>

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
