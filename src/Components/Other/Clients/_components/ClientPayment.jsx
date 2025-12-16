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
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { useTranslation } from "react-i18next";

export default function ClientPayment({ client, refresh }) {
    const [open, setOpen] = useState(false);
    const [cashes, setCashes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t } = useTranslation();


    const [form, setForm] = useState({
        amount: "",
        method_id: "",
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
        if (!form.method_id) {
            Alert("Выберите метод оплаты!", "warning");
            return;
        }
        try {
            const numericAmount = Number(form.amount.replace(/\s/g, ""));
            const payload = {
                ...form,
                amount: numericAmount,
                cash_id: form.cash_id,
                method_id: form.method_id,
            };

            await Payment.Payment(payload);
            Alert(`${t(`success`)}`, "success");

            handleOpen();
            // Сбрасываем форму после успешной отправки
            setForm({
                amount: "",
                method_id: "",
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
            Alert(`${t('Error_occurred')}`, "error");
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
                payer_id: client?.id,
                receiver_id: Cookies?.get("ul_nesw"),
                cash_id: "",
                note: "",
                created_by: Cookies?.get("us_nesw"),
            });
        }
    }, [open]);

    return (
        <>
            <Tooltip content={t('Create_Payment')}>
                <IconButton
                    variant="text"
                    color="green"
                    onClick={handleOpen}
                >
                    <BanknoteArrowDown size={18} />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                handler={handleOpen}
                size="sm"
                className="dark:bg-card-dark dark:text-text-dark bg-white text-gray-900 rounded-xl transition-colors duration-300"
            >
                <DialogHeader className="flex justify-between items-center dark:text-text-dark border-b border-gray-200 dark:border-gray-700">
                    {t('Create_Payment')}
                </DialogHeader>

                <DialogBody
                    divider
                    className="flex flex-col gap-4 dark:bg-card-dark dark:text-text-dark"
                >
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

                <DialogFooter className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 dark:bg-card-dark">
                    <Button
                        variant="text"
                        color="red"
                        onClick={handleOpen}
                        className="dark:text-gray-300"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        color="green"
                        onClick={handleSubmit}
                        className="bg-green-600 text-white hover:bg-green-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 transition-colors"
                    >
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}