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
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { Alert } from "../../../../utils/Alert";
import { useTranslation } from "react-i18next";

export default function ExpensesEdit({ data, refresh }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cashes, setCashes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]); // ✅ Методы оплаты
    const formRef = useRef(null);

    const [form, setForm] = useState({
        amount: "",
        method_id: "",
        cash_id: "",
        note: "",
        location_id: Cookies?.get("ul_nesw"),
        created_by: Cookies?.get("us_nesw"),
    });

    useEffect(() => {
        formRef.current = form;
    }, [form]);

    const handleOpen = () => {
        if (!open) {
            setForm({
                amount: data?.amount
                    ? Math.floor(Number(data.amount))
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                    : "",
                method_id: data?.method_id ? String(data.method_id) : "",
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

    // ✅ Получаем методы оплаты
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
        const currentForm = formRef.current;

        if (!currentForm.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }
        if (!currentForm.method_id) {
            Alert("Выберите метод оплаты!", "warning");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                amount: Number(currentForm.amount.replace(/\s/g, "")) || 0,
                cash_id: currentForm.cash_id,
                method_id: currentForm.method_id,
                note: currentForm.note,
                location_id: currentForm.location_id,
                created_by: currentForm.created_by,
            };

            await Expenses.EditExpenses(payload, data.id);
            Alert(`${t('success')}`, "success");
            setOpen(false);
            refresh();
        } catch (error) {
            console.error("Ошибка:", error);
            Alert(
                `${t('Error')} ${error?.response?.data?.message || error.message}`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
            getAllPaymentMethod();
        }
    }, [open]);

    return (
        <>
            <Tooltip content={t('Edit')}>
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
                    {t('Edit_exp')}
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
                            key={`cash-${form.cash_id}-${cashes.length}`}
                            label={t('Kassa')}
                            value={form.cash_id || undefined}
                            onChange={(val) =>
                                setForm((prev) => ({ ...prev, cash_id: val }))
                            }
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
                                    {`${cash.name} — ${Number(cash.balance).toLocaleString()} so'm`}
                                </Option>
                            ))}
                        </Select>

                        {/* ✅ Динамические методы оплаты */}
                        <Select
                            label={t("Payment_method")}
                            value={form.method_id || ""}
                            onChange={(val) =>
                                setForm((prev) => ({ ...prev, method_id: val }))
                            }
                            className="text-gray-900 dark:text-text-dark outline-none"
                            labelProps={{
                                className: "text-gray-700 dark:text-text-dark",
                            }}
                            menuProps={{
                                className: "dark:bg-gray-800 dark:text-text-dark",
                            }}
                        >
                            {paymentMethods.map((method) => (
                                <Option key={method.id} value={String(method.id)}>
                                    {method.name || `Метод ${method.id}`}
                                </Option>
                            ))}
                        </Select>

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
                    </div>
                </DialogBody>

                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleOpen} className="mr-2">
                        {t('Cancel')}
                    </Button>
                    <Button color="blue" onClick={handleEdit} disabled={loading}>
                        {loading ? `${t('Saving')}` : `${t('Save')}`}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}
