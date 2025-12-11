import React, { useEffect, useState } from "react";
import {
    Dialog, DialogHeader, DialogBody, DialogFooter,
    Button, Input, Select, Option, IconButton, Tooltip, Textarea,
} from "@material-tailwind/react";
import { BanknoteArrowDown } from "lucide-react";
import Cookies from "js-cookie";
import { Payment } from "../../../../utils/Controllers/Payment";
import { Alert } from "../../../../utils/Alert";
import { PaymentMethodApi } from "../../../../utils/Controllers/PaymentMethodApi";
import { useTranslation } from "react-i18next";

export default function PaymentCash({ cashId, refresh }) {
    const [open, setOpen] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { t } = useTranslation();


    const [form, setForm] = useState({
        amount: "",
        method_id: "",
        cash_id: cashId,
        status: "confirmed",
        payer_id: Cookies?.get("ul_nesw"),
        receiver_id: Cookies?.get("ul_nesw"),
        note: "",
        created_by: Cookies?.get("us_nesw"),
    });

    const handleOpen = () => setOpen((p) => !p);


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

            await Payment.PaymentCash(payload);
            Alert(`${t(`success`)}`, "success");

            handleOpen();
            // Сбрасываем форму после успешной отправки
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                payer_id: Cookies?.get("ul_nesw"),
                receiver_id: Cookies?.get("ul_nesw"),
                cash_id: cashId,
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
            getAllPaymentMethod();
        } else {
            // Сбрасываем форму при закрытии диалога
            setForm({
                amount: "",
                method_id: "",
                status: "confirmed",
                payer_id: Cookies?.get("ul_nesw"),
                receiver_id: Cookies?.get("ul_nesw"),
                cash_id: cashId,
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

                    <Select
                        label={t('Payment_type')}
                        value={form.method_id}
                        onChange={(val) => setForm((p) => ({ ...p, method_id: val }))}
                        className="text-gray-900 dark:text-text-dark outline-none"
                        labelProps={{
                            className: "text-gray-700 dark:text-text-dark"
                        }}
                        menuProps={{
                            className: "dark:bg-gray-800 dark:text-text-dark"
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