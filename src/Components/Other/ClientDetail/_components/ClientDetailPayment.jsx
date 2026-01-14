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
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { useTranslation } from "react-i18next";

export default function ClientDetailPayment({ client, refresh, invoice }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t } = useTranslation();

    const [form, setForm] = useState({
        amount: "",
        method_id: "", // меняем на method_id для ID метода оплаты
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

            if (data.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    cash_id: prev.cash_id || String(data[0].id)
                }));
            }
        } catch (error) {
            console.log(error);
            setCashes([]);
        }
    };

    const getAllPaymentMethod = async () => {
        try {
            const response = await PaymentMethodApi.PaymentTypeGet(Cookies?.get("ul_nesw"));
            const methods = response?.data || [];
            setPaymentMethods(methods);

            if (methods.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    method_id: prev.method_id || String(methods[0].id)
                }));
            }
        } catch (error) {
            console.log(error);
            setPaymentMethods([]);
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
        if (!form.cash_id) {
            Alert("Выберите кассу!", "warning");
            return;
        }
        if (!form.method_id) {
            Alert("Выберите метод оплаты!", "warning");
            return;
        }

        try {

            // формируем payload динамически
            const payload = {
                ...form,
                amount: form.amount.replace(/\s/g, ""),
                method_id: form.method_id, // отправляем ID метода оплаты
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
                method_id: "",
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
            Alert("To'lovni yaratishda xato", "error");
        }
    };

    useEffect(() => {
        if (open) {
            GetAllCash();
            getAllPaymentMethod();
        } else {
            // Сбрасываем форму при закрытии диалога
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                cash_id: "",
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });
        }
    }, [open]);

    return (
        <>
            <Button className="py-[10px]" color="green" onClick={handleOpen}>
                {t('Payment')}
            </Button>

            <Dialog className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
                open={open} handler={handleOpen} size="sm">
                <DialogHeader className="flex justify-between items-center dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                    {t('Create_Payment')}
                </DialogHeader>

                <DialogBody divider className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark">
                    <Input
                        label={t('Price__sum')}
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        color="blue-gray"
                        className="!text-text-light dark:!text-text-dark placeholder-gray-500 dark:placeholder-gray-400"
                        labelProps={{
                            className: "!text-text-light dark:!text-text-dark",
                        }}
                    />

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-700 dark:text-text-dark">
                            {t("Kassa")}
                        </label>

                        <select
                            value={form.cash_id}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, cash_id: e.target.value }))
                            }
                            className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800
            px-3 py-2 text-sm
            text-gray-900 dark:text-text-dark
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition
        "
                        >
                            <option value="" disabled>
                                {t("Select")}
                            </option>

                            {cashes.map((cash) => (
                                <option key={cash.id} value={String(cash.id)}>
                                    {`${cash.name} — ${Number(cash.balance).toLocaleString()} so'm`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-700 dark:text-text-dark">
                            {t("Payment_type")}
                        </label>

                        <select
                            value={form.method_id}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, method_id: e.target.value }))
                            }
                            className="
            w-full rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800
            px-3 py-2 text-sm
            text-gray-900 dark:text-text-dark
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition
        "
                        >
                            <option value="" disabled>
                                {t("Select")}
                            </option>

                            {paymentMethods.map((method) => (
                                <option key={method.id} value={String(method.id)}>
                                    {method.name || `Метод ${method.id}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Textarea
                        label={t('Comment')}
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
                        className="mr-2"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button color="green" onClick={handleSubmit}>
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}