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
import { useTranslation } from "react-i18next";
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi"; // 🔹 добавлено

export default function WarehouseExpensesCreate({ refresh }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cashes, setCashes] = useState([]);

    const [paymentMethods, setPaymentMethods] = useState([]); // 🔹 новое состояние

    const [form, setForm] = useState({
        amount: "",
        method_id: "", // 🔹 теперь хранится ID метода
        location_id: Cookies?.get("ul_nesw"),
        cash_id: "",
        note: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen(!open);

    const GetAllCash = async () => {
        try {
            const response = await Cash?.GetKassa(Cookies.get("ul_nesw"));
            const data = response?.data || [];
            setCashes(data);

            if (data.length > 0 && !form.cash_id) {
                setForm((prev) => ({ ...prev, cash_id: String(data[0].id) }));
            }
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    // 🔹 Получение списка методов оплаты с backend
    const getAllPaymentMethod = async () => {
        try {
            const response = await PaymentMethodApi.PaymentTypeGet(Cookies?.get("ul_nesw"));
            const methods = response?.data || [];
            setPaymentMethods(methods);

            if (methods.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    method_id: prev.method_id || String(methods[0].id),
                }));
            }
        } catch (error) {
            console.log(error);
            setPaymentMethods([]);
        }
    };

    // 🔹 форматирование чисел с пробелами
    const formatNumber = (value) => {
        const cleaned = value.replace(/\D/g, "");
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

        if (!form.method_id) {
            Alert("Выберите метод оплаты!", "warning");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...form,
                amount: Number(form.amount.replace(/\s/g, "")) || 0,
                cash_id: form.cash_id,
                method_id: form.method_id,
            };

            await Expenses.CreateExpenses(payload);
            Alert(`${t('success')}`, "success");
            setOpen(false);
            setForm({
                amount: "",
                method_id: "",
                location_id: Cookies?.get("ul_nesw"),
                cash_id: "",
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });
            refresh();
        } catch (error) {
            Alert(`${t('Error')} ${error?.response?.data?.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
            getAllPaymentMethod(); // 🔹 добавлено
        }
    }, [open]);

    return (
        <>
            <Button color="green" onClick={handleOpen}>
                + {t('Add')}
            </Button>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark"
            >
                <DialogHeader className="dark:text-text-dark">
                    {t('Create_Exp')}
                </DialogHeader>

                <DialogBody divider>
                    <div className="flex flex-col gap-4">
                        <Input
                            label={t('Summ')}
                            name="amount"
                            value={form.amount}
                            onChange={handleAmountChange}
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark",
                            }}
                            color="blue-gray"
                        />

                        <Select
                            label={t('Kassa')}
                            value={form.cash_id}
                            onChange={(val) => setForm((p) => ({ ...p, cash_id: val }))}
                            className="text-gray-900 dark:text-text-dark outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark",
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark",
                            }}
                        >
                            {cashes.map((cash) => (
                                <Option key={cash.id} value={String(cash.id)}>
                                    {`${cash.name} — ${Number(cash.balance).toLocaleString()
                                        } so'm`}
                                </Option >
                            ))
                            }
                        </Select >

                        {/* 🔹 методы оплаты, полученные с backend */}
                        < Select
                            label={t("Payment_method")}
                            value={form.method_id}
                            onChange={(val) => setForm((p) => ({ ...p, method_id: val }))}
                            className="text-gray-900 dark:text-text-dark outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark",
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark",
                            }}
                        >
                            {
                                paymentMethods.map((method) => (
                                    <Option key={method.id} value={String(method.id)}>
                                        {method.name || `Метод ${method.id}`}
                                    </Option>
                                ))
                            }
                        </Select >

                        <Textarea
                            label={t('Comment')}
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                            labelProps={{
                                className: "!text-text-light dark:!text-text-dark",
                            }}
                            color="blue-gray"
                        />
                    </div >
                </DialogBody >

                <DialogFooter>
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="mr-2"
                        disabled={loading}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button color="green" onClick={CreateExpenses} disabled={loading}>
                        {loading ? `${t('Saving')}` : `${t('Save')}`}
                    </Button>
                </DialogFooter>
            </Dialog >
        </>
    );
}
